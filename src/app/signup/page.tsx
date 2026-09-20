"use client";

import { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { AnimatedBackground } from "@/components/animated-background";
import { Navbar } from "@/components/navbar";
import { TARGET_ROLES } from "@/lib/mock-data";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Loader2,
  Briefcase,
  Check,
  X,
  ShieldCheck,
} from "lucide-react";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") || "";

  const { signUpWithEmail, signInWithOAuth } = useAuth();

  const [fullName, setFullName] = useState("");
  const [targetRole, setTargetRole] = useState(initialRole || TARGET_ROLES[0]?.id || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(null);

  // Real-time password strength score & checks
  const passwordCriteria = useMemo(() => {
    return {
      hasMinLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[^A-Za-z0-9]/.test(password),
    };
  }, [password]);

  const strengthScore = useMemo(() => {
    let score = 0;
    if (passwordCriteria.hasMinLength) score += 1;
    if (passwordCriteria.hasUppercase) score += 1;
    if (passwordCriteria.hasNumber) score += 1;
    if (passwordCriteria.hasSpecial) score += 1;
    return score;
  }, [passwordCriteria]);

  const strengthColor = () => {
    if (strengthScore <= 1) return "bg-rose-500";
    if (strengthScore === 2) return "bg-amber-500";
    if (strengthScore === 3) return "bg-blue-500";
    return "bg-emerald-500";
  };

  const strengthLabel = () => {
    if (!password) return "";
    if (strengthScore <= 1) return "Weak";
    if (strengthScore === 2) return "Fair";
    if (strengthScore === 3) return "Good";
    return "Strong";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError("Please provide your full name.");
      return;
    }

    if (!email.trim() || !password) {
      setError("Please fill out all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    if (!agreeTerms) {
      setError("Please accept the terms to create your account.");
      return;
    }

    setLoading(true);

    try {
      const selectedRoleObj = TARGET_ROLES.find((r) => r.id === targetRole);
      const roleTitle = selectedRoleObj ? selectedRoleObj.title : targetRole;

      const { data, error: authError } = await signUpWithEmail(email.trim(), password, {
        full_name: fullName.trim(),
        target_role: roleTitle,
      });

      if (authError) {
        if (authError.message.toLowerCase().includes("user already registered")) {
          setError("An account with this email already exists. Try signing in instead.");
        } else {
          setError(authError.message);
        }
        setLoading(false);
        return;
      }

      // If Supabase confirms session directly or requires email confirmation
      if (data?.session) {
        // Direct session logged in
        router.push("/dashboard");
        router.refresh();
      } else {
        // Confirmation email sent
        setConfirmationSent(true);
        setLoading(false);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create account. Please try again.";
      setError(message);
      setLoading(false);
    }
  };

  const handleOAuthSignup = async (provider: "google" | "github") => {
    setError(null);
    setOauthLoading(provider);
    try {
      const { error: authError } = await signInWithOAuth(provider);
      if (authError) {
        setError(authError.message);
        setOauthLoading(null);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to initiate social signup.";
      setError(message);
      setOauthLoading(null);
    }
  };

  if (confirmationSent) {
    return (
      <div className="w-full max-w-md animate-fade-in">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center backdrop-blur-2xl shadow-2xl shadow-black/40">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/30 text-violet-400">
            <Mail className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Check Your Inbox</h2>
          <p className="text-sm text-zinc-300 mb-6 leading-relaxed">
            We&apos;ve sent a verification link to <span className="font-semibold text-white">{email}</span>. Please click the link to activate your EduPath AI account and start your personalized roadmap.
          </p>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs text-zinc-400 mb-6 text-left">
            <span className="font-medium text-zinc-200">Didn&apos;t receive it?</span>
            <ul className="mt-1.5 list-disc list-inside space-y-1">
              <li>Check your spam or junk folder</li>
              <li>Allow 1-2 minutes for delivery</li>
            </ul>
          </div>
          <div className="flex flex-col gap-3">
            <Link
              href="/login"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 hover:brightness-110 transition-all"
            >
              Proceed to Sign In
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3.5 py-1 text-xs font-semibold text-violet-300 mb-4">
          <Sparkles className="h-3.5 w-3.5 text-violet-400" />
          Join EduPath AI
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight sm:text-4xl">
          Start Your <span className="gradient-text">Learning Journey</span>
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Create your account to unlock AI-powered skill gap analysis and adaptive daily missions.
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

        {/* Social Auth Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => handleOAuthSignup("google")}
            disabled={loading || oauthLoading !== null}
            className="flex items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-zinc-200 transition-all hover:bg-white/[0.09] hover:border-white/20 active:scale-[0.98] disabled:opacity-50"
          >
            {oauthLoading === "google" ? (
              <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
            ) : (
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.5s.7 4.8 1.9 7.2l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 17C3.7 20.7 7.5 24 12 24z"
                />
              </svg>
            )}
            <span>Google</span>
          </button>

          <button
            type="button"
            onClick={() => handleOAuthSignup("github")}
            disabled={loading || oauthLoading !== null}
            className="flex items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-zinc-200 transition-all hover:bg-white/[0.09] hover:border-white/20 active:scale-[0.98] disabled:opacity-50"
          >
            {oauthLoading === "github" ? (
              <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
            ) : (
              <svg className="h-4 w-4 shrink-0 fill-current text-white" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            )}
            <span>GitHub</span>
          </button>
        </div>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <span className="relative bg-[#0d0d14] px-3 text-xs uppercase tracking-wider text-zinc-500 font-medium">
            or sign up with email
          </span>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
                <User className="h-4 w-4" />
              </div>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Mercer"
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 transition-colors focus:border-violet-500 focus:bg-violet-500/[0.04] focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Target Career Role
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
                <Briefcase className="h-4 w-4" />
              </div>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full appearance-none rounded-xl border border-white/10 bg-[#12121c] py-2.5 pl-10 pr-10 text-sm text-white transition-colors focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              >
                {TARGET_ROLES.map((role) => (
                  <option key={role.id} value={role.id} className="bg-[#12121c] text-white">
                    {role.icon} {role.title} ({role.category})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-400">
                ▼
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Work or Personal Email
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
                placeholder="alex@example.com"
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 transition-colors focus:border-violet-500 focus:bg-violet-500/[0.04] focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Create Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-10 pr-10 text-sm text-white placeholder-zinc-500 transition-colors focus:border-violet-500 focus:bg-violet-500/[0.04] focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-500 hover:text-zinc-300"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Password strength meter */}
            {password && (
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-400">Password strength:</span>
                  <span className={`font-semibold ${strengthScore >= 3 ? "text-emerald-400" : strengthScore === 2 ? "text-amber-400" : "text-rose-400"}`}>
                    {strengthLabel()}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 h-1">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`h-full rounded-full transition-all duration-300 ${
                        step <= strengthScore ? strengthColor() : "bg-white/10"
                      }`}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-zinc-400 pt-1">
                  <span className="flex items-center gap-1.5">
                    {passwordCriteria.hasMinLength ? (
                      <Check className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <X className="h-3 w-3 text-zinc-600" />
                    )}
                    8+ characters
                  </span>
                  <span className="flex items-center gap-1.5">
                    {passwordCriteria.hasUppercase ? (
                      <Check className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <X className="h-3 w-3 text-zinc-600" />
                    )}
                    Uppercase letter
                  </span>
                  <span className="flex items-center gap-1.5">
                    {passwordCriteria.hasNumber ? (
                      <Check className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <X className="h-3 w-3 text-zinc-600" />
                    )}
                    Number
                  </span>
                  <span className="flex items-center gap-1.5">
                    {passwordCriteria.hasSpecial ? (
                      <Check className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <X className="h-3 w-3 text-zinc-600" />
                    )}
                    Special character
                  </span>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className={`w-full rounded-xl border bg-white/[0.04] py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 transition-colors focus:outline-none focus:ring-1 ${
                  confirmPassword && confirmPassword !== password
                    ? "border-rose-500/50 focus:border-rose-500 focus:ring-rose-500"
                    : "border-white/10 focus:border-violet-500 focus:ring-violet-500"
                }`}
              />
            </div>
            {confirmPassword && confirmPassword !== password && (
              <p className="mt-1 text-[11px] text-rose-400">Passwords do not match</p>
            )}
          </div>

          <div className="pt-1">
            <label className="flex items-start gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 text-violet-600 focus:ring-violet-500"
              />
              <span className="text-xs text-zinc-400 leading-normal">
                I agree to the EduPath AI Terms of Service and Privacy Policy.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 bg-[length:200%_auto] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all duration-300 hover:bg-[position:right_center] hover:shadow-violet-500/40 hover:brightness-110 active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Setting up account...</span>
              </>
            ) : (
              <>
                <span>Create Free Account</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 border-t border-white/10 pt-5 text-center text-xs text-zinc-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-violet-400 hover:text-violet-300 transition-colors"
          >
            Sign in here →
          </Link>
        </div>
      </div>

      {/* Trust & security */}
      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-500">
        <ShieldCheck className="h-4 w-4 text-zinc-400" />
        <span>Free tier includes unlimited skill analyses & AI roadmaps</span>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <>
      <AnimatedBackground />
      <Navbar />
      <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-24 sm:px-6">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20 text-zinc-400">
              <Loader2 className="h-6 w-6 animate-spin mr-2 text-violet-400" />
              Loading registration portal...
            </div>
          }
        >
          <SignupForm />
        </Suspense>
      </main>
    </>
  );
}
