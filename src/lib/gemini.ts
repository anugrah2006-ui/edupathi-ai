import { GoogleGenAI } from "@google/genai";
import {
  ResumeAnalysisSchema,
  getResumeAnalysisJsonSchema,
  SkillGapAnalysisSchema,
  getSkillGapAnalysisJsonSchema,
  RoadmapAndMissionResponseSchema,
  getRoadmapAndMissionJsonSchema,
  MissionEvaluationResultSchema,
  getMissionEvaluationJsonSchema,
  AdaptiveNextMissionResponseSchema,
  getAdaptiveNextMissionJsonSchema,
  type ResumeAnalysis,
  type SkillGapAnalysis,
  type AnalyzedSkillGap,
  type RoadmapAndMissionResponse,
  type TodayMission,
  type MissionEvaluationResult,
  type AdaptiveNextMissionResponse,
  type RoadmapPlan,
} from "./schemas";
import type { TargetRole } from "./types";

// ─── Gemini Client (server-side only) ───────────────────────────

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY environment variable is not set. " +
        "Add it to your .env.local file."
    );
  }
  return new GoogleGenAI({ apiKey });
}

// ─── Multi-Model Fallback Executor ──────────────────────────────

const CANDIDATE_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
];

async function generateWithModelFallback(params: {
  contents: string;
  responseSchema: unknown;
  temperature?: number;
}): Promise<string> {
  const ai = getGeminiClient();
  let lastError: unknown = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: {
          responseMimeType: "application/json",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          responseSchema: params.responseSchema as any,
          temperature: params.temperature ?? 0.1,
        },
      });

      if (response.text) {
        return response.text;
      }
    } catch (err: unknown) {
      console.warn(`Model ${model} failed, attempting next available model. Error:`, err);
      lastError = err;
      // Brief pause before trying fallback model
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  throw lastError || new Error("All AI models failed to respond.");
}

// ─── Resume Analysis Prompt ─────────────────────────────────────

const RESUME_ANALYSIS_PROMPT = `You are an expert HR analyst and technical recruiter. Analyze the following resume text and extract structured information.

IMPORTANT GUIDELINES:
1. Extract the candidate's full name. If no name is found, use "Unknown Candidate".
2. Extract ALL education entries with degree, field, institution, and year.
3. Extract ALL work experience entries with title, company, duration, description, and technologies used.
4. Extract ALL projects mentioned with name, description, and technologies.
5. For skills:
   - Extract every technical and soft skill mentioned or implied in the resume.
   - Infer the proficiency level based on context:
     * "beginner" - skill is merely listed or mentioned briefly
     * "intermediate" - skill was used in projects or jobs with some evidence
     * "advanced" - deep expertise demonstrated through senior roles, complex projects, or certifications
   - Set a confidence score (0.0 to 1.0) based on how much evidence the resume provides for the skill level.

Be thorough. Extract skills from:
- Explicit skills sections
- Technologies mentioned in project descriptions
- Tools mentioned in experience descriptions
- Implied skills from job titles and responsibilities

Resume text:
`;

// ─── Analyze Resume ─────────────────────────────────────────────

export async function analyzeResume(
  resumeText: string
): Promise<ResumeAnalysis> {
  if (!resumeText || resumeText.trim().length < 20) {
    throw new Error(
      "Resume text is too short. Please provide more content for analysis."
    );
  }

  const responseText = await generateWithModelFallback({
    contents: RESUME_ANALYSIS_PROMPT + resumeText,
    responseSchema: getResumeAnalysisJsonSchema(),
    temperature: 0.1,
  });

  let parsed: unknown;
  try {
    parsed = JSON.parse(responseText);
  } catch {
    throw new Error("Gemini returned invalid JSON. Please try again.");
  }

  const validated = ResumeAnalysisSchema.safeParse(parsed);
  if (!validated.success) {
    console.error("Gemini response validation errors:", validated.error.issues);
    throw new Error(
      "AI response did not match expected format. Issues: " +
        validated.error.issues.map((i) => i.message).join(", ")
    );
  }

  return validated.data;
}

// ─── Analyze Skill Gaps ─────────────────────────────────────────

