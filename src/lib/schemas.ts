import { z } from "zod";

// ─── Gemini Response Schema (strict) ────────────────────────────

export const EducationSchema = z.object({
  degree: z.string().describe("Degree type, e.g., B.S., M.S., Ph.D., etc."),
  field: z.string().describe("Field of study, e.g., Computer Science"),
  institution: z.string().describe("University or institution name"),
  year: z.number().optional().describe("Graduation year"),
});

export const ExperienceSchema = z.object({
  title: z.string().describe("Job title"),
  company: z.string().describe("Company name"),
  duration: z.string().describe("Duration, e.g., 'Jan 2022 - Present' or '2 years'"),
  description: z.string().describe("Brief description of responsibilities"),
  technologies: z.array(z.string()).describe("Technologies used in this role"),
});

export const ProjectSchema = z.object({
  name: z.string().describe("Project name"),
  description: z.string().describe("Brief project description"),
  technologies: z.array(z.string()).describe("Technologies used"),
});

export const SkillSchema = z.object({
  name: z.string().describe("Skill name, e.g., React, Python, SQL"),
  level: z
    .enum(["beginner", "intermediate", "advanced"])
    .describe(
      "Proficiency level inferred from resume context: beginner = mentioned or minimal experience, intermediate = used in projects/jobs, advanced = deep expertise demonstrated"
    ),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe(
      "Confidence score 0-1 for how certain the inference is based on resume evidence"
    ),
});

export const ResumeAnalysisSchema = z.object({
  name: z
    .string()
    .describe("Full name of the candidate extracted from the resume"),
  education: z
    .array(EducationSchema)
    .describe("List of educational qualifications"),
  experience: z
    .array(ExperienceSchema)
    .describe("List of work experience entries"),
  projects: z.array(ProjectSchema).describe("List of projects"),
  skills: z
    .array(SkillSchema)
    .describe(
      "All skills extracted from the resume with inferred proficiency levels"
    ),
});

export type ResumeAnalysis = z.infer<typeof ResumeAnalysisSchema>;
export type ResumeEducation = z.infer<typeof EducationSchema>;
export type ResumeExperience = z.infer<typeof ExperienceSchema>;
export type ResumeProject = z.infer<typeof ProjectSchema>;
export type ResumeSkill = z.infer<typeof SkillSchema>;

// ─── Skill Gap Analysis Schema ──────────────────────────────────

export const AnalyzedSkillGapSchema = z.object({
  skill: z.string().describe("Name of the skill"),
  currentLevel: z.number().describe("Current proficiency level (1-5) based on resume"),
  requiredLevel: z.number().describe("Required proficiency level (1-5) for the target role"),
  gap: z.number().describe("Difference between required and current level (required - current). Can be 0 if met, or negative if exceeded."),
  priority: z.enum(["low", "medium", "high"]).describe("Priority of learning this skill based on the gap and its importance to the role"),
  reason: z.string().describe("AI explanation of why this gap exists and why it's important"),
});

export const SkillGapAnalysisSchema = z.object({
  targetRole: z.string().describe("The name of the target role analyzed against"),
  skills: z.array(AnalyzedSkillGapSchema).describe("List of analyzed skill gaps"),
});

export type AnalyzedSkillGap = z.infer<typeof AnalyzedSkillGapSchema>;
export type SkillGapAnalysis = z.infer<typeof SkillGapAnalysisSchema>;

// ─── JSON Schema for Gemini structured output ──────────────────

