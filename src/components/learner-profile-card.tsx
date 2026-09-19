"use client";

import type { ResumeAnalysis } from "@/lib/schemas";
import { Badge } from "@/components/ui/badge";

interface LearnerProfileCardProps {
  profile: ResumeAnalysis;
}

const levelStyles = {
  beginner: {
    bg: "bg-sky-500/10",
    text: "text-sky-400",
    border: "border-sky-500/20",
    bar: "w-1/3 bg-gradient-to-r from-sky-500 to-cyan-500",
  },
  intermediate: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
    bar: "w-2/3 bg-gradient-to-r from-amber-500 to-orange-500",
  },
  advanced: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
    bar: "w-full bg-gradient-to-r from-emerald-500 to-green-500",
  },
};

export function LearnerProfileCard({ profile }: LearnerProfileCardProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* ──── Header ──── */}
      <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-transparent to-indigo-500/5 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-xl font-bold text-white shadow-lg shadow-violet-500/25">
            {profile.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{profile.name}</h2>
            <p className="text-sm text-zinc-400">
              {profile.skills.length} skills identified ·{" "}
              {profile.experience.length} roles ·{" "}
              {profile.education.length} degrees
            </p>
          </div>
        </div>
      </div>

      {/* ──── Skills ──── */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">
          Extracted Skills
        </h3>
        <div className="space-y-3">
          {profile.skills
            .sort((a, b) => {
              const order = { advanced: 0, intermediate: 1, beginner: 2 };
              return order[a.level] - order[b.level];
            })
            .map((skill) => {
              const styles = levelStyles[skill.level];
              return (
                <div key={skill.name} className="group">
                  <div className="mb-1 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-zinc-200">
                        {skill.name}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-semibold uppercase tracking-wider ${styles.bg} ${styles.text} ${styles.border}`}
                      >
                        {skill.level}
                      </Badge>
                    </div>
                    <span className="text-xs text-zinc-600">
                      {Math.round(skill.confidence * 100)}% confidence
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                    <div
                      className={`h-full rounded-full ${styles.bar} transition-all duration-700 ease-out`}
                      style={{ opacity: 0.4 + skill.confidence * 0.6 }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* ──── Experience ──── */}
      {profile.experience.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Experience</h3>
          <div className="space-y-4">
            {profile.experience.map((exp, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-white">
                      {exp.title}
                    </h4>
                    <p className="text-sm text-zinc-400">{exp.company}</p>
                  </div>
                  <span className="text-xs text-zinc-600">{exp.duration}</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                  {exp.description}
                </p>
                {exp.technologies.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {exp.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ──── Education ──── */}
      {profile.education.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Education</h3>
          <div className="space-y-3">
            {profile.education.map((edu, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4"
              >
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    {edu.degree} in {edu.field}
                  </h4>
                  <p className="text-xs text-zinc-500">{edu.institution}</p>
                </div>
                {edu.year && (
                  <span className="text-xs text-zinc-600">{edu.year}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ──── Projects ──── */}
      {profile.projects.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Projects</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {profile.projects.map((proj, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-4"
              >
                <h4 className="mb-1 text-sm font-semibold text-white">
                  {proj.name}
                </h4>
                <p className="mb-2 text-xs leading-relaxed text-zinc-500">
                  {proj.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {proj.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-md bg-violet-500/10 px-1.5 py-0.5 text-[10px] font-medium text-violet-400"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
