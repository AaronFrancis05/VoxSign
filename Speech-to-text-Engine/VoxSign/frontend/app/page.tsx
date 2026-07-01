"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F2F6FA] via-[#F8FAFC] to-[#EFF3F8] text-[#1E293B] font-sans">
      {/* Navigation Header */}
      <header className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-[#E2E8F0]/80">
        <div className="flex items-center gap-3">
          <Image
            src="/VoxSign logo.png"
            alt="VoxSign Logo"
            width={40}
            height={40}
            className="object-contain"
          />
          <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-[#1546A0] to-[#2E6BFF] bg-clip-text text-transparent">
            VoxSign
          </span>
        </div>
        <button
          onClick={() => router.push("/login")}
          className="rounded-full px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#1FB6FF] to-[#2E6BFF] hover:from-[#1AA3E5] hover:to-[#255AD4] shadow-md hover:shadow-lg transition-all"
        >
          Sign In / Dashboard
        </button>
      </header>

      {/* Hero */}
      <main className="max-w-4xl mx-auto px-6 py-20 md:py-28 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-xs font-semibold text-[#2E6BFF] tracking-wide uppercase mb-8">
          <span className="h-2 w-2 rounded-full bg-[#1FB6FF] animate-pulse" />
          AI-Powered Sign Language Translation
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-[#0F172A] tracking-tight leading-tight mb-6">
          Speak to the Future of{" "}
          <span className="bg-gradient-to-r from-[#1FB6FF] to-[#2E6BFF] bg-clip-text text-transparent">
            Communication
          </span>
        </h1>

        <p className="text-lg md:text-xl text-[#5A6A85] leading-relaxed max-w-2xl mx-auto mb-10">
          VoxSign translates speech into interactive 3D sign language in real-time.
          Try the Good Morning demo on your dashboard.
        </p>

        <button
          onClick={() => router.push("/login")}
          className="rounded-full px-10 py-4 text-lg font-semibold text-white bg-gradient-to-r from-[#1FB6FF] to-[#2E6BFF] shadow-lg shadow-blue-200/60 hover:shadow-xl hover:scale-[1.01] transition-all"
        >
          Get Started with VoxSign
        </button>
      </main>
    </div>
  );
}
