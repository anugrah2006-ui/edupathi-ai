// ─── Target Roles ───────────────────────────────────────────────

export interface TargetRole {
  id: string;
  title: string;
  description: string;
  icon: string; // emoji
  category: string;
  requiredSkills: RequiredSkill[];
}

export interface RequiredSkill {
  name: string;
  level: SkillLevel;
  category: "technical" | "soft" | "domain";
}

export type SkillLevel = 1 | 2 | 3 | 4 | 5;

// ─── Learner Profile ────────────────────────────────────────────

export interface LearnerProfile {
  name: string;
  email?: string;
  currentRole?: string;
  yearsOfExperience?: number;
  education: Education[];
  skills: ProfileSkill[];
  projects: Project[];
  certifications: string[];
}

export interface Education {
  degree: string;
  field: string;
  institution: string;
  year?: number;
}

export interface ProfileSkill {
  name: string;
  level: SkillLevel;
  source: "resume" | "assessment" | "self-reported";
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
}

// ─── Skill Gap Analysis ─────────────────────────────────────────

export interface SkillGap {
  skillName: string;
  currentLevel: SkillLevel;
  requiredLevel: SkillLevel;
  gap: number; // requiredLevel - currentLevel
  priority: "critical" | "high" | "medium" | "low";
  category: "technical" | "soft" | "domain";
}

// ─── Missions & Evaluations ─────────────────────────────────────

export interface Mission {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  type: "coding" | "quiz" | "written" | "project";
  estimatedMinutes: number;
  skillsFocused: string[];
  content: string; // markdown
  weekNumber: number;
  dayNumber: number;
}

export interface MissionSubmission {
  missionId: string;
  content: string;
  submittedAt: Date;
}

export interface MissionEvaluation {
  missionId: string;
  score: number; // 0-100
  strengths: string[];
  weaknesses: string[];
  feedback: string;
  nextMissionHints: string[];
}

// ─── Roadmap ────────────────────────────────────────────────────

export interface RoadmapWeek {
  weekNumber: number;
  theme: string;
  description: string;
  missions: Mission[];
  isCompleted: boolean;
  isCurrent: boolean;
}

export interface Roadmap {
  targetRoleId: string;
  weeks: RoadmapWeek[];
  createdAt: Date;
  totalMissions: number;
  completedMissions: number;
}

// ─── App State ──────────────────────────────────────────────────

export interface AppState {
  targetRole: TargetRole | null;
  learnerProfile: LearnerProfile | null;
  skillGaps: SkillGap[];
  roadmap: Roadmap | null;
  currentMission: Mission | null;
  lastEvaluation: MissionEvaluation | null;
}