export function getResumeAnalysisJsonSchema() {
  return {
    type: "object" as const,
    properties: {
      name: { type: "string" as const, description: "Full name of the candidate" },
      education: {
        type: "array" as const,
        items: {
          type: "object" as const,
          properties: {
            degree: { type: "string" as const },
            field: { type: "string" as const },
            institution: { type: "string" as const },
            year: { type: "number" as const },
          },
          required: ["degree", "field", "institution"],
        },
      },
      experience: {
        type: "array" as const,
        items: {
          type: "object" as const,
          properties: {
            title: { type: "string" as const },
            company: { type: "string" as const },
            duration: { type: "string" as const },
            description: { type: "string" as const },
            technologies: {
              type: "array" as const,
              items: { type: "string" as const },
            },
          },
          required: ["title", "company", "duration", "description", "technologies"],
        },
      },
      projects: {
        type: "array" as const,
        items: {
          type: "object" as const,
          properties: {
            name: { type: "string" as const },
            description: { type: "string" as const },
            technologies: {
              type: "array" as const,
              items: { type: "string" as const },
            },
          },
          required: ["name", "description", "technologies"],
        },
      },
      skills: {
        type: "array" as const,
        items: {
          type: "object" as const,
          properties: {
            name: { type: "string" as const },
            level: {
              type: "string" as const,
              enum: ["beginner", "intermediate", "advanced"],
            },
            confidence: { type: "number" as const },
          },
          required: ["name", "level", "confidence"],
        },
      },
    },
    required: ["name", "education", "experience", "projects", "skills"],
  };
}

export function getSkillGapAnalysisJsonSchema() {
  return {
    type: "object" as const,
    properties: {
      targetRole: { type: "string" as const },
      skills: {
        type: "array" as const,
        items: {
          type: "object" as const,
          properties: {
            skill: { type: "string" as const },
            currentLevel: { type: "number" as const },
            requiredLevel: { type: "number" as const },
            gap: { type: "number" as const },
            priority: {
              type: "string" as const,
              enum: ["low", "medium", "high"],
            },
            reason: { type: "string" as const },
          },
          required: ["skill", "currentLevel", "requiredLevel", "gap", "priority", "reason"],
        },
      },
    },
    required: ["targetRole", "skills"],
  };
}

// ─── 4-Week Roadmap & Today's Mission Schemas ───────────────────

export const ActivitySchema = z.object({
  title: z.string().describe("Title of the learning activity"),
  description: z.string().describe("Concise overview of what the learner will do/learn"),
  type: z.enum(["coding", "reading", "exercise", "quiz", "project"]).describe("Activity format"),
  estimatedMinutes: z.number().describe("Estimated time to complete in minutes"),
});

export const ProjectTaskSchema = z.object({
  title: z.string().describe("Title of the weekly practical project or task"),
  description: z.string().describe("Detailed description of the hands-on project"),
  deliverable: z.string().describe("Clear tangible deliverable (e.g. GitHub repo, working component)"),
  criteria: z.array(z.string()).describe("Checklist of success criteria"),
});

export const RoadmapWeekPlanSchema = z.object({
  weekNumber: z.number().min(1).max(4).describe("Week number (1, 2, 3, or 4)"),
  theme: z.string().describe("Theme and focus for this week"),
  learningObjectives: z.array(z.string()).describe("Key learning objectives for the week"),
  skillsImproved: z.array(z.string()).describe("Specific target skills being leveled up this week"),
  activities: z.array(ActivitySchema).min(2).max(4).describe("2 to 4 structured learning activities"),
  estimatedTime: z.string().describe("Estimated weekly commitment, e.g. '8-10 hours'"),
  project: ProjectTaskSchema.describe("One practical project or task consolidating the week's learnings"),
});

export const RoadmapPlanSchema = z.object({
  targetRoleId: z.string().describe("Target role identifier"),
  overview: z.string().describe("Executive summary of the 4-week acceleration plan"),
  weeks: z.array(RoadmapWeekPlanSchema).length(4).describe("Complete 4-week progression"),
});

