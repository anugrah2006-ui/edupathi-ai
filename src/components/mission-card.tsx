"use client";

import { useState } from "react";
import type { TodayMission } from "@/lib/schemas";
import { Badge } from "@/components/ui/badge";

interface MissionCardProps {
  mission: TodayMission;
  isActive?: boolean;
  onStart?: () => void;
  isLoading?: boolean;
}

const typeIcons: Record<string, string> = {
  coding: "💻",
  quiz: "❓",
  written: "✍️",
  project: "🏗️",
};

export function MissionCard({
  mission,
  isActive = true,
  onStart,
  isLoading = false,
}: MissionCardProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-1/3 bg-white/10 rounded" />
          <div className="h-5 w-20 bg-white/10 rounded" />
        </div>
        <div className="h-4 w-full bg-white/5 rounded mb-2" />
        <div className="h-4 w-2/3 bg-white/5 rounded mb-6" />
        <div className="h-10 w-full bg-white/10 rounded-xl" />
      </div>
    );
  }

  if (!mission) return null;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 ${
        isActive
          ? "border-violet-500/40 bg-gradient-to-br from-violet-500/10 via-transparent to-indigo-500/5 shadow-xl shadow-violet-500/10"
          : "border-white/10 bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.05]"
      }`}
    >
      {/* Glow effect */}
      {isActive && (
        <div className="absolute -top-20 -right-20 h-44 w-44 rounded-full bg-violet-500/15 blur-3xl pointer-events-none" />
      )}

      <div className="relative">
        {/* Header */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="text-3xl p-2 rounded-xl bg-white/5 border border-white/5">
              {typeIcons[mission.type] || "⚡"}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="rounded-full bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-rose-300">
                  Target: {mission.targetSkill}
                </span>
                <span className="text-[11px] text-zinc-400 font-mono">
                  Level {mission.currentLevel} → Level {mission.targetLevel}
                </span>
              </div>
              <h4 className="text-lg font-bold text-white leading-snug">
                {mission.title}
              </h4>
              <p className="mt-0.5 text-xs text-zinc-500 font-mono">
                ⏱ ~{mission.estimatedMinutes} mins · Format: {mission.type.toUpperCase()}
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="self-start border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs uppercase tracking-wider font-semibold"
          >
            Today&apos;s Mission
          </Badge>
        </div>

        {/* Description */}
        <p className="mb-4 text-sm leading-relaxed text-zinc-300">
          {mission.description}
        </p>

        {/* Task prompt preview / full */}
        <div className="mb-4 rounded-xl border border-white/5 bg-black/40 p-4 font-mono text-xs text-zinc-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-violet-400">
              📋 Instructions & Task
            </span>
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[11px] text-zinc-500 hover:text-zinc-300 underline"
            >
              {isExpanded ? "Show Less" : "Expand Details"}
            </button>
          </div>
          <div className={`whitespace-pre-line leading-relaxed ${isExpanded ? "" : "line-clamp-3"}`}>
            {mission.taskPrompt}
          </div>
        </div>

        {/* Expected Outcome Box */}
        <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
            🎯 Expected Deliverable
          </span>
          <p className="text-xs text-zinc-300 leading-relaxed">
            {mission.expectedOutcome}
          </p>
        </div>

        {/* Evaluation Criteria Rubric */}
        {mission.evaluationCriteria && mission.evaluationCriteria.length > 0 && (
          <div className="mb-5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
              ⚖️ AI Evaluation Criteria
            </span>
            <div className="flex flex-wrap gap-1.5">
              {mission.evaluationCriteria.map((crit, idx) => (
                <span
                  key={idx}
                  className="rounded-md bg-white/5 border border-white/5 px-2.5 py-1 text-[11px] text-zinc-300"
                >
                  ✓ {crit}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        {onStart && (
          <button
            onClick={onStart}
            className="w-full rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all duration-200 hover:shadow-violet-500/40 hover:brightness-110 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span>Start Today&apos;s Challenge</span>
            <span>→</span>
          </button>
        )}
      </div>
    </div>
  );
}
