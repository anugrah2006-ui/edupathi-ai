"use client";

import type { AnalyzedSkillGap } from "@/lib/schemas";

interface SkillGapChartProps {
  gaps: AnalyzedSkillGap[];
}

const priorityColors: Record<string, { bar: string; bg: string; text: string }> = {
  critical: {
    bar: "bg-gradient-to-r from-rose-500 to-pink-500",
    bg: "bg-rose-500/10",
    text: "text-rose-400",
  },
  high: {
    bar: "bg-gradient-to-r from-amber-500 to-orange-500",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
  },
  medium: {
    bar: "bg-gradient-to-r from-sky-500 to-blue-500",
    bg: "bg-sky-500/10",
    text: "text-sky-400",
  },
  low: {
    bar: "bg-gradient-to-r from-emerald-500 to-green-500",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
  },
};

export function SkillGapChart({ gaps }: SkillGapChartProps) {
  const sortedGaps = [...gaps].sort((a, b) => b.gap - a.gap);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Skill Gap Analysis</h3>
        <div className="flex gap-3 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-white/30" />
            <span className="text-zinc-500">Current</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-violet-500" />
            <span className="text-zinc-500">Required</span>
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {sortedGaps.map((gap) => {
          // Normalize gap priority if AI returns unexpected values
          let priority = gap.priority;
          if (priority !== "low" && priority !== "medium" && priority !== "high") {
            priority = gap.gap > 2 ? "high" : gap.gap > 0 ? "medium" : "low";
          }
          if (priority === "high" && gap.gap >= 3) {
             // Fallback handling to render the UI identically even if 'critical' wasn't strictly in the enum, though Zod restricts it.
          }
          const colors = priorityColors[priority] || priorityColors.medium;
          const currentPct = (gap.currentLevel / 5) * 100;
          const requiredPct = (gap.requiredLevel / 5) * 100;

          return (
            <div key={gap.skill} className="group">
              <div className="mb-1.5 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-zinc-200">
                      {gap.skill}
                    </span>
                    {gap.gap > 0 && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${colors.bg} ${colors.text}`}
                      >
                        {priority} Priority Gap
                      </span>
                    )}
                  </div>
                  {gap.reason && (
                    <p className="text-xs text-zinc-500 leading-relaxed mb-2">
                      {gap.reason}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-medium text-zinc-300">
                    {gap.currentLevel} <span className="text-zinc-600">/ 5</span>
                  </span>
                  <span className="mx-1 text-zinc-600">→</span>
                  <span className="text-xs font-medium text-violet-400">
                    {gap.requiredLevel} <span className="text-violet-900">/ 5</span>
                  </span>
                </div>
              </div>
              <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-white/5">
                {/* Current level */}
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-white/20 transition-all duration-700 ease-out"
                  style={{ width: `${currentPct}%` }}
                />
                {/* Required level marker */}
                <div
                  className={`absolute inset-y-0 left-0 rounded-full ${colors.bar} opacity-80 transition-all duration-700 ease-out`}
                  style={{ width: `${requiredPct}%` }}
                />
                {/* Current level overlay */}
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-white/30 transition-all duration-700 ease-out"
                  style={{ width: `${currentPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