export const TodayMissionSchema = z.object({
  title: z.string().describe("Catchy, actionable title for today's mission"),
  targetSkill: z.string().describe("The highest-priority skill gap addressed"),
  currentLevel: z.number().describe("Learner's current level in this skill (1-5)"),
  targetLevel: z.number().describe("Target level to attain through this mission (1-5)"),
  description: z.string().describe("Context and importance of this mission"),
  type: z.enum(["coding", "quiz", "written", "project"]).describe("Mission format"),
  estimatedMinutes: z.number().describe("Estimated duration in minutes (e.g. 20-45 min)"),
  taskPrompt: z.string().describe("Clear, step-by-step instructions or challenge problem for the learner to solve"),
  expectedOutcome: z.string().describe("What the learner must submit/produce (e.g., code snippet, explanation, solution)"),
  evaluationCriteria: z.array(z.string()).describe("Specific criteria used to evaluate and grade the learner's submission"),
});

export const RoadmapAndMissionResponseSchema = z.object({
  roadmap: RoadmapPlanSchema,
  todayMission: TodayMissionSchema,
});

export type Activity = z.infer<typeof ActivitySchema>;
export type ProjectTask = z.infer<typeof ProjectTaskSchema>;
export type RoadmapWeekPlan = z.infer<typeof RoadmapWeekPlanSchema>;
export type RoadmapPlan = z.infer<typeof RoadmapPlanSchema>;
export type TodayMission = z.infer<typeof TodayMissionSchema>;
export type RoadmapAndMissionResponse = z.infer<typeof RoadmapAndMissionResponseSchema>;

export function getRoadmapAndMissionJsonSchema() {
  return {
    type: "object" as const,
    properties: {
      roadmap: {
        type: "object" as const,
        properties: {
          targetRoleId: { type: "string" as const },
          overview: { type: "string" as const },
          weeks: {
            type: "array" as const,
            items: {
              type: "object" as const,
              properties: {
                weekNumber: { type: "number" as const },
                theme: { type: "string" as const },
                learningObjectives: {
                  type: "array" as const,
                  items: { type: "string" as const },
                },
                skillsImproved: {
                  type: "array" as const,
                  items: { type: "string" as const },
                },
                activities: {
                  type: "array" as const,
                  items: {
                    type: "object" as const,
                    properties: {
                      title: { type: "string" as const },
                      description: { type: "string" as const },
                      type: {
                        type: "string" as const,
                        enum: ["coding", "reading", "exercise", "quiz", "project"],
                      },
                      estimatedMinutes: { type: "number" as const },
                    },
                    required: ["title", "description", "type", "estimatedMinutes"],
                  },
                },
                estimatedTime: { type: "string" as const },
                project: {
                  type: "object" as const,
                  properties: {
                    title: { type: "string" as const },
                    description: { type: "string" as const },
                    deliverable: { type: "string" as const },
                    criteria: {
                      type: "array" as const,
                      items: { type: "string" as const },
                    },
                  },
                  required: ["title", "description", "deliverable", "criteria"],
                },
              },
              required: [
                "weekNumber",
                "theme",
                "learningObjectives",
                "skillsImproved",
                "activities",
                "estimatedTime",
                "project",
              ],
            },
          },
        },
        required: ["targetRoleId", "overview", "weeks"],
      },
      todayMission: {
        type: "object" as const,
        properties: {
          title: { type: "string" as const },
          targetSkill: { type: "string" as const },
          currentLevel: { type: "number" as const },
          targetLevel: { type: "number" as const },
          description: { type: "string" as const },
          type: {
            type: "string" as const,
            enum: ["coding", "quiz", "written", "project"],
          },
          estimatedMinutes: { type: "number" as const },
          taskPrompt: { type: "string" as const },
          expectedOutcome: { type: "string" as const },
          evaluationCriteria: {
            type: "array" as const,
            items: { type: "string" as const },
          },
        },
        required: [
          "title",
          "targetSkill",
          "currentLevel",
          "targetLevel",
          "description",
          "type",
          "estimatedMinutes",
          "taskPrompt",
          "expectedOutcome",
          "evaluationCriteria",
        ],
      },
    },
    required: ["roadmap", "todayMission"],
  };
}

