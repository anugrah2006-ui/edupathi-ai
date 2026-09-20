"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  LogOut,
  LayoutDashboard,
  Sparkles,
  ChevronDown,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isDashboard = pathname?.startsWith("/dashboard");
  const isAuthPage = pathname === "/login" || pathname === "/signup" || pathname === "/forgot-password" || pathname === "/forget-password" || pathname === "/reset-password";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setDropdownOpen(false);
    await signOut();
    router.push("/");
    router.refresh();
  };

  const userDisplayName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Learner";

  const userInitials = userDisplayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
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
        <div className="flex items-center gap-1 sm:gap-2">
          {!isAuthPage && (
            <>
              {isDashboard ? (
                <>
                  <NavLink href="/dashboard" active={pathname === "/dashboard"}>
                    Overview
                  </NavLink>
                  <NavLink href="/dashboard#missions" active={false}>
                    Missions
                  </NavLink>
                  <NavLink href="/dashboard#roadmap" active={false}>
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
            </>
          )}

          {/* User Auth Status */}
          {user ? (
            <div className="relative ml-2" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-1.5 pr-2.5 sm:px-3 sm:py-1.5 text-left text-xs font-medium text-zinc-300 hover:border-white/20 hover:bg-white/[0.08] transition-all"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-[11px] font-bold text-white shadow-sm">
                  {userInitials}
                </div>
                <div className="hidden sm:block max-w-[120px] truncate">
                  <div className="font-semibold text-white truncate leading-tight">{userDisplayName}</div>
                  <div className="text-[10px] text-zinc-400 truncate">{user.email}</div>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/10 bg-[#0d0d14] p-1.5 shadow-2xl backdrop-blur-2xl animate-fade-in z-50">
                  <div className="border-b border-white/10 px-3 py-2 sm:hidden">
                    <p className="text-xs font-semibold text-white truncate">{userDisplayName}</p>
                    <p className="text-[10px] text-zinc-400 truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-white/[0.08] hover:text-white transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4 text-violet-400" />
                    Dashboard & Missions
                  </Link>
                  <Link
                    href="/get-started"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-white/[0.08] hover:text-white transition-colors"
                  >
                    <Sparkles className="h-4 w-4 text-indigo-400" />
                    New Skill Analysis
                  </Link>
                  <div className="my-1 border-t border-white/10" />
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4 text-rose-400" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-1">
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/get-started"
                className="rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:brightness-110 transition-all duration-200"
              >
                {isDashboard ? "New Analysis" : "Get Started"}
              </Link>
            </div>
          )}
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
