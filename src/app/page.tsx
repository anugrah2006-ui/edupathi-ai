import Link from "next/link";
import { AnimatedBackground } from "@/components/animated-background";
import { Navbar } from "@/components/navbar";

export default function LandingPage() {
  return (
    <>
      <AnimatedBackground />
      <Navbar />

      <main className="relative z-10">
        {/* ──── Hero Section ──── */}
        <section className="flex min-h-screen flex-col items-center justify-center px-6 pt-16">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-sm font-medium text-violet-300 animate-fade-in">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
              AI-Powered Career Learning
            </div>

            {/* Headline */}
            <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl animate-slide-up opacity-0">
              Your Personalized Path to{" "}
              <span className="gradient-text">Career Mastery</span>
            </h1>

            {/* Subtitle */}
            <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-zinc-400 animate-slide-up-delayed opacity-0">
              Upload your resume, pick your dream role, and let AI analyze your
              skill gaps. Get a tailored 4-week roadmap with adaptive daily
              missions that evolve based on your performance.
            </p>

            {/* CTAs */}
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center animate-slide-up-delayed opacity-0">
              <Link
                href="/get-started"
                className="group relative rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-violet-500/25 transition-all duration-300 hover:shadow-violet-500/40 hover:brightness-110 active:scale-[0.98]"
              >
                <span className="relative z-10">
                  Get Started — It&apos;s Free →
                </span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-50" />
              </Link>
              <a
                href="#how-it-works"
                className="rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-base font-medium text-zinc-300 backdrop-blur-sm transition-all duration-200 hover:bg-white/10 hover:text-white"
              >
                See How It Works
              </a>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-float">
            <div className="flex flex-col items-center gap-2 text-zinc-600">
              <span className="text-xs">Scroll</span>
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </div>
          </div>
        </section>

        {/* ──── Features Section ──── */}
        <section id="features" className="px-6 py-32">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
                Everything You Need to{" "}
                <span className="gradient-text">Level Up</span>
              </h2>
              <p className="mx-auto max-w-xl text-zinc-400">
                Powered by AI, designed for real career growth — not just another
                course platform.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <FeatureCard
                icon="🎯"
                title="Skill Gap Analysis"
                description="Upload your resume and select a target role. Our AI identifies exactly what skills you're missing and prioritizes them by importance."
                gradient="from-rose-500/10 to-pink-500/5"
                borderColor="border-rose-500/20"
              />
              <FeatureCard
                icon="🗺️"
                title="Personalized Roadmap"
                description="Get a structured 4-week learning plan tailored to your gaps. Each week builds on the last with increasing complexity."
                gradient="from-violet-500/10 to-indigo-500/5"
                borderColor="border-violet-500/20"
              />
              <FeatureCard
                icon="🔄"
                title="Adaptive Missions"
                description="Daily missions that adapt to your performance. Struggled with TypeScript? Tomorrow's mission doubles down on it."
                gradient="from-sky-500/10 to-blue-500/5"
                borderColor="border-sky-500/20"
              />
            </div>
          </div>
        </section>

        {/* ──── How It Works Section ──── */}
        <section id="how-it-works" className="px-6 py-32">
          <div className="mx-auto max-w-5xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
                How It Works
              </h2>
              <p className="mx-auto max-w-xl text-zinc-400">
                From zero to a personalized learning plan in minutes.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-4">
              {[
                {
                  step: "01",
                  title: "Pick Your Role",
                  desc: "Choose from curated career paths like Frontend Engineer, ML Engineer, or Product Manager.",
                },
                {
                  step: "02",
                  title: "Upload Resume",
                  desc: "Drop your PDF resume and let AI extract your skills, experience, and background.",
                },
                {
                  step: "03",
                  title: "Get Your Roadmap",
                  desc: "AI generates a 4-week plan targeting your specific skill gaps with daily missions.",
                },
                {
                  step: "04",
                  title: "Learn & Adapt",
                  desc: "Complete missions, get instant feedback, and watch your next mission adapt to your weaknesses.",
                },
              ].map((item) => (
                <div key={item.step} className="group text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-lg font-bold text-violet-400 transition-all duration-300 group-hover:border-violet-500/30 group-hover:bg-violet-500/10">
                    {item.step}
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-500">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ──── CTA Section ──── */}
        <section className="px-6 py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-violet-500/10 via-transparent to-indigo-500/5 p-12 backdrop-blur-sm">
              <h2 className="mb-4 text-3xl font-bold text-white">
                Ready to close your skill gaps?
              </h2>
              <p className="mb-8 text-zinc-400">
                Join learners who are accelerating their careers with AI-powered
                learning paths.
              </p>
              <Link
                href="/get-started"
                className="inline-flex rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-violet-500/25 transition-all duration-300 hover:shadow-violet-500/40 hover:brightness-110"
              >
                Start Your Learning Path →
              </Link>
            </div>
          </div>
        </section>

        {/* ──── Footer ──── */}
        <footer className="border-t border-white/5 px-6 py-8">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <p className="text-sm text-zinc-600">
              © 2026 EduPath AI. Built for the AI Hackathon.
            </p>
            <div className="flex gap-4 text-sm text-zinc-600">
              <span>Privacy</span>
              <span>Terms</span>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  gradient,
  borderColor,
}: {
  icon: string;
  title: string;
  description: string;
  gradient: string;
  borderColor: string;
}) {
  return (
    <div
      className={`group rounded-2xl border ${borderColor} bg-gradient-to-br ${gradient} p-6 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}
    >
      <span className="mb-4 inline-block text-3xl">{icon}</span>
      <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
      <p className="text-sm leading-relaxed text-zinc-400">{description}</p>
    </div>
  );
}
