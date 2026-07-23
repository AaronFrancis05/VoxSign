"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { authClient } from "@/lib/auth/client";
import { useAuth } from "@/context/AuthContext";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#EEF0F2] flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-[#8B7CFF] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-[#6B7280] mt-4">Loading...</p>
      </div>
    </div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const { user, loading: authLoading, updateUser } = useAuth();

  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const email = emailParam || user?.email || "";

  useEffect(() => {
    if (!authLoading && !user && !emailParam) {
      router.push("/login");
    }
  }, [user, authLoading, emailParam, router]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerify = useCallback(async (code?: string) => {
    const otpCode = code || otp.join("");
    if (otpCode.length !== 6) return;

    setLoading(true);
    setError(null);

    try {
      const { error: verifyError } = await authClient.emailOtp.verifyEmail({
        email,
        otp: otpCode,
      });

      if (verifyError) throw verifyError;

      updateUser({ emailVerified: true });
      setVerified(true);

      setTimeout(() => {
        router.push("/dashboard");
      }, 2600);
    } catch (err: any) {
      const message = err?.message || "Invalid or expired code. Please try again.";
      setError(message);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }, [otp, email, updateUser, router]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError(null);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    if (pasted.length === 6) {
      handleVerify(newOtp.join(""));
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError(null);

    try {
      const { error: resendError } = await authClient.sendVerificationEmail({
        email,
        callbackURL: `${window.location.origin}/dashboard`,
      });

      if (resendError) throw resendError;
      setResendCooldown(60);
    } catch (err: any) {
      setError(err?.message || "Failed to resend code");
    } finally {
      setResending(false);
    }
  };

  const maskedEmail = email
    ? `${email[0]}***@${email.split("@")[1]}`
    : "";

  if (verified) {
    return <SuccessAnimation />;
  }

  return (
    <div className="min-h-screen bg-[#EEF0F2] flex items-center justify-center p-4">
      <div className="w-full max-w-[540px] rounded-[40px] bg-gradient-to-br from-[#f0eaed] via-[#efe8ec] to-[#e8e6ef] p-[3px] shadow-xl">
        <div className="rounded-[38px] bg-[#EEF0F2] px-8 md:px-14 py-12">
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

          <h1 className="text-4xl font-bold text-[#1A1A2E] mb-1">Verify your email</h1>
          <p className="text-sm text-[#6B7280] mb-1">
            Enter the verification code sent to
          </p>
          <p className="text-sm font-semibold text-[#8B7CFF] mb-8">{maskedEmail}</p>

          {error && (
            <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 mb-6">
              {error}
            </div>
          )}

          <div className="flex gap-3 justify-center mb-8">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={i === 0 ? handlePaste : undefined}
                className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white text-center text-2xl font-bold text-[#1A1A2E] shadow-sm outline-none focus:ring-2 focus:ring-[#8B7CFF]/30 focus:border-[#8B7CFF] border-2 border-transparent transition-all"
                autoFocus={i === 0}
                disabled={loading}
              />
            ))}
          </div>

          <button
            onClick={() => handleVerify()}
            disabled={otp.join("").length !== 6 || loading}
            className="w-full h-13 rounded-2xl bg-[#8B7CFF] hover:bg-[#6F5EE8] text-white font-bold text-sm shadow-md shadow-[#8B7CFF]/30 transition-all disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Verify email"}
          </button>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#6B7280]">
              Didn&apos;t receive a code?{" "}
              <button
                onClick={handleResend}
                disabled={resending || resendCooldown > 0}
                className="font-semibold text-[#8B7CFF] hover:text-[#5B4FD6] transition-colors disabled:opacity-50"
              >
                {resending ? "Sending..." : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SuccessAnimation() {
  const circleRef = useRef<SVGCircleElement>(null);
  const checkRef = useRef<SVGPolylineElement>(null);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 100);
    const t2 = setTimeout(() => setStage(2), 900);
    const t3 = setTimeout(() => setStage(3), 1500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className="fixed inset-0 bg-[#EEF0F2] flex items-center justify-center z-50">
      <div className="text-center">
        <div className="relative mx-auto w-28 h-28 mb-6">
          <svg className="w-28 h-28" viewBox="0 0 100 100">
            <circle
              cx="50" cy="50" r="44"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="6"
            />
            <circle
              cx="50" cy="50" r="44"
              fill="none"
              stroke="#8B7CFF"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={276.99}
              strokeDashoffset={stage >= 1 ? 0 : 276.99}
              transform="rotate(-90 50 50)"
              style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)" }}
            />
            {stage >= 2 && (
              <polyline
                points="34,50 46,64 68,36"
                fill="none"
                stroke="#8B7CFF"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={80}
                strokeDashoffset={0}
                style={{
                  animation: "draw-check 0.5s ease-out forwards",
                }}
              />
            )}
          </svg>

          {stage >= 1 && Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-[#8B7CFF]"
              style={{
                animation: `particle-burst 1s ease-out ${0.8 + i * 0.06}s forwards`,
                transform: `rotate(${i * 30}deg)`,
                opacity: 0,
              }}
            />
          ))}
        </div>

        {stage >= 2 && (
          <>
            <h2 className="text-2xl font-bold text-[#1A1A2E] animate-fade-in">
              Email Verified!
            </h2>
            <p className="text-sm text-[#6B7280] mt-2 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              Redirecting to dashboard...
            </p>
          </>
        )}
      </div>

      <style>{`
        @keyframes draw-check {
          from { stroke-dashoffset: 80; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes particle-burst {
          0% { opacity: 1; transform: translate(-50%, -50%) rotate(var(--r, 0deg)) translateX(0px); }
          100% { opacity: 0; transform: translate(-50%, -50%) rotate(var(--r, 0deg)) translateX(60px); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
