"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { AnimatedBackground } from "@/components/animated-background";
import { Navbar } from "@/components/navbar";
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Loader2,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";

function ForgotPasswordForm() {
  const { sendPasswordResetEmail } = useAuth();

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }

    setLoading(true);

    try {
      const { error: authError } = await sendPasswordResetEmail(email.trim());

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setResendCooldown(60);
      setLoading(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send reset link. Please try again.";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3.5 py-1 text-xs font-semibold text-violet-300 mb-4">
          <KeyRound className="h-3.5 w-3.5 text-violet-400" />
          Account Security
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight sm:text-4xl">
          Reset Your <span className="gradient-text">Password</span>
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Enter the email address tied to your EduPath account and we&apos;ll send you a secure password reset link.
        </p>
      </div>

      {/* Main Glass Card */}
      <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 backdrop-blur-2xl shadow-2xl shadow-black/40">
        <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-violet-600/15 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-indigo-600/15 blur-2xl pointer-events-none" />

        {/* Alerts */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-sm text-rose-300 animate-fade-in">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-400 mt-0.5" />
            <div className="leading-snug">{error}</div>
          </div>
        )}

        {success ? (
          <div className="text-center animate-fade-in">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Reset Link Sent</h3>
            <p className="text-sm text-zinc-300 mb-6 leading-relaxed">
              We&apos;ve sent recovery instructions to <span className="font-medium text-white">{email}</span>. Click the link in the email to set a new password.
            </p>

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs text-zinc-400 mb-6 text-left">
              <div className="font-semibold text-zinc-200 mb-1">Didn&apos;t get the email?</div>
              <ul className="list-disc list-inside space-y-1">
                <li>Check your spam or junk folder</li>
                <li>Make sure you entered the correct account email</li>
              </ul>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={resendCooldown > 0 || loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-zinc-200 hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
                ) : (
                  <RefreshCw className="h-4 w-4 text-zinc-400" />
                )}
                <span>
                  {resendCooldown > 0 ? `Resend email in ${resendCooldown}s` : "Resend reset link"}
                </span>
              </button>

              <Link
                href="/login"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 hover:brightness-110 transition-all"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Your Account Email
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 transition-colors focus:border-violet-500 focus:bg-violet-500/[0.04] focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 bg-[length:200%_auto] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all duration-300 hover:bg-[position:right_center] hover:shadow-violet-500/40 hover:brightness-110 active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Sending reset link...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>

            <div className="mt-6 border-t border-white/10 pt-5 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Return to sign in
              </Link>
            </div>
          </form>
        )}
      </div>

      {/* Safety notice */}
      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-500">
        <ShieldAlert className="h-4 w-4 text-zinc-400" />
        <span>Password reset links expire after 24 hours</span>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <>
      <AnimatedBackground />
      <Navbar />
      <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-24 sm:px-6">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20 text-zinc-400">
              <Loader2 className="h-6 w-6 animate-spin mr-2 text-violet-400" />
              Loading recovery portal...
            </div>
          }
        >
          <ForgotPasswordForm />
        </Suspense>
      </main>
    </>
  );
}
