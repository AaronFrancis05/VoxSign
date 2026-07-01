"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { message } from "antd";
import { AudioOutlined } from "@ant-design/icons";
import Image from "next/image";
import api from "@/lib/api";
import dynamic from "next/dynamic";

const LandingAvatarViewer = dynamic(() => import("@/components/LandingAvatarViewer"), {
  ssr: false,
});

const RECORDER_MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/ogg;codecs=opus",
  "audio/ogg",
] as const;

const pickSupportedMimeType = () => {
  if (typeof window === "undefined" || typeof MediaRecorder === "undefined") {
    return "";
  }

  return (
    RECORDER_MIME_TYPES.find((mimeType) =>
      MediaRecorder.isTypeSupported(mimeType),
    ) || ""
  );
};

const getFileExtension = (mimeType: string) => {
  if (mimeType.includes("mp4")) return "mp4";
  if (mimeType.includes("ogg")) return "ogg";
  return "webm";
};

export default function Home() {
  const router = useRouter();

  // Recording and feedback states
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [dots, setDots] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackType, setFeedbackType] = useState<"success" | "error" | "info" | null>(null);
  const [triggerAnimation, setTriggerAnimation] = useState(false);

  // Recorder references
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Update animated dots for recording status
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRecording) {
      interval = setInterval(() => {
        setDots((prev) => (prev.length >= 3 ? "" : `${prev}.`));
      }, 500);
    }

    return () => {
      if (interval) clearInterval(interval);
      setDots("");
    };
  }, [isRecording]);

  const stopMediaStream = () => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
  };

  const uploadRecording = async (audioBlob: Blob, mimeType: string) => {
    const formData = new FormData();
    const extension = getFileExtension(mimeType);

    formData.append("audio", audioBlob, `recording.${extension}`);

    const response = await api.post("/transcribe", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const transcription =
      response.data?.transcription ??
      response.data?.text ??
      response.data?.result ??
      "";

    return typeof transcription === "string" ? transcription.trim() : "";
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      setFeedbackMessage("");
      setFeedbackType(null);
      audioChunksRef.current = [];

      if (typeof MediaRecorder === "undefined") {
        message.error("This device does not support audio recording in the browser.");
        stopMediaStream();
        return;
      }

      const mimeType = pickSupportedMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const resolvedMimeType = recorder.mimeType || mimeType || "audio/webm";
        const audioBlob = new Blob(audioChunksRef.current, {
          type: resolvedMimeType,
        });

        stopMediaStream();
        mediaRecorderRef.current = null;
        audioChunksRef.current = [];

        if (!audioBlob.size) {
          setIsTranscribing(false);
          message.error("No audio was captured. Please try again.");
          return;
        }

        setIsTranscribing(true);
        uploadRecording(audioBlob, resolvedMimeType)
          .then((text) => {
            handleTranscriptResult(text);
          })
          .catch((error) => {
            console.error("Transcription upload error:", error);
            message.error("Transcription failed. Please try again.");
            setFeedbackMessage("Transcription failed. Please check backend API.");
            setFeedbackType("error");
          })
          .finally(() => {
            setIsTranscribing(false);
          });
      };

      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      message.error("Could not access microphone. Please check permissions.");
      stopMediaStream();
      setIsRecording(false);
      setIsTranscribing(false);
    }
  };

  const stopRecording = () => {
    if (!isRecording) return;

    setIsRecording(false);
    setIsTranscribing(true);

    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
      return;
    }

    stopMediaStream();
    setIsTranscribing(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      void startRecording();
    }
  };

  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "")
      .replace(/\s+/g, " ");
  };

  const handleTranscriptResult = (text: string) => {
    if (!text) {
      setFeedbackMessage("We didn't hear anything. Try saying 'good morning'!");
      setFeedbackType("info");
      return;
    }

    const normalized = normalizeText(text);
    if (normalized.includes("good morning")) {
      setFeedbackMessage("Success! Play greeting animation!");
      setFeedbackType("success");
      setTriggerAnimation(true);
    } else {
      setFeedbackMessage(`Didn't catch that (you said: "${text}"). Try saying 'good morning'!`);
      setFeedbackType("error");
    }
  };

  const handleAnimationComplete = () => {
    setTriggerAnimation(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== "inactive") {
        recorder.stop();
      }
      stopMediaStream();
    };
  }, []);

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

      {/* Main Banner Grid */}
      <main className="max-w-7xl mx-auto px-6 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left column - Banner details */}
        <section className="lg:col-span-5 space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-xs font-semibold text-[#2E6BFF] tracking-wide uppercase">
            <span className="h-2 w-2 rounded-full bg-[#1FB6FF] animate-pulse" />
            Interactive 3D Avatar Demo
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-[#0F172A] tracking-tight leading-tight">
            Speak to the Future of <span className="bg-gradient-to-r from-[#1FB6FF] to-[#2E6BFF] bg-clip-text text-transparent">Communication</span>
          </h1>

          <p className="text-lg text-[#5A6A85] leading-relaxed">
            VoxSign translates speech into interactive 3D sign language in real-time. Give it a try right now! Command our 3D avatar using your voice.
          </p>

          {/* Guide Steps */}
          <div className="space-y-4 rounded-2xl bg-white border border-[#E2E8F0] p-6 shadow-sm">
            <h3 className="font-bold text-sm uppercase tracking-[0.1em] text-[#95A3BA] mb-2">
              How to play:
            </h3>
            <ol className="space-y-3.5 text-sm text-[#475569]">
              <li className="flex gap-3 items-start">
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-50 text-[#2E6BFF] font-bold text-xs shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  Click the <strong>LISTEN</strong> mic button on the demo widget.
                </span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-50 text-[#2E6BFF] font-bold text-xs shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  Speak clearly: <em className="text-[#0F172A] font-medium not-italic bg-yellow-100 px-1 rounded">&quot;Good morning&quot;</em> into your microphone.
                </span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-50 text-[#2E6BFF] font-bold text-xs shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  Watch the avatar respond with a full-body sign language greeting!
                </span>
              </li>
            </ol>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button
              onClick={() => router.push("/login")}
              className="flex-1 sm:flex-initial rounded-full px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-[#1FB6FF] to-[#2E6BFF] shadow-lg shadow-blue-200/60 hover:shadow-xl hover:scale-[1.01] transition-all text-center"
            >
              Get Started with VoxSign
            </button>
          </div>
        </section>

        {/* Right column - Avatar & Mic Logic */}
        <section className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full max-w-[540px] rounded-[36px] bg-gradient-to-b from-[#EBF4FF] to-white p-1.5 shadow-[0_24px_50px_rgba(31,82,152,0.12)] border border-white/80">
            <div className="relative overflow-hidden rounded-[30px] bg-white/80 p-5">
              {/* Soft background glow */}
              <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-[#FFD8A8]/30 via-[#FFF0D7]/30 to-[#DDEBFF]/30" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.08),_transparent_40%)]" />

              {/* 3D Viewer Box */}
              <div className="relative mx-auto flex min-h-[360px] items-center justify-center rounded-[28px] border border-white bg-gradient-to-b from-[#FFFDFB] via-white to-[#F0F7FF] shadow-[0_12px_32px_rgba(31,82,152,0.08)] overflow-hidden">
                <div className="w-full h-full min-h-[340px]">
                  <LandingAvatarViewer
                    modelUrl="/good-morning.glb"
                    isRecording={isRecording}
                    triggerAnimation={triggerAnimation}
                    onAnimationComplete={handleAnimationComplete}
                  />
                </div>
              </div>

              {/* Interaction feedback box */}
              <div className="mt-6 w-full min-h-[96px] flex items-center justify-center rounded-[24px] border border-[#ECF1F7] bg-[#FBFDFF] px-6 py-4 shadow-inner text-center">
                {isRecording ? (
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-lg font-bold tracking-[0.15em] text-[#FF4D4F]">
                      RECORDING{dots}
                    </span>
                    <p className="text-sm italic text-[#7C8AA5]">Speak now (e.g. &quot;Good Morning&quot;)...</p>
                  </div>
                ) : isTranscribing ? (
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-lg font-bold tracking-[0.15em] text-[#2E6BFF]">
                      TRANSCRIBING{dots}
                    </span>
                    <p className="text-sm italic text-[#7C8AA5]">Analyzing audio input...</p>
                  </div>
                ) : feedbackMessage ? (
                  <div className="flex flex-col items-center gap-1.5">
                    <span
                      className={`text-sm font-semibold uppercase tracking-wider ${
                        feedbackType === "success"
                          ? "text-[#52C41A]"
                          : feedbackType === "error"
                            ? "text-[#FF4D4F]"
                            : "text-[#2E6BFF]"
                      }`}
                    >
                      {feedbackType === "success" ? "Greeting Recognized" : feedbackType === "error" ? "Try Again" : "Note"}
                    </span>
                    <p
                      className={`text-lg font-medium leading-normal ${
                        feedbackType === "success"
                          ? "text-[#237804] font-semibold"
                          : feedbackType === "error"
                            ? "text-[#A8071A]"
                            : "text-[#3C4B63]"
                      }`}
                    >
                      {feedbackMessage}
                    </p>
                  </div>
                ) : (
                  <p className="text-lg font-medium italic leading-relaxed text-[#5A6A85]">
                    &quot;Tap LISTEN and say &apos;good morning&apos;&quot;
                  </p>
                )}
              </div>

              {/* Recording button */}
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={toggleRecording}
                  disabled={isTranscribing}
                  className={`flex items-center justify-center gap-4 rounded-full px-12 py-4 text-white shadow-xl transition-all cursor-pointer select-none disabled:opacity-70 ${
                    isRecording
                      ? "bg-red-500 shadow-red-200 hover:bg-red-600 hover:scale-[1.01]"
                      : "bg-gradient-to-r from-[#1FB6FF] to-[#2E6BFF] shadow-blue-200 hover:scale-[1.02]"
                  }`}
                >
                  <div className={`${isRecording ? "bg-white/30" : "bg-white/15"} rounded-full p-2.5 flex items-center justify-center`}>
                    {isRecording ? (
                      <div className="h-4.5 w-4.5 rounded-[3px] bg-white animate-pulse" />
                    ) : (
                      <AudioOutlined style={{ fontSize: "20px", color: "white" }} />
                    )}
                  </div>
                  <span className="text-lg font-bold tracking-[0.15em]">
                    {isRecording ? "STOP" : "LISTEN"}
                  </span>
                </button>
              </div>

              {/* Sub-label */}
              <p className="mt-4 text-center text-xs text-[#8A97AE]">
                {isRecording
                  ? "Click STOP when you are done speaking."
                  : "Requires microphone access to transcribe speech."}
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}