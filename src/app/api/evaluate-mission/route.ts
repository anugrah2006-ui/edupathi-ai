import { NextRequest, NextResponse } from "next/server";
import { evaluateMissionSubmission } from "@/lib/gemini";
import { saveSubmissionToSupabase } from "@/lib/supabase";
import { TodayMissionSchema, ResumeAnalysisSchema } from "@/lib/schemas";

// ─── POST /api/evaluate-mission ─────────────────────────────────
// Accepts: { mission: TodayMission, submissionText: string, learnerProfile?: ResumeAnalysis, missionId?: string }
// Returns: { score: number, feedback: string, strengths: string[], weaknesses: string[], passed: boolean, supabaseSaved: boolean }

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mission, submissionText, learnerProfile, missionId } = body;

    if (!mission) {
      return NextResponse.json(
        { error: "Missing mission data in request body." },
        { status: 400 }
      );
    }

    if (!submissionText || typeof submissionText !== "string" || submissionText.trim().length < 5) {
      return NextResponse.json(
        { error: "Submission text is required and must be at least 5 characters." },
        { status: 400 }
      );
    }

    // Validate mission object structure
    const validatedMission = TodayMissionSchema.safeParse(mission);
    if (!validatedMission.success) {
      return NextResponse.json(
        {
          error: "Invalid mission format.",
          details: validatedMission.error.issues.map((i) => i.message),
        },
        { status: 400 }
      );
    }

    // Optional profile validation
    let validatedProfile = null;
    if (learnerProfile) {
      const parsedProfile = ResumeAnalysisSchema.safeParse(learnerProfile);
      if (parsedProfile.success) {
        validatedProfile = parsedProfile.data;
      }
    }

    // Evaluate submission with Gemini
    const evaluation = await evaluateMissionSubmission({
      mission: validatedMission.data,
      submissionText,
      learnerProfile: validatedProfile,
    });

    // Save to Supabase if missionId is provided
    let supabaseSaved = false;
    if (missionId) {
      supabaseSaved = await saveSubmissionToSupabase({
        missionId,
        submissionText,
        evaluation,
      });
    }

    return NextResponse.json({
      ...evaluation,
      supabaseSaved,
    });
  } catch (error) {
    console.error("Error in /api/evaluate-mission:", error);

    const message =
      error instanceof Error ? error.message : "AI mission evaluation failed.";

    if (message.includes("API_KEY") || message.includes("GEMINI_API_KEY")) {
      return NextResponse.json(
        { error: "AI service is not configured. Please check GEMINI_API_KEY." },
        { status: 503 }
      );
    }

    if (message.includes("RATE_LIMIT") || message.includes("429")) {
      return NextResponse.json(
        { error: "AI service is currently busy. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Failed to evaluate mission submission: " + message },
      { status: 500 }
    );
  }
}
