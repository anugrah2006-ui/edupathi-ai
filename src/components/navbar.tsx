"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-violet-500/25 group-hover:shadow-violet-500/40 transition-shadow">
            EP
          </div>
          <span className="text-lg font-semibold text-white tracking-tight">
            EduPath
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              {" "}AI
            </span>
          </span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-1">
          {isDashboard ? (
            <>
              <NavLink href="/dashboard" active={pathname === "/dashboard"}>
                Overview
              </NavLink>
              <NavLink
                href="/dashboard/missions"
                active={pathname === "/dashboard/missions"}
              >
                Missions
              </NavLink>
              <NavLink
                href="/dashboard/roadmap"
                active={pathname === "/dashboard/roadmap"}
              >
                Roadmap
              </NavLink>
            </>
          ) : (
            <>
              <NavLink href="/#features" active={false}>
                Features
              </NavLink>
              <NavLink href="/#how-it-works" active={false}>
                How It Works
              </NavLink>
            </>
          )}
          <Link
            href={isDashboard ? "/" : "/get-started"}
            className="ml-3 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:brightness-110 transition-all duration-200"
          >
            {isDashboard ? "New Analysis" : "Get Started"}
          </Link>
        </div>
      </div>
    </nav>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 ${
        active
          ? "text-white bg-white/10"
          : "text-zinc-400 hover:text-white hover:bg-white/5"
      }`}
    >
      {children}
    </Link>
  );
}