const SKILL_GAP_PROMPT = `You are an expert technical recruiter and career coach.
Your task is to analyze a candidate's current profile against the requirements for a target role, and identify the skill gaps.

I will provide:
1. Target Role Requirements: A list of skills and the required proficiency (1-5 scale) for this role.
2. Learner Profile: The candidate's current skills extracted from their resume (beginner, intermediate, advanced) mapped roughly to (1, 3, 5).

Your job:
Map the candidate's skills to the target role's required skills.
If the candidate lacks a required skill, their current level is 0.
Calculate the gap (requiredLevel - currentLevel).
Determine priority based on the gap size and importance.
Provide a concise, 1-2 sentence reason for each gap.

Target Role Requirements:
`;

export async function analyzeSkillGap(
  profile: ResumeAnalysis,
  targetRole: TargetRole
): Promise<SkillGapAnalysis> {
  const promptContent =
    SKILL_GAP_PROMPT +
    JSON.stringify(targetRole.requiredSkills, null, 2) +
    "\n\nCandidate's Extracted Profile:\n" +
    JSON.stringify(profile.skills, null, 2);

  const responseText = await generateWithModelFallback({
    contents: promptContent,
    responseSchema: getSkillGapAnalysisJsonSchema(),
    temperature: 0.1,
  });

  let parsed: unknown;
  try {
    parsed = JSON.parse(responseText);
  } catch {
    throw new Error("Gemini returned invalid JSON.");
  }

  const validated = SkillGapAnalysisSchema.safeParse(parsed);
  if (!validated.success) {
    console.error("Gemini response validation errors:", validated.error.issues);
    throw new Error(
      "AI response did not match expected format. Issues: " +
        validated.error.issues.map((i) => i.message).join(", ")
    );
  }

  return validated.data;
}

// ─── Generate 4-Week Roadmap & Today's Mission ──────────────────

const ROADMAP_GENERATION_PROMPT = `You are a world-class senior tech lead, staff engineer, and personalized technical career coach.

Your task is to generate a comprehensive, highly personalized 4-Week Accelerated Learning Roadmap AND ONE immediate "Today's Mission" for a candidate.

Context provided:
1. Target Role: The role the learner wants to transition into or excel at.
2. Learner Profile: Extracted experience, education, projects, and skills.
3. Skill Gap Analysis: Specific skill gaps identified with priority levels (high, medium, low), required levels vs current levels, and reasons.

REQUIREMENTS FOR THE 4-WEEK ROADMAP:
1. Four consecutive weeks (Week 1 to Week 4) logically structured from critical high-priority gaps to production-grade mastery and capstone.
   - Week 1: Immediate high-priority fundamentals and quick practical wins.
   - Week 2: Core technologies, integration, and intermediate architectural patterns.
   - Week 3: Advanced techniques, scalability, optimization, and edge cases.
   - Week 4: Capstone project, real-world deployment, testing, and portfolio piece.
2. For each week:
   - "theme": Engaging, descriptive title.
   - "learningObjectives": 2-4 measurable, actionable learning objectives.
   - "skillsImproved": 2-4 target skills actively leveled up this week.
   - "activities": 2-4 learning activities (each with title, description, type, estimatedMinutes).
   - "estimatedTime": Weekly time investment (e.g., "8-10 hours").
   - "project": Exactly ONE practical, hands-on weekly project/task with:
     * title
     * description
     * deliverable (e.g. "GitHub repo with working Next.js App and Dockerfile")
     * criteria (3-5 checklist bullet points)

REQUIREMENTS FOR "TODAY'S MISSION":
1. Target the single HIGHEST-PRIORITY skill gap identified in the gap analysis.
2. Calibrated precisely to the learner's CURRENT skill level (don't overwhelm a beginner, don't bore an advanced learner).
3. Practical and hands-on: provides a realistic coding/engineering challenge or task.
4. "estimatedMinutes": Realistic duration (typically 20-45 minutes).
5. "taskPrompt": Detailed, step-by-step instructions or starter scenario with clear guidance.
6. "expectedOutcome": Exact description of what the user needs to write or code and submit.
7. "evaluationCriteria": 3-5 specific grading criteria for AI scoring.

Target Role & Candidate Information:
`;

