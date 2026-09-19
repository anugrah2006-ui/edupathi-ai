"use client";

import { useState } from "react";
import type { RoadmapWeekPlan, RoadmapPlan } from "@/lib/schemas";
import { Badge } from "@/components/ui/badge";

interface RoadmapTimelineProps {
  roadmap?: RoadmapPlan | null;
  weeks?: RoadmapWeekPlan[];
  isLoading?: boolean;
}

const activityTypeIcons: Record<string, string> = {
  coding: "💻",
  reading: "📖",
  exercise: "⚡",
  quiz: "❓",
  project: "🏗️",
};

export function RoadmapTimeline({ roadmap, weeks: propWeeks, isLoading = false }: RoadmapTimelineProps) {
  const weeks = roadmap?.weeks || propWeeks || [];
  const [activeWeek, setActiveWeek] = useState<number>(1);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
          <h3 className="text-lg font-semibold text-white">AI is crafting your 4-week roadmap...</h3>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((w) => (
            <div key={w} className="h-44 rounded-xl border border-white/5 bg-white/[0.02] p-4 animate-pulse">
              <div className="h-4 w-16 bg-white/10 rounded mb-3" />
              <div className="h-5 w-3/4 bg-white/10 rounded mb-2" />
              <div className="h-3 w-full bg-white/5 rounded mb-1" />
              <div className="h-3 w-5/6 bg-white/5 rounded mb-4" />
              <div className="h-6 w-1/2 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (weeks.length === 0) {
    return null;
  }

  const selectedWeekData = weeks.find((w) => w.weekNumber === activeWeek) || weeks[0];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-white">
              Personalized 4-Week Roadmap
            </h3>
            <span className="rounded-full bg-violet-500/20 px-2.5 py-0.5 text-[11px] font-medium text-violet-300 border border-violet-500/30">
              AI Generated
            </span>
          </div>
          {roadmap?.overview && (
            <p className="mt-1 text-xs text-zinc-400 max-w-2xl leading-relaxed">
              {roadmap.overview}
            </p>
          )}
        </div>
      </div>

      {/* Week selection cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {weeks.map((week) => {
          const isSelected = week.weekNumber === activeWeek;
          const isWeek1 = week.weekNumber === 1;

          return (
            <button
              key={week.weekNumber}
              type="button"
              onClick={() => setActiveWeek(week.weekNumber)}
              className={`group relative rounded-xl border p-4 text-left transition-all duration-300 ${
                isSelected
                  ? "border-violet-500/60 bg-violet-500/15 shadow-lg shadow-violet-500/10 ring-1 ring-violet-500/40"
                  : "border-white/5 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.05]"
              }`}
            >
              {/* Top row */}
              <div className="mb-2.5 flex items-center justify-between">
                <span
                  className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                    isSelected
                      ? "bg-violet-500/30 text-violet-200"
                      : isWeek1
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-white/5 text-zinc-400"
                  }`}
                >
                  Week {week.weekNumber}
                </span>
                <span className="text-[11px] text-zinc-500 font-mono">
                  ⏱ {week.estimatedTime}
                </span>
              </div>

              {/* Theme */}
              <h4
                className={`mb-1.5 text-sm font-semibold line-clamp-1 ${
                  isSelected ? "text-white" : "text-zinc-200"
                }`}
              >
                {week.theme}
              </h4>

              {/* Skills preview tags */}
              <div className="flex flex-wrap gap-1 mt-2">
                {week.skillsImproved.slice(0, 2).map((sk) => (
                  <span
                    key={sk}
                    className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-zinc-400 font-mono truncate max-w-[120px]"
                  >
                    {sk}
                  </span>
                ))}
                {week.skillsImproved.length > 2 && (
                  <span className="text-[10px] text-zinc-500 self-center">
                    +{week.skillsImproved.length - 2}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Deep Detail Drawer for Selected Week */}
      {selectedWeekData && (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-4 mb-5">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-violet-400">
                Week {selectedWeekData.weekNumber} Deep Dive
              </span>
              <h4 className="text-base font-bold text-white mt-0.5">
                {selectedWeekData.theme}
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">Estimated Effort:</span>
              <Badge variant="outline" className="border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs">
                {selectedWeekData.estimatedTime}
              </Badge>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* 1. Learning Objectives */}
            <div>
              <h5 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
                <span>🎯</span> Learning Objectives
              </h5>
              <ul className="space-y-2">
                {selectedWeekData.learningObjectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-zinc-300 leading-relaxed">
                    <span className="text-violet-400 font-bold mt-0.5">•</span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>

              <h5 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mt-5 mb-2.5 flex items-center gap-1.5">
                <span>⚡</span> Targeted Skills
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {selectedWeekData.skillsImproved.map((s) => (
                  <span
                    key={s}
                    className="rounded-md bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 text-[11px] font-medium text-violet-300"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* 2. Structured Activities */}
            <div>
              <h5 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
                <span>📚</span> Weekly Activities ({selectedWeekData.activities.length})
              </h5>
              <div className="space-y-2.5">
                {selectedWeekData.activities.map((act, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-white/5 bg-white/[0.02] p-2.5 transition hover:border-white/10"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-medium text-zinc-200 flex items-center gap-1.5">
                        <span>{activityTypeIcons[act.type] || "📌"}</span>
                        <span>{act.title}</span>
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono whitespace-nowrap">
                        {act.estimatedMinutes}m
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed pl-5">
                      {act.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Practical Project / Task */}
            <div>
              <h5 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-1.5">
                <span>🏗️</span> Practical Milestone Project
              </h5>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5">
                <h6 className="text-xs font-bold text-white mb-1">
                  {selectedWeekData.project.title}
                </h6>
                <p className="text-[11px] text-zinc-300 leading-relaxed mb-3">
                  {selectedWeekData.project.description}
                </p>
                <div className="rounded-lg bg-black/30 p-2 border border-white/5 mb-3">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-0.5">
                    📦 Deliverable:
                  </span>
                  <p className="text-[11px] text-zinc-300 font-mono">
                    {selectedWeekData.project.deliverable}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1.5">
                    ✓ Success Criteria:
                  </span>
                  <ul className="space-y-1">
                    {selectedWeekData.project.criteria.map((c, i) => (
                      <li key={i} className="text-[11px] text-zinc-400 flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
