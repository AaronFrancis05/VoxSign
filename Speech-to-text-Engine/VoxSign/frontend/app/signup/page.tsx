"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { useAuth } from "@/context/AuthContext";

export default function SignUpPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: signUpError } = await authClient.signUp.email({
        name,
        email,
        password,
      });
      if (signUpError) {
        setError(signUpError.message || "Failed to create account");
        return;
      }
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    authClient.signIn.social({
      provider: "google",
      callbackURL: `${window.location.origin}/dashboard`,
    });
  };

  return (
    <div className="min-h-screen bg-[#EEF0F2] flex items-center justify-center p-4">
      <div className="w-full max-w-[1140px] rounded-[40px] bg-gradient-to-br from-[#f0eaed] via-[#efe8ec] to-[#e8e6ef] p-[3px] shadow-xl">
        <div className="rounded-[38px] bg-[#EEF0F2] flex flex-col md:flex-row overflow-hidden min-h-[600px]">
          {/* Left: Form */}
          <div className="flex-1 flex items-center justify-center px-8 md:px-14 py-12">
            <div className="w-full max-w-[400px]">
              <div className="flex items-center gap-2.5 mb-8">
                <Image
                  src="/voxsign_logo.svg"
                  alt="VoxSign"
                  width={32}
                  height={32}
                  className="object-contain rounded-lg"
                />
                <span className="text-xl font-bold tracking-tight text-[#1A1A2E]">
                  VoxSign
                </span>
              </div>

              <h1 className="text-4xl font-bold text-[#1A1A2E] mb-1">Create account</h1>
              <p className="text-sm font-semibold text-[#8B7CFF] mb-8">
                Let&apos;s get started with your free trial
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                    required
                    className="w-full h-13 rounded-2xl bg-white px-5 text-sm text-[#1A1A2E] placeholder:text-[#9CA3AF] shadow-sm outline-none focus:ring-2 focus:ring-[#8B7CFF]/30"
                  />
                </div>

                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    required
                    className="w-full h-13 rounded-2xl bg-white px-5 text-sm text-[#1A1A2E] placeholder:text-[#9CA3AF] shadow-sm outline-none focus:ring-2 focus:ring-[#8B7CFF]/30"
                  />
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    minLength={8}
                    className="w-full h-13 rounded-2xl bg-white px-5 text-sm text-[#1A1A2E] placeholder:text-[#9CA3AF] shadow-sm outline-none focus:ring-2 focus:ring-[#8B7CFF]/30 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]"
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    )}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-13 rounded-2xl bg-[#8B7CFF] hover:bg-[#6F5EE8] text-white font-bold text-sm shadow-md shadow-[#8B7CFF]/30 transition-all disabled:opacity-60"
                >
                  {loading ? "Creating account..." : "Create account"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-[#6B7280]">
                  Already have an account?{" "}
                  <Link href="/login" className="font-semibold text-[#8B7CFF] hover:text-[#5B4FD6] transition-colors">
                    Log in
                  </Link>
                </p>
              </div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E5E7EB]" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-[#EEF0F2] px-3 text-[#9CA3AF]">Or continue with</span>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <button
                  type="button"
                  onClick={handleGoogleSignUp}
                  className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center hover:shadow-md transition-shadow"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Right: Image panel */}
          <div className="hidden md:block md:w-1/2 relative">
            <div className="m-3 rounded-[32px] overflow-hidden h-[calc(100%-24px)] relative">
              <Image
                src="/voxsign landing image.png"
                alt="VoxSign"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
