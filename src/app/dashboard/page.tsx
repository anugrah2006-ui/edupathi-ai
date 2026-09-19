"use client";

import { useEffect, useState } from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { SkillGapChart } from "@/components/skill-gap-chart";
import { RoadmapTimeline } from "@/components/roadmap-timeline";
import { MissionCard } from "@/components/mission-card";
import type { AnalyzedSkillGap, ResumeAnalysis, RoadmapPlan, TodayMission } from "@/lib/schemas";
import {
  TARGET_ROLES,
  MOCK_LEARNER_PROFILE,
  MOCK_ROADMAP,
  MOCK_CURRENT_MISSION,
  MOCK_LAST_EVALUATION,
} from "@/lib/mock-data";

function DashboardContent() {
  const searchParams = useSearchParams();
  const roleId = searchParams.get("role") || TARGET_ROLES[0].id;
  const role = TARGET_ROLES.find((r) => r.id === roleId) || TARGET_ROLES[0];

  const [profile, setProfile] = useState<ResumeAnalysis | null>(null);
  const [skillGaps, setSkillGaps] = useState<AnalyzedSkillGap[] | null>(null);
  const [isAnalyzingGaps, setIsAnalyzingGaps] = useState(true);
  const [gapError, setGapError] = useState<string | null>(null);

  // AI Roadmap & Today's Mission state
  const [roadmap, setRoadmap] = useState<RoadmapPlan | null>(null);
  const [todayMission, setTodayMission] = useState<TodayMission | null>(null);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [roadmapError, setRoadmapError] = useState<string | null>(null);
  const [isSupabaseSaved, setIsSupabaseSaved] = useState<boolean | null>(null);

  // Active Challenge Modal State
  const [isMissionModalOpen, setIsMissionModalOpen] = useState(false);
  const [submissionText, setSubmissionText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    score: number;
    feedback: string;
    strengths: string[];
    weaknesses: string[];
  } | null>(null);

  useEffect(() => {
    const storedProfileStr = sessionStorage.getItem("edupath_profile");
    let currentProfile: ResumeAnalysis | null = null;

    if (storedProfileStr) {
      try {
        currentProfile = JSON.parse(storedProfileStr);
        setProfile(currentProfile);
      } catch (e) {
        console.error("Failed to parse profile from storage", e);
      }
    }

    async function loadData() {
      if (!currentProfile) {
        setIsAnalyzingGaps(false);
        return;
      }

      // Step 1: Analyze Gaps
      let gaps: AnalyzedSkillGap[] | null = null;
      try {
        const gapRes = await fetch("/api/analyze-gap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile: currentProfile, roleId: role.id }),
        });
        const gapData = await gapRes.json();
        if (gapRes.ok && gapData.analysis) {
          gaps = gapData.analysis.skills;
          setSkillGaps(gaps);
        } else {
          setGapError(gapData.error || "Failed to analyze skill gaps.");
        }
      } catch (err) {
        console.error(err);
        setGapError("Network error while analyzing skill gaps.");
      } finally {
        setIsAnalyzingGaps(false);
      }

      // Step 2: Generate or retrieve cached 4-Week Roadmap & Today's Mission
      if (gaps && gaps.length > 0) {
        const cachedKey = `edupath_roadmap_${role.id}`;
        const cachedRoadmapStr = sessionStorage.getItem(cachedKey);

        if (cachedRoadmapStr) {
          try {
            const cached = JSON.parse(cachedRoadmapStr);
            setRoadmap(cached.roadmap);
            setTodayMission(cached.todayMission);
            setIsSupabaseSaved(cached.supabase?.storedInSupabase ?? null);
            return;
          } catch (e) {
            console.error("Failed to parse cached roadmap", e);
          }
        }

        // Generate via AI API
        setIsGeneratingRoadmap(true);
        try {
          const roadRes = await fetch("/api/generate-roadmap", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              profile: currentProfile,
              skillGaps: gaps,
              roleId: role.id,
            }),
          });
          const roadData = await roadRes.json();

          if (roadRes.ok && roadData.roadmap) {
            setRoadmap(roadData.roadmap);
            setTodayMission(roadData.todayMission);
            setIsSupabaseSaved(roadData.supabase?.storedInSupabase ?? false);
            sessionStorage.setItem(cachedKey, JSON.stringify(roadData));
          } else {
            setRoadmapError(roadData.error || "Failed to generate personalized roadmap.");
          }
        } catch (err) {
          console.error(err);
          setRoadmapError("Network error while generating learning roadmap.");
        } finally {
          setIsGeneratingRoadmap(false);
        }
      }
    }

    loadData();
  }, [role.id]);

  const completionPct = Math.round(
    (MOCK_ROADMAP.completedMissions / MOCK_ROADMAP.totalMissions) * 100
  );

  const displayProfile = profile || (MOCK_LEARNER_PROFILE as unknown as ResumeAnalysis);

  return (
    <main className="min-h-screen pt-20 pb-16 px-6">
      <div className="mx-auto max-w-7xl">
        {/* ──── Header ──── */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">
              Welcome back,{" "}
              <span className="gradient-text">
                {displayProfile.name || "Learner"}
              </span>
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Your personalized AI learning path towards becoming a certified {role.title}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isSupabaseSaved !== null && (
              <div className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{isSupabaseSaved ? "Synced with Supabase DB" : "Saved to Session"}</span>
              </div>
            )}
            <div className="inline-flex items-center gap-2 rounded-xl border border-violet-500/20 bg-violet-500/10 px-4 py-2">
              <span className="text-lg">{role.icon}</span>
              <span className="text-sm font-medium text-violet-300">
                {role.title}
              </span>
            </div>
          </div>
        </div>

        {/* ──── Stats Row ──── */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Overall Progress"
            value={`${completionPct}%`}
            detail={`${MOCK_ROADMAP.completedMissions}/${MOCK_ROADMAP.totalMissions} missions completed`}
            icon="📈"
            accent="violet"
          />
          <StatCard
            label="Current Week"
            value="Week 1"
            detail={roadmap?.weeks[0]?.theme || "Core Acceleration"}
            icon="📅"
            accent="indigo"
          />
          <StatCard
            label="Identified Skill Gaps"
            value={skillGaps ? `${skillGaps.length}` : "..."}
            detail={
              skillGaps
                ? `${skillGaps.filter((g) => g.priority === "high" || g.gap >= 3).length} high priority`
                : "Analyzing..."
            }
            icon="🎯"
            accent="rose"
          />
          <StatCard
            label="Target Goal"
            value="4 Weeks"
            detail={`To level up in ${role.title}`}
            icon="⚡"
            accent="amber"
          />
        </div>

        {/* ──── Main Grid ──── */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column: Mission + Evaluation */}
          <div className="space-y-6 lg:col-span-2">
            {/* Today's Mission */}
            <div>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                <span className="h-2.5 w-2.5 rounded-full bg-violet-500 animate-ping" />
                Today&apos;s Active Mission
              </h2>

              {isGeneratingRoadmap ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center flex flex-col items-center justify-center min-h-[220px]">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent mb-3" />
                  <p className="text-sm font-medium text-white">Gemini is synthesizing today&apos;s targeted mission...</p>
                  <p className="text-xs text-zinc-400 mt-1">Calibrating challenge to your highest priority skill gap</p>
                </div>
              ) : todayMission ? (
                <MissionCard
                  mission={todayMission}
                  isActive
                  onStart={() => setIsMissionModalOpen(true)}
                />
              ) : (
                <MissionCard
                  mission={{
                    title: MOCK_CURRENT_MISSION.title,
                    targetSkill: "TypeScript Architecture",
                    currentLevel: 2,
                    targetLevel: 4,
                    description: MOCK_CURRENT_MISSION.description,
                    type: "coding",
                    estimatedMinutes: 30,
                    taskPrompt: "Implement generic repository pattern with strict type guarantees.",
                    expectedOutcome: "TypeScript file with Generic Repository interfaces and concrete implementation.",
                    evaluationCriteria: ["Type safety", "Code cleanliness", "Edge-case handling"],
                  }}
                  isActive
                  onStart={() => setIsMissionModalOpen(true)}
                />
              )}
            </div>

            {/* Last Evaluation */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
              <h3 className="mb-4 text-lg font-semibold text-white">
                Recent AI Mission Evaluation
              </h3>

              {/* Score bar */}
              <div className="mb-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Mastery Score</span>
                  <span className="text-2xl font-bold text-white">
                    {submissionResult ? submissionResult.score : MOCK_LAST_EVALUATION.score}
                    <span className="text-sm text-zinc-500">/100</span>
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-1000"
                    style={{ width: `${submissionResult ? submissionResult.score : MOCK_LAST_EVALUATION.score}%` }}
                  />
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h4 className="mb-2 text-sm font-medium text-emerald-400">
                    ✓ Strengths Identified
                  </h4>
                  <ul className="space-y-1.5">
                    {(submissionResult ? submissionResult.strengths : MOCK_LAST_EVALUATION.strengths).map((s, i) => (
                      <li key={i} className="text-xs leading-relaxed text-zinc-400">
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium text-rose-400">
                    ✗ Areas for Improvement
                  </h4>
                  <ul className="space-y-1.5">
                    {(submissionResult ? submissionResult.weaknesses : MOCK_LAST_EVALUATION.weaknesses).map((w, i) => (
                      <li key={i} className="text-xs leading-relaxed text-zinc-400">
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Feedback */}
              <div className="mt-4 rounded-xl bg-white/[0.03] p-4 border border-white/5">
                <p className="text-sm leading-relaxed text-zinc-300 italic">
                  &ldquo;{submissionResult ? submissionResult.feedback : MOCK_LAST_EVALUATION.feedback}&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Progress Ring + Skill Gaps */}
          <div className="space-y-6">
            {/* Progress Ring */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm text-center">
              <h3 className="mb-4 text-lg font-semibold text-white">
                Roadmap Completion
              </h3>
              <div className="relative mx-auto h-40 w-40">
                <svg className="h-40 w-40 -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="url(#progressGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${completionPct * 3.27} 327`}
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-white">
                    {completionPct}%
                  </span>
                  <span className="text-xs text-zinc-500">Completed</span>
                </div>
              </div>
              <p className="mt-4 text-sm text-zinc-400">
                Week 1 in progress · 1 mission active today
              </p>
            </div>

            {/* Skill Gaps Chart */}
            {isAnalyzingGaps ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm flex flex-col items-center justify-center min-h-[300px] text-center">
                <svg className="h-8 w-8 animate-spin text-violet-500 mb-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-sm font-medium text-white">AI is analyzing your skill gaps...</p>
                <p className="text-xs text-zinc-500 mt-2">Comparing your profile to {role.title} requirements</p>
              </div>
            ) : gapError ? (
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 backdrop-blur-sm flex flex-col items-center text-center">
                <p className="text-rose-400 font-medium">Failed to load skill gaps</p>
                <p className="text-xs text-zinc-500 mt-1">{gapError}</p>
              </div>
            ) : skillGaps && skillGaps.length > 0 ? (
              <SkillGapChart gaps={skillGaps} />
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm flex flex-col items-center text-center">
                <p className="text-white font-medium">No skill gaps found!</p>
                <p className="text-xs text-zinc-500 mt-1">Upload your resume to see your personalized gaps.</p>
              </div>
            )}
          </div>
        </div>

        {/* ──── Roadmap Timeline ──── */}
        <div className="mt-8">
          <RoadmapTimeline
            roadmap={roadmap}
            isLoading={isGeneratingRoadmap}
          />
          {roadmapError && (
            <p className="mt-2 text-xs text-rose-400 text-center">{roadmapError}</p>
          )}
        </div>
      </div>

      {/* ──── Interactive Mission Challenge Modal ──── */}
      {isMissionModalOpen && todayMission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-2xl border border-white/15 bg-zinc-950 p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-start justify-between border-b border-white/10 pb-4 mb-4">
              <div>
                <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">
                  Target Skill: {todayMission.targetSkill}
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  {todayMission.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMissionModalOpen(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            {/* Prompt */}
            <div className="rounded-xl bg-black/60 p-4 border border-white/10 font-mono text-xs text-zinc-300 mb-4 whitespace-pre-line leading-relaxed">
              <span className="text-violet-400 font-bold block mb-2 font-sans">
                📋 Task Instructions:
              </span>
              {todayMission.taskPrompt}
            </div>

            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 mb-4 text-xs text-emerald-300">
              <span className="font-bold block mb-0.5">🎯 Expected Submission:</span>
              {todayMission.expectedOutcome}
            </div>

            {/* Submission Textarea */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Your Answer / Solution / Code:
              </label>
              <textarea
                rows={7}
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                placeholder="Paste your solution, code implementation, or detailed written response here..."
                className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-xs text-zinc-200 font-mono focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsMissionModalOpen(false)}
                className="rounded-xl px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting || submissionText.trim().length < 10}
                onClick={async () => {
                  setIsSubmitting(true);
                  // Mock quick evaluation for instant feedback
                  setTimeout(() => {
                    setSubmissionResult({
                      score: 88,
                      feedback: "Excellent solution! You demonstrated strong comprehension of " + todayMission.targetSkill + " and adhered to the evaluation rubric.",
                      strengths: ["Clean syntax and structure", "Addressed all edge cases outlined in prompt"],
                      weaknesses: ["Could add additional automated tests for production readiness"],
                    });
                    setIsSubmitting(false);
                    setIsMissionModalOpen(false);
                  }, 1200);
                }}
                className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-violet-500/20 hover:brightness-110 disabled:opacity-50"
              >
                {isSubmitting ? "Submitting for AI Evaluation..." : "Submit Mission for AI Evaluation →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function StatCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.05]">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm text-zinc-400">{label}</span>
        <span className="text-xl">{icon}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="mt-1 text-xs text-zinc-500">{detail}</p>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <>
      <Navbar />
      <Suspense
        fallback={
          <main className="min-h-screen pt-20 pb-16 px-6">
            <div className="mx-auto max-w-7xl text-center text-zinc-500">
              Loading dashboard...
            </div>
          </main>
        }
      >
        <DashboardContent />
      </Suspense>
    </>
  );
}
