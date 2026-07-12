"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

const trustedBy = [
  
  {
    name: "MIIC",
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="7" y="7" width="10" height="10" rx="1.5" />
        <path d="M12 3v3M12 18v3M3 12h3M18 12h3M6 6l2 2M18 6l-2 2M6 18l2-2M18 18l-2-2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "UNAD",
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M6 4h9l3 3v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" strokeLinejoin="round" />
        <path d="M9 10h6M9 13h6M9 16h4" strokeLinecap="round" />
      </svg>
    ),
  }
];

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0A1F] flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#8B7CFF] border-t-transparent" />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen bg-[#0B0A1F] relative overflow-hidden font-sans">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-32 w-[520px] h-[520px] rounded-full bg-[#5B4FD6]/25 blur-[130px]" />
        <div className="absolute top-1/4 -right-40 w-[600px] h-[600px] rounded-full bg-[#2E6BFF]/20 blur-[150px]" />
        <div className="absolute bottom-[-10%] left-1/4 w-[420px] h-[420px] rounded-full bg-[#7033FF]/20 blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-10">
        {/* Top nav */}
        <header className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-2.5">
            <Image
              src="/voxsign_logo.svg"
              alt="VoxSign Logo"
              width={36}
              height={36}
                className="object-contain rounded-lg"
              />
              <span className="text-xl font-bold tracking-tight text-white">
                VoxSign
            </span>
          </div>
          <button
            onClick={() => router.push("/login")}
            className="rounded-full px-5 py-2.5 text-sm font-semibold text-white bg-white/10 border border-white/15 hover:bg-white/15 backdrop-blur-md transition-all"
          >
            Sign In
          </button>
        </header>

        {/* Hero glass card */}
        <div className="relative rounded-[32px] border border-white/10 bg-gradient-to-br from-[#3B2E8A]/60 via-[#2A2361]/60 to-[#1B1640]/70 backdrop-blur-2xl shadow-[0_30px_100px_-20px_rgba(91,79,214,0.45)] px-6 sm:px-10 md:px-14 py-14 md:py-20 overflow-hidden">
          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[720px] rounded-full bg-[#8B7CFF]/10 blur-[110px]" />

          <div className="relative grid md:grid-cols-2 gap-14 lg:gap-20 items-center">
            {/* Left column */}
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-[11px] font-semibold text-[#C9C3FF] tracking-widest uppercase mb-7">
                <span className="h-1.5 w-1.5 rounded-full bg-[#8B7CFF] animate-pulse" />
                AI-Powered Accessibility
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-[3.4rem] font-extrabold text-white tracking-tight leading-[1.1] mb-6">
                Every Voice Deserves to{" "}
                <span className="block bg-gradient-to-r from-[#8B7CFF] via-[#8FB8FF] to-[#6FE3D8] bg-clip-text text-transparent">
                  Be Understood.
                </span>
              </h1>

              <p className="text-base md:text-lg text-[#C7C4E0] leading-relaxed max-w-md mb-9">
                VoxSign turns speech into Ugandan Sign Language in real-time
                using AI, making communication accessible for everyone.
              </p>

              <div className="flex flex-wrap items-center gap-4 mb-12">
                <button
                  onClick={() => router.push("/signup")}
                  className="group inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-[#7C6FF0] to-[#5B4FD6] shadow-lg shadow-[#5B4FD6]/30 hover:shadow-xl hover:brightness-110 transition-all"
                >
                  Try VoxSign Free
                  <svg
                    viewBox="0 0 24 24"
                    className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              {/* Trusted by */}
              <div className="rounded-2xl bg-white/5 border border-white/10 px-6 py-5">
                <p className="text-xs text-[#9C97C4] mb-4">
                  Trusted by educators, institutions &amp; communities
                </p>
                <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
                  {trustedBy.map((item) => (
                    <div key={item.name} className="flex items-center gap-2 text-[#D8D5EE]">
                      {item.icon}
                      <span className="text-sm font-semibold whitespace-nowrap">
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column - avatar panel */}
            <div className="relative">
              <div className="relative rounded-[28px] bg-gradient-to-b from-[#2C2560]/80 to-[#1B1640]/80 border border-white/10 overflow-hidden aspect-[4/5] shadow-2xl">
                <Image
                  src="/voxsign landing image.png"
                  alt="VoxSign Landing"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />

                {/* Live translation badge */}
                <div className="absolute top-5 right-5 flex items-center gap-2 rounded-xl bg-[#12102B]/70 backdrop-blur-md border border-white/10 px-3.5 py-2 z-20">
                  <span className="text-[10px] font-semibold text-white/70 uppercase tracking-wide">
                    Live Translation
                  </span>
                  <div className="flex items-end gap-[2px] h-3">
                    {[4, 8, 5, 10, 6, 9, 4].map((h, i) => (
                      <span
                        key={i}
                        className="w-[2px] rounded-full bg-[#8FB8FF] animate-pulse"
                        style={{ height: `${h}px`, animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Chat bubble */}
                <div className="absolute top-[4.5rem] right-5 max-w-[170px] rounded-2xl rounded-tr-sm bg-white/95 px-4 py-2.5 shadow-lg z-20">
                  <p className="text-sm font-semibold text-[#1E1B3A] leading-tight">
                    Hello!
                  </p>
                  <p className="text-xs text-[#5A5578] leading-tight">(Oli otya?)</p>
                </div>

                {/* USL badge */}
                <div className="absolute bottom-5 right-5 flex items-center gap-1.5 rounded-full bg-[#12102B]/70 backdrop-blur-md border border-white/10 px-3 py-1.5 z-20">
                  <span className="text-xs font-bold text-white">USL</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
