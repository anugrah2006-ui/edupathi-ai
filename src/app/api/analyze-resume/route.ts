import { NextRequest, NextResponse } from "next/server";
import { analyzeResume } from "@/lib/gemini";

// ─── POST /api/analyze-resume ───────────────────────────────────
// Accepts: multipart/form-data with a PDF file ("file" field)
//          and/or a "resumeText" field as fallback.
// Returns: Structured learner profile JSON.

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const textFallback = formData.get("resumeText") as string | null;

    let resumeText = "";

    // ─── Extract text from PDF ────────────────────────────────
    if (file) {
      // Validate file type
      if (file.type !== "application/pdf") {
        return NextResponse.json(
          { error: "Only PDF files are accepted." },
          { status: 400 }
        );
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "File must be under 5MB." },
          { status: 400 }
        );
      }

      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { PDFParse } = (await import("pdf-parse")) as unknown as {
          PDFParse: new (options: { data: Uint8Array }) => {
            getText: () => Promise<{ text?: string }>;
            destroy: () => Promise<void>;
          };
        };
        const parser = new PDFParse({ data: new Uint8Array(buffer) });
        try {
          const result = await parser.getText();
          resumeText = result.text || "";
        } finally {
          await parser.destroy();
        }

        if (!resumeText || resumeText.trim().length < 50) {
          return NextResponse.json(
            {
              error:
                "Could not extract meaningful text from the PDF. " +
                "The file may be a scanned image or empty. Please paste your resume text instead.",
            },
            { status: 422 }
          );
        }
      } catch (pdfError) {
        console.error("PDF extraction error:", pdfError);
        return NextResponse.json(
          {
            error:
              "Failed to read the PDF file. It may be corrupted or password-protected. " +
              "Please try a different file or paste your resume text.",
          },
          { status: 422 }
        );
      }
    } else if (textFallback && textFallback.trim().length > 50) {
      resumeText = textFallback;
    } else {
      return NextResponse.json(
        {
          error:
            "No resume provided. Upload a PDF or paste at least 50 characters of resume text.",
        },
        { status: 400 }
      );
    }

    // ─── Analyze with Gemini ──────────────────────────────────
    try {
      const analysis = await analyzeResume(resumeText);
      return NextResponse.json({ profile: analysis });
    } catch (geminiError) {
      console.error("Gemini analysis error:", geminiError);

      const message =
        geminiError instanceof Error
          ? geminiError.message
          : "AI analysis failed";

      // Check for specific error types
      if (message.includes("API_KEY") || message.includes("GEMINI_API_KEY")) {
        return NextResponse.json(
          { error: "AI service is not configured. Please contact support." },
          { status: 503 }
        );
      }

      if (message.includes("RATE_LIMIT") || message.includes("429")) {
        return NextResponse.json(
          {
            error:
              "AI service is temporarily busy. Please wait a moment and try again.",
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          error:
            "AI analysis encountered an error. Please try again. " +
            "If the issue persists, try pasting your resume text instead.",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Unexpected error in analyze-resume:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
