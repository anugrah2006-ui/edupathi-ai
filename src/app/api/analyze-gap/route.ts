import { NextRequest, NextResponse } from "next/server";
import { analyzeSkillGap } from "@/lib/gemini";
import { TARGET_ROLES } from "@/lib/mock-data";
import { ResumeAnalysisSchema } from "@/lib/schemas";

// ─── POST /api/analyze-gap ──────────────────────────────────────
// Accepts: JSON body with { profile: ResumeAnalysis, roleId: string }
// Returns: SkillGapAnalysis JSON.

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { profile, roleId } = body;

    if (!profile || !roleId) {
      return NextResponse.json(
        { error: "Missing profile or roleId in request body." },
        { status: 400 }
      );
    }

    // Validate the incoming profile just to be safe
    const validatedProfile = ResumeAnalysisSchema.safeParse(profile);
    if (!validatedProfile.success) {
      return NextResponse.json(
        { error: "Invalid learner profile format." },
        { status: 400 }
      );
    }

    // Find the target role
    const targetRole = TARGET_ROLES.find((r) => r.id === roleId);
    if (!targetRole) {
      return NextResponse.json(
        { error: `Target role '${roleId}' not found.` },
        { status: 404 }
      );
    }

    // Call Gemini to analyze the skill gaps
    const gapAnalysis = await analyzeSkillGap(validatedProfile.data, targetRole);

    return NextResponse.json({ analysis: gapAnalysis });
  } catch (error) {
    console.error("Error in /api/analyze-gap:", error);
    
    const message = error instanceof Error ? error.message : "AI analysis failed";

    if (message.includes("API_KEY") || message.includes("GEMINI_API_KEY")) {
      return NextResponse.json(
        { error: "AI service is not configured. Please contact support." },
        { status: 503 }
      );
    }

    if (message.includes("RATE_LIMIT") || message.includes("429")) {
      return NextResponse.json(
        { error: "AI service is temporarily busy. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred during skill gap analysis." },
      { status: 500 }
    );
  }
}