export async function generateRoadmapAndMission(
  profile: ResumeAnalysis,
  skillGaps: AnalyzedSkillGap[],
  targetRole: TargetRole
): Promise<RoadmapAndMissionResponse> {
  const promptContent =
    ROADMAP_GENERATION_PROMPT +
    `\nTarget Role: ${targetRole.title} (${targetRole.description})\n\n` +
    `Candidate Profile: ${profile.name || "Candidate"}\n` +
    `Candidate Experience:\n${JSON.stringify(profile.experience, null, 2)}\n\n` +
    `Candidate Skills:\n${JSON.stringify(profile.skills, null, 2)}\n\n` +
    `Identified Skill Gaps (Sorted by priority):\n${JSON.stringify(skillGaps, null, 2)}`;

  const responseText = await generateWithModelFallback({
    contents: promptContent,
    responseSchema: getRoadmapAndMissionJsonSchema(),
    temperature: 0.2,
  });

  let parsed: unknown;
  try {
    parsed = JSON.parse(responseText);
  } catch {
    throw new Error("Gemini returned invalid JSON for roadmap generation.");
  }

  const validated = RoadmapAndMissionResponseSchema.safeParse(parsed);
  if (!validated.success) {
    console.error("Gemini roadmap validation errors:", validated.error.issues);
    throw new Error(
      "AI response did not match expected roadmap format. Issues: " +
        validated.error.issues.map((i) => i.message).join(", ")
    );
  }

  return validated.data;
}

// ─── Evaluate Mission Submission ────────────────────────────────

const MISSION_EVALUATION_PROMPT = `You are a world-class senior technical mentor, staff engineer, and code reviewer.
Your job is to objectively evaluate a learner's mission submission against specific evaluation criteria.

EVALUATION GUIDELINES:
1. Thoroughly analyze the user's submission against the mission's task prompt, expected outcome, and each evaluation criterion.
2. If the user's submission is incomplete, low effort, incorrect, or irrelevant, assign an appropriately low score (0 to 60) and explain why constructively.
3. If the submission is high quality, solves the challenge correctly, and fulfills the criteria, award a score of 70 to 100 based on code quality, completeness, and edge case handling.
4. "score" MUST be an integer between 0 and 100.
5. "passed" MUST be true if and only if score >= 70.
6. Provide specific, actionable, encouraging feedback that explains the grade and gives concrete tips for improvement.
7. Extract 2-4 distinct strengths and 1-3 specific weaknesses / improvement areas based on the actual submission.

Target Mission & Submission Details:
`;

export async function evaluateMissionSubmission(params: {
  mission: TodayMission;
  submissionText: string;
  learnerProfile?: ResumeAnalysis | null;
}): Promise<MissionEvaluationResult> {
  const { mission, submissionText, learnerProfile } = params;

  if (!submissionText || submissionText.trim().length < 5) {
    throw new Error("Submission content is too short for evaluation.");
  }

  const promptContent =
    MISSION_EVALUATION_PROMPT +
    `\nTarget Skill: ${mission.targetSkill} (Current Level: ${mission.currentLevel} -> Target Level: ${mission.targetLevel})\n` +
    `Mission Title: ${mission.title}\n` +
    `Mission Description: ${mission.description}\n` +
    `Task Prompt:\n${mission.taskPrompt}\n\n` +
    `Expected Outcome:\n${mission.expectedOutcome}\n\n` +
    `Evaluation Criteria:\n${JSON.stringify(mission.evaluationCriteria, null, 2)}\n\n` +
    (learnerProfile ? `Learner Name: ${learnerProfile.name || "Learner"}\n\n` : "") +
    `User's Actual Submission:\n${submissionText}\n`;

  const responseText = await generateWithModelFallback({
    contents: promptContent,
    responseSchema: getMissionEvaluationJsonSchema(),
    temperature: 0.1,
  });

  let parsed: unknown;
  try {
    parsed = JSON.parse(responseText);
  } catch {
    throw new Error("Gemini returned invalid JSON for mission evaluation.");
  }

  const validated = MissionEvaluationResultSchema.safeParse(parsed);
  if (!validated.success) {
    console.error("Gemini mission evaluation validation errors:", validated.error.issues);
    throw new Error(
      "AI evaluation response did not match expected format. Issues: " +
        validated.error.issues.map((i) => i.message).join(", ")
    );
  }

  // Ensure passed strictly matches score >= 70 and score is clamped 0-100
  const score = Math.max(0, Math.min(100, Math.round(validated.data.score)));
  const passed = score >= 70;

  return {
    score,
    feedback: validated.data.feedback,
    strengths: validated.data.strengths,
    weaknesses: validated.data.weaknesses,
    passed,
  };
}

// ─── Generate Adaptive Next Mission ─────────────────────────────

