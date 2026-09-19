import { NextRequest, NextResponse } from "next/server";
import { generateRoadmapAndMission } from "@/lib/gemini";
import { TARGET_ROLES } from "@/lib/mock-data";
import { saveRoadmapToSupabase } from "@/lib/supabase";
import type { ResumeAnalysis, AnalyzedSkillGap } from "@/lib/schemas";

// ─── POST /api/generate-roadmap ─────────────────────────────────
// Accepts: { profile: ResumeAnalysis, skillGaps: AnalyzedSkillGap[], roleId: string }
// Returns: { roadmap: RoadmapPlan, todayMission: TodayMission, supabase: { roadmapId, missionId, storedInSupabase } }

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { profile, skillGaps, roleId } = body as {
      profile: ResumeAnalysis;
      skillGaps: AnalyzedSkillGap[];
      roleId: string;
    };

    if (!profile || !profile.skills || profile.skills.length === 0) {
      return NextResponse.json(
        { error: "Learner profile is missing or has no skills." },
        { status: 400 }
      );
    }

    if (!skillGaps || !Array.isArray(skillGaps) || skillGaps.length === 0) {
      return NextResponse.json(
        { error: "Skill gap analysis is required to generate a personalized roadmap." },
        { status: 400 }
      );
    }

    const targetRole = TARGET_ROLES.find((r) => r.id === roleId) || TARGET_ROLES[0];

    // 1. Generate via Gemini
    try {
      const { roadmap, todayMission } = await generateRoadmapAndMission(
        profile,
        skillGaps,
        targetRole
      );

      // 2. Persist in Supabase
      const supabaseResult = await saveRoadmapToSupabase({
        userId: profile.name || "guest_learner",
        targetRoleId: targetRole.id,
        targetRoleTitle: targetRole.title,
        learnerProfile: profile,
        skillGaps: skillGaps,
        roadmap: roadmap,
        todayMission: todayMission,
      });

      return NextResponse.json({
        roadmap,
        todayMission,
        supabase: supabaseResult,
      });
    } catch (geminiError) {
      console.error("Gemini Roadmap Generation Error:", geminiError);

      const message =
        geminiError instanceof Error
          ? geminiError.message
          : "AI roadmap generation failed.";

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
        { error: "Failed to generate AI roadmap. " + message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Unexpected error in generate-roadmap route:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
