"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TARGET_ROLES } from "@/lib/mock-data";
import { Navbar } from "@/components/navbar";
import { AnimatedBackground } from "@/components/animated-background";

export default function GetStartedPage() {
  const router = useRouter();
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  const categories = [...new Set(TARGET_ROLES.map((r) => r.category))];

  const handleContinue = () => {
    if (selectedRoleId) {
      router.push(`/get-started/upload?role=${selectedRoleId}`);
    }
  };

  return (
    <>
      <AnimatedBackground />
      <Navbar />

      <main className="relative z-10 min-h-screen pt-24 pb-16 px-6">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="mb-10 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-zinc-400">
              Step 1 of 2
            </div>
            <h1 className="mb-3 text-3xl font-bold text-white sm:text-4xl">
              What role are you{" "}
              <span className="gradient-text">aiming for</span>?
            </h1>
            <p className="mx-auto max-w-lg text-zinc-500">
              Select your target career role. We&apos;ll analyze your skills
              against this role&apos;s requirements.
            </p>
          </div>

          {/* Role Grid by Category */}
          {categories.map((category) => (
            <div key={category} className="mb-8">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-600">
                {category}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {TARGET_ROLES.filter((r) => r.category === category).map(
                  (role) => {
                    const isSelected = selectedRoleId === role.id;
                    return (
                      <button
                        key={role.id}
                        onClick={() => setSelectedRoleId(role.id)}
                        className={`group relative rounded-xl border p-5 text-left transition-all duration-300 ${
                          isSelected
                            ? "border-violet-500/50 bg-violet-500/10 shadow-lg shadow-violet-500/10 scale-[1.02]"
                            : "border-white/8 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.05]"
                        }`}
                      >
                        {/* Selection indicator */}
                        <div
                          className={`absolute top-4 right-4 flex h-5 w-5 items-center justify-center rounded-full border transition-all ${
                            isSelected
                              ? "border-violet-500 bg-violet-500"
                              : "border-white/20"
                          }`}
                        >
                          {isSelected && (
                            <svg
                              className="h-3 w-3 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={3}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>

                        <span className="mb-3 inline-block text-2xl">
                          {role.icon}
                        </span>
                        <h3 className="mb-1 text-base font-semibold text-white">
                          {role.title}
                        </h3>
                        <p className="text-sm leading-relaxed text-zinc-500 pr-6">
                          {role.description}
                        </p>

                        {/* Skills preview */}
                        <div className="mt-3 flex flex-wrap gap-1">
                          {role.requiredSkills.slice(0, 4).map((skill) => (
                            <span
                              key={skill.name}
                              className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500"
                            >
                              {skill.name}
                            </span>
                          ))}
                          {role.requiredSkills.length > 4 && (
                            <span className="text-[10px] text-zinc-600">
                              +{role.requiredSkills.length - 4} more
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          ))}

          {/* Continue Button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleContinue}
              disabled={!selectedRoleId}
              className={`rounded-xl px-10 py-4 text-base font-semibold transition-all duration-300 ${
                selectedRoleId
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 hover:brightness-110 active:scale-[0.98]"
                  : "bg-white/5 text-zinc-600 cursor-not-allowed"
              }`}
            >
              Continue to Resume Upload →
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