const ADAPTIVE_NEXT_MISSION_PROMPT = `You are a world-class adaptive AI learning engine and technical career mentor.
Your task is to analyze the learner's previous mission evaluation and dynamically determine their NEXT tailored mission and update their skill gap metrics.

CRITICAL ADAPTIVE LOGIC:

CASE 1: PASSED (evaluation.passed === true, score >= 70)
- The learner has successfully demonstrated competency in the previous mission's target skill.
- In "updatedSkillGaps":
  * Increment the learner's currentLevel for the practiced skill (e.g., if currentLevel was 2, it becomes 3, capped at requiredLevel).
  * Recalculate gap = Math.max(0, requiredLevel - newCurrentLevel).
  * If gap becomes 0 or 1, reduce priority (e.g., from high to medium, or medium to low).
  * Update reason to reflect their demonstrated progress.
- "isRemedial": false
- "adaptationReason": Congratulate the learner on passing with score X/100 and explain why the new mission is advancing them to the next skill milestone or higher difficulty pattern on their roadmap.
- "nextMission":
  * Advance to either the next level of the current skill OR the next highest-priority skill gap in the roadmap.
  * Difficulty should be "intermediate" or "advanced".
  * Create a fresh, engaging, hands-on mission with detailed instructions (taskPrompt), expected deliverable (expectedOutcome), and rigorous evaluation criteria (3-5 items).

CASE 2: FAILED / NEEDS REINFORCEMENT (evaluation.passed === false, score < 70)
- The learner struggled with specific concepts or criteria (identified in evaluation.weaknesses).
- In "updatedSkillGaps":
  * Maintain the currentLevel for the skill.
  * Update the reason to highlight the specific areas that need reinforcement based on evaluation feedback.
- "isRemedial": true
- "adaptationReason": Empathetically explain that based on the evaluation weaknesses (specifically citing them), this targeted reinforcement mission will help solidify the fundamentals before moving forward.
- "nextMission":
  * Do NOT simply move on to the next roadmap topic.
  * Target the SAME skill gap, specifically focusing on the weaknesses/gaps identified in the evaluation.
  * Provide scaffolding, guided starter steps, and focused practice to master the missed concepts.
  * Set difficulty appropriately ("beginner" or "intermediate").
  * Craft a focused task prompt, clear expected deliverable (expectedOutcome), and tailored evaluation criteria (3-5 items).

Context provided:
`;

export async function generateAdaptiveNextMission(params: {
  currentMission: TodayMission;
  evaluation: MissionEvaluationResult;
  learnerProfile?: ResumeAnalysis | null;
  skillGaps: AnalyzedSkillGap[];
  roadmap?: RoadmapPlan | null;
}): Promise<AdaptiveNextMissionResponse> {
  const { currentMission, evaluation, learnerProfile, skillGaps, roadmap } = params;

  const promptContent =
    ADAPTIVE_NEXT_MISSION_PROMPT +
    `\nLearner: ${learnerProfile?.name || "Learner"}\n\n` +
    `Previous Mission:\n${JSON.stringify(currentMission, null, 2)}\n\n` +
    `Evaluation Result:\n${JSON.stringify(evaluation, null, 2)}\n\n` +
    `Current Skill Gaps:\n${JSON.stringify(skillGaps, null, 2)}\n\n` +
    (roadmap
      ? `Learner's 4-Week Roadmap Overview:\n${roadmap.overview}\nWeeks: ${JSON.stringify(
          roadmap.weeks.map((w) => ({
            weekNumber: w.weekNumber,
            theme: w.theme,
            skillsImproved: w.skillsImproved,
          })),
          null,
          2
        )}\n`
      : "");

  const responseText = await generateWithModelFallback({
    contents: promptContent,
    responseSchema: getAdaptiveNextMissionJsonSchema(),
    temperature: 0.2,
  });

  let parsed: unknown;
  try {
    parsed = JSON.parse(responseText);
  } catch {
    throw new Error("Gemini returned invalid JSON for adaptive mission generation.");
  }

  const validated = AdaptiveNextMissionResponseSchema.safeParse(parsed);
  if (!validated.success) {
    console.error("Gemini adaptive mission validation errors:", validated.error.issues);
    throw new Error(
      "AI response did not match expected adaptive mission format. Issues: " +
        validated.error.issues.map((i) => i.message).join(", ")
    );
  }

  return validated.data;
}


