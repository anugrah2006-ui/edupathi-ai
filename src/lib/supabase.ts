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
