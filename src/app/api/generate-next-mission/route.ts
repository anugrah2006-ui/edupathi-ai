import { NextRequest, NextResponse } from "next/server";
import { generateAdaptiveNextMission } from "@/lib/gemini";
import { saveNextMissionToSupabase } from "@/lib/supabase";
import {
  TodayMissionSchema,
  MissionEvaluationResultSchema,
  AnalyzedSkillGapSchema,
  ResumeAnalysisSchema,
  RoadmapPlanSchema,
} from "@/lib/schemas";
import { z } from "zod";

// ─── POST /api/generate-next-mission ────────────────────────────
// Accepts: {
//   currentMission: TodayMission,
//   evaluation: MissionEvaluationResult,
//   learnerProfile?: ResumeAnalysis,
//   skillGaps: AnalyzedSkillGap[],
//   roadmap?: RoadmapPlan,
//   roadmapId?: string
// }
// Returns: AdaptiveNextMissionResponse JSON

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const currentMissionInput = body.currentMission || body.mission;
    const { evaluation, learnerProfile, skillGaps, roadmap, roadmapId } = body;

    if (!currentMissionInput) {
      return NextResponse.json(
        { error: "Missing current mission data in request body." },
        { status: 400 }
      );
    }

    if (!evaluation) {
      return NextResponse.json(
        { error: "Missing evaluation data in request body." },
        { status: 400 }
      );
    }

    if (!skillGaps || !Array.isArray(skillGaps)) {
      return NextResponse.json(
        { error: "Missing or invalid skill gaps array in request body." },
        { status: 400 }
      );
    }

    // Validate mission
    const validatedMission = TodayMissionSchema.safeParse(currentMissionInput);
    if (!validatedMission.success) {
      return NextResponse.json(
        {
          error: "Invalid current mission format.",
          details: validatedMission.error.issues.map((i) => i.message),
        },
        { status: 400 }
      );
    }

    // Validate evaluation
    const validatedEvaluation = MissionEvaluationResultSchema.safeParse(evaluation);
    if (!validatedEvaluation.success) {
      return NextResponse.json(
        {
          error: "Invalid evaluation format.",
          details: validatedEvaluation.error.issues.map((i) => i.message),
        },
        { status: 400 }
      );
    }

    // Validate skill gaps
    const validatedSkillGaps = z.array(AnalyzedSkillGapSchema).safeParse(skillGaps);
    if (!validatedSkillGaps.success) {
      return NextResponse.json(
        {
          error: "Invalid skill gaps format.",
          details: validatedSkillGaps.error.issues.map((i) => i.message),
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

    // Optional roadmap validation
    let validatedRoadmap = null;
    if (roadmap) {
      const parsedRoadmap = RoadmapPlanSchema.safeParse(roadmap);
      if (parsedRoadmap.success) {
        validatedRoadmap = parsedRoadmap.data;
      }
    }

    // Generate adaptive next mission via Gemini
    const adaptiveResult = await generateAdaptiveNextMission({
      currentMission: validatedMission.data,
      evaluation: validatedEvaluation.data,
      learnerProfile: validatedProfile,
      skillGaps: validatedSkillGaps.data,
      roadmap: validatedRoadmap,
    });

    // Save next mission to Supabase if roadmapId is provided
    let newMissionId: string | null = null;
    if (roadmapId) {
      newMissionId = await saveNextMissionToSupabase({
        roadmapId,
        nextMission: adaptiveResult.nextMission,
      });
    }

    return NextResponse.json({
      ...adaptiveResult,
      supabase: {
        nextMissionId: newMissionId,
        storedInSupabase: !!newMissionId,
      },
    });
  } catch (error) {
    console.error("Error in /api/generate-next-mission:", error);

    const message =
      error instanceof Error ? error.message : "AI next mission generation failed.";

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
      { error: "Failed to generate adaptive next mission: " + message },
      { status: 500 }
    );
  }
}
