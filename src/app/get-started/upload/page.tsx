"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TARGET_ROLES } from "@/lib/mock-data";
import { Navbar } from "@/components/navbar";
import { AnimatedBackground } from "@/components/animated-background";
import { ResumeDropzone } from "@/components/resume-dropzone";
import { LearnerProfileCard } from "@/components/learner-profile-card";
import { Textarea } from "@/components/ui/textarea";
import type { ResumeAnalysis } from "@/lib/schemas";

type AnalysisState =
  | { status: "idle" }
  | { status: "uploading"; stage: string }
  | { status: "success"; profile: ResumeAnalysis }
  | { status: "error"; message: string };

function UploadContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleId = searchParams.get("role");
  const role = TARGET_ROLES.find((r) => r.id === roleId);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    status: "idle",
  });

  const canProceed =
    (selectedFile || resumeText.trim().length > 50) &&
    analysisState.status !== "uploading";

  const handleAnalyze = async () => {
    setAnalysisState({ status: "uploading", stage: "Preparing upload..." });

    try {
      const formData = new FormData();

      if (selectedFile) {
        formData.append("file", selectedFile);
        setAnalysisState({
          status: "uploading",
          stage: "Extracting text from PDF...",
        });
      } else {
        formData.append("resumeText", resumeText);
      }

      setAnalysisState({
        status: "uploading",
        stage: "Analyzing with AI...",
      });

      const response = await fetch("/api/analyze-resume", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setAnalysisState({
          status: "error",
          message: data.error || "An unexpected error occurred.",
        });
        return;
      }

      if (!data.profile) {
        setAnalysisState({
          status: "error",
          message: "Received an empty response from the AI.",
        });
        return;
      }

      setAnalysisState({ status: "success", profile: data.profile });
    } catch (err) {
      console.error("Upload error:", err);
      setAnalysisState({
        status: "error",
        message:
          "Failed to connect to the server. Please check your connection and try again.",
      });
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResumeText("");
    setAnalysisState({ status: "idle" });
  };

  const handleContinueToDashboard = () => {
    if (analysisState.status === "success") {
      // Store profile in sessionStorage for the dashboard
      sessionStorage.setItem(
        "edupath_profile",
        JSON.stringify(analysisState.profile)
      );
      router.push(`/dashboard?role=${roleId}`);
    }
  };

  return (
    <main className="relative z-10 min-h-screen pt-24 pb-16 px-6">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-zinc-400">
            Step 2 of 2
          </div>
          <h1 className="mb-3 text-3xl font-bold text-white sm:text-4xl">
            Upload your <span className="gradient-text">resume</span>
          </h1>
          <p className="mx-auto max-w-lg text-zinc-500">
            We&apos;ll extract your skills and experience to identify gaps
            against your target role.
          </p>
        </div>

        {/* Selected Role Badge */}
        {role && (
          <div className="mb-8 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-xl border border-violet-500/20 bg-violet-500/10 px-4 py-2">
              <span className="text-lg">{role.icon}</span>
              <span className="text-sm font-medium text-violet-300">
                Target: {role.title}
              </span>
            </div>
          </div>
        )}

        {/* ──── Show profile result if success ──── */}
        {analysisState.status === "success" ? (
          <div className="space-y-6">
            {/* Success banner */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
              <p className="text-sm font-medium text-emerald-400">
                ✓ Resume analyzed successfully!
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Review your extracted profile below.
              </p>
            </div>

            <LearnerProfileCard profile={analysisState.profile} />

            {/* Actions */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={handleContinueToDashboard}
                className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-3.5 text-sm font-semibold text-white shadow-xl shadow-violet-500/25 transition-all duration-300 hover:shadow-violet-500/40 hover:brightness-110 active:scale-[0.98]"
              >
                Continue to Dashboard →
              </button>
              <button
                onClick={handleReset}
                className="rounded-xl border border-white/10 bg-white/5 px-8 py-3.5 text-sm font-medium text-zinc-400 transition-all hover:bg-white/10 hover:text-white"
              >
                Upload Different Resume
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Dropzone */}
            <ResumeDropzone onFileSelect={(file) => setSelectedFile(file)} />

            {/* Divider */}
            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-sm text-zinc-600">
                or paste your resume
              </span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            {/* Text Fallback */}
            <Textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume text here..."
              rows={8}
              className="w-full rounded-xl border-white/10 bg-white/[0.03] text-sm text-zinc-300 placeholder:text-zinc-600 focus:border-violet-500/40 focus:ring-violet-500/20 resize-none"
            />
            <p className="mt-2 text-xs text-zinc-600">
              {resumeText.length > 0
                ? `${resumeText.length} characters`
                : "Minimum 50 characters"}
            </p>

            {/* Error Display */}
            {analysisState.status === "error" && (
              <div className="mt-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
                <div className="flex items-start gap-3">
                  <span className="text-rose-400 text-lg">⚠</span>
                  <div>
                    <p className="text-sm font-medium text-rose-400">
                      Analysis Failed
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                      {analysisState.message}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Analyze Button */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleAnalyze}
                disabled={!canProceed}
                className={`flex items-center gap-3 rounded-xl px-10 py-4 text-base font-semibold transition-all duration-300 ${
                  canProceed
                    ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 hover:brightness-110 active:scale-[0.98]"
                    : "bg-white/5 text-zinc-600 cursor-not-allowed"
                }`}
              >
                {analysisState.status === "uploading" ? (
                  <>
                    <svg
                      className="h-5 w-5 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    {analysisState.stage}
                  </>
                ) : (
                  "Analyze My Skills →"
                )}
              </button>
            </div>

            {/* Privacy note */}
            <p className="mt-6 text-center text-xs text-zinc-600">
              🔒 Your resume is processed securely and never stored permanently.
            </p>
          </>
        )}
      </div>
    </main>
  );
}

export default function UploadPage() {
  return (
    <>
      <AnimatedBackground />
      <Navbar />
      <Suspense
        fallback={
          <main className="relative z-10 min-h-screen pt-24 pb-16 px-6">
            <div className="mx-auto max-w-2xl text-center text-zinc-500">
              Loading...
            </div>
          </main>
        }
      >
        <UploadContent />
      </Suspense>
    </>
  );
}
