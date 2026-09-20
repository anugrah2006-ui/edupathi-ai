"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { AnimatedBackground } from "@/components/animated-background";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    async function handleAuthCallback() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          setStatus("error");
          setErrorMessage(error.message);
          return;
        }

        if (data.session) {
          setStatus("success");
          setTimeout(() => {
            router.push(next);
            router.refresh();
          }, 800);
        } else {
          // Listen for onAuthStateChange
          const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (session) {
              setStatus("success");
              setTimeout(() => {
                router.push(next);
                router.refresh();
              }, 800);
            } else if (event === "SIGNED_OUT") {
              router.push("/login");
            }
          });

          return () => {
            authListener.subscription.unsubscribe();
          };
        }
      } catch (err: unknown) {
        setStatus("error");
        setErrorMessage(err instanceof Error ? err.message : "Authentication failed.");
      }
    }

    handleAuthCallback();
  }, [router, next]);

  return (
    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center backdrop-blur-2xl shadow-2xl">
      {status === "loading" && (
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
            <Loader2 className="h-7 w-7 animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-white">Completing Authentication</h2>
          <p className="text-sm text-zinc-400">Verifying credentials and syncing your EduPath session...</p>
        </div>
      )}

      {status === "success" && (
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-white">Authentication Successful!</h2>
          <p className="text-sm text-zinc-400">Taking you to your learning workspace...</p>
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-white">Authentication Issue</h2>
          <p className="text-sm text-zinc-400">{errorMessage || "We were unable to complete authentication."}</p>
          <Link
            href="/login"
            className="mt-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 transition-colors"
          >
            Return to Login
          </Link>
        </div>
      )}
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <>
      <AnimatedBackground />
      <main className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <Suspense
          fallback={
            <div className="flex items-center justify-center text-zinc-400">
              <Loader2 className="h-6 w-6 animate-spin mr-2 text-violet-400" />
              Loading...
            </div>
          }
        >
          <AuthCallbackContent />
        </Suspense>
      </main>
    </>
  );
}
