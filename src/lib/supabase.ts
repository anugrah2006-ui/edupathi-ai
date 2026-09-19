import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { RoadmapPlan, TodayMission } from "./schemas";

// ─── Server & Client Supabase Instance ──────────────────────────

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY;

export function getSupabaseClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseKey) {
    return null;
  }
  return createClient(supabaseUrl, supabaseKey);
}

// ─── Roadmap & Mission Database Operations ───────────────────────

export interface SaveRoadmapParams {
  userId?: string;
  targetRoleId: string;
  targetRoleTitle: string;
  learnerProfile: unknown;
  skillGaps: unknown;
  roadmap: RoadmapPlan;
  todayMission: TodayMission;
}

export async function saveRoadmapToSupabase(params: SaveRoadmapParams): Promise<{
  roadmapId: string | null;
  missionId: string | null;
  storedInSupabase: boolean;
}> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    console.warn(
      "Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY) are not set. " +
        "Roadmap generated and served directly to the client."
    );
    return {
      roadmapId: null,
      missionId: null,
      storedInSupabase: false,
    };
  }

  try {
    // 1. Insert Roadmap
    const { data: roadmapData, error: roadmapError } = await supabase
      .from("roadmaps")
      .insert({
        user_identifier: params.userId || "guest_learner",
        target_role_id: params.targetRoleId,
        target_role_title: params.targetRoleTitle,
        learner_profile: params.learnerProfile,
        skill_gaps: params.skillGaps,
        roadmap_data: params.roadmap,
      })
      .select("id")
      .single();

    if (roadmapError) {
      console.error("Error inserting roadmap into Supabase:", roadmapError);
      return { roadmapId: null, missionId: null, storedInSupabase: false };
    }

    const roadmapId = roadmapData.id;

    // 2. Insert Initial Mission
    const { data: missionData, error: missionError } = await supabase
      .from("missions")
      .insert({
        roadmap_id: roadmapId,
        title: params.todayMission.title,
        target_skill: params.todayMission.targetSkill,
        current_level: params.todayMission.currentLevel,
        target_level: params.todayMission.targetLevel,
        mission_type: params.todayMission.type,
        estimated_minutes: params.todayMission.estimatedMinutes,
        task_prompt: params.todayMission.taskPrompt,
        expected_outcome: params.todayMission.expectedOutcome,
        evaluation_criteria: params.todayMission.evaluationCriteria,
        status: "in_progress",
      })
      .select("id")
      .single();

    if (missionError) {
      console.error("Error inserting mission into Supabase:", missionError);
      return { roadmapId, missionId: null, storedInSupabase: true };
    }

    return {
      roadmapId,
      missionId: missionData.id,
      storedInSupabase: true,
    };
  } catch (err) {
    console.error("Unexpected error saving to Supabase:", err);
    return { roadmapId: null, missionId: null, storedInSupabase: false };
  }
}

// ─── Save Submission & AI Evaluation ────────────────────────────

export async function saveSubmissionToSupabase(params: {
  missionId?: string | null;
  submissionText: string;
  evaluation: {
    score: number;
    feedback: string;
    strengths: string[];
    weaknesses: string[];
    passed: boolean;
  };
}): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase || !params.missionId) {
    return false;
  }

  try {
    // 1. Insert into submissions table
    const { error: subError } = await supabase.from("submissions").insert({
      mission_id: params.missionId,
      user_submission: params.submissionText,
      score: params.evaluation.score,
      strengths: params.evaluation.strengths,
      weaknesses: params.evaluation.weaknesses,
      feedback: params.evaluation.feedback,
      next_mission_hints: params.evaluation.weaknesses,
    });

    if (subError) {
      console.error("Error inserting submission to Supabase:", subError);
      return false;
    }

    // 2. If passed, update mission status to 'completed'
    if (params.evaluation.passed) {
      const { error: updateError } = await supabase
        .from("missions")
        .update({ status: "completed" })
        .eq("id", params.missionId);

      if (updateError) {
        console.error("Error updating mission status in Supabase:", updateError);
      }
    }

    return true;
  } catch (err) {
    console.error("Error saving submission to Supabase:", err);
    return false;
  }
}

// ─── Save Next Mission ──────────────────────────────────────────

export async function saveNextMissionToSupabase(params: {
  roadmapId?: string | null;
  nextMission: TodayMission;
}): Promise<string | null> {
  const supabase = getSupabaseClient();
  if (!supabase || !params.roadmapId) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("missions")
      .insert({
        roadmap_id: params.roadmapId,
        title: params.nextMission.title,
        target_skill: params.nextMission.targetSkill,
        current_level: params.nextMission.currentLevel,
        target_level: params.nextMission.targetLevel,
        difficulty: params.nextMission.difficulty || "intermediate",
        mission_type: params.nextMission.type,
        estimated_minutes: params.nextMission.estimatedMinutes,
        task_prompt: params.nextMission.taskPrompt,
        expected_outcome: params.nextMission.expectedOutcome,
        evaluation_criteria: params.nextMission.evaluationCriteria,
        status: "in_progress",
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error inserting next mission to Supabase:", error);
      return null;
    }

    return data?.id || null;
  } catch (err) {
    console.error("Error saving next mission to Supabase:", err);
    return null;
  }
}

