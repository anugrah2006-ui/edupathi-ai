import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EduPath AI — Your AI-Powered Career Learning Path",
  description:
    "Discover your skill gaps, get a personalized learning roadmap, and master adaptive daily missions powered by AI. Land your dream role faster.",
  keywords: [
    "AI learning",
    "career development",
    "skill gap analysis",
    "personalized learning",
    "adaptive education",
  ],
  openGraph: {
    title: "EduPath AI",
    description: "Your AI-Powered Career Learning Path",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0a0a0f]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
