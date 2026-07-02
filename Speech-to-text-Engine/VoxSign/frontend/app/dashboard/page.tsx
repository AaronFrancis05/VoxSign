"use client";

import React, { useEffect, useRef, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import VoiceWaveform from "@/components/VoiceWaveform";
import { message } from "antd";
import { AudioOutlined } from "@ant-design/icons";
import api from "@/lib/api";
import dynamic from "next/dynamic";

const LandingAvatarViewer = dynamic(() => import("@/components/LandingAvatarViewer"), {
  ssr: false,
});

type ActiveTab = "signing" | "asr";

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

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("signing");
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState("");
  const [dots, setDots] = useState("");
  const [triggerAnimation, setTriggerAnimation] = useState(false);
  const [showPatienceMessage, setShowPatienceMessage] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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

  useEffect(() => {
    if (isTranscribing) {
      const timer = setTimeout(() => setShowPatienceMessage(true), 10000);
      return () => clearTimeout(timer);
    }
    setShowPatienceMessage(false);
  }, [isTranscribing]);

  const warmUpFiredRef = useRef(false);

  useEffect(() => {
    if (activeTab !== "signing") {
      warmUpFiredRef.current = false;
      return;
    }

    if (warmUpFiredRef.current) return;
    warmUpFiredRef.current = true;

    fetch("/api/transcribe/warm").catch(() => {
      /* warm-up is purely an optimization — failure is silently ignored */
    });
  }, [activeTab]);

  const stopMediaStream = () => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
  };

  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "")
      .replace(/\s+/g, " ");
  };

  const handleAnimationComplete = () => setTriggerAnimation(false);

  // WebSocket/chunk streaming is intentionally disabled for now.
  // The backend source only exposes POST /api/transcribe and the proxied API
  // is more reliable when it receives a normal uploaded audio file.
  /*
  const setupStreamingSocket = async () => false;
  const uploadChunkHttp = async () => {};
  */

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

    setFinalTranscript(
      typeof transcription === "string" ? transcription.trim() : "",
    );

    const normalized = normalizeText(
      typeof transcription === "string" ? transcription.trim() : "",
    );
    if (normalized.includes("good morning")) {
      setTriggerAnimation(true);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      setFinalTranscript("");
      audioChunksRef.current = [];

      if (typeof MediaRecorder === "undefined") {
        message.error(
          "This device does not support audio recording in the browser.",
        );
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

        void uploadRecording(audioBlob, resolvedMimeType)
          .catch((error) => {
            console.error("Transcription upload error:", error);
            message.error("Transcription failed. Please try again.");
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
      return;
    }

    void startRecording();
  };

  useEffect(() => {
    return () => {
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== "inactive") {
        recorder.stop();
      }
      stopMediaStream();
    };
  }, []);

  const transcriptQuote =
    finalTranscript.trim() ||
    (isRecording || isTranscribing
      ? "Listening for your speech..."
      : "Tap LISTEN to start speaking.");

  const renderTabs = () => (
    <div className="w-full rounded-[26px] bg-white/90 p-2 shadow-sm ring-1 ring-[#E5EEF9]">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("signing")}
          className={`rounded-[20px] px-4 py-3 text-sm font-semibold transition-all ${
            activeTab === "signing"
              ? "bg-gradient-to-r from-[#1FB6FF] to-[#2E6BFF] text-white shadow-md"
              : "bg-[#EFF5FB] text-[#5A6A85]"
          }`}
        >
          Signing
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("asr")}
          className={`rounded-[20px] px-4 py-3 text-sm font-semibold transition-all ${
            activeTab === "asr"
              ? "bg-gradient-to-r from-[#1FB6FF] to-[#2E6BFF] text-white shadow-md"
              : "bg-[#EFF5FB] text-[#5A6A85]"
          }`}
        >
          ASR
        </button>
      </div>
    </div>
  );

  const renderRecordingButton = (fullWidth?: boolean) => (
    <button
      type="button"
      onClick={toggleRecording}
      className={`flex items-center justify-center gap-4 rounded-full px-10 py-5 text-white shadow-xl transition-all ${
        fullWidth ? "w-full max-w-[240px]" : ""
      } ${
        isRecording
          ? "bg-red-500 shadow-red-200 hover:bg-red-600"
          : "bg-gradient-to-r from-[#1FB6FF] to-[#2E6BFF] shadow-blue-200 hover:scale-[1.02]"
      }`}
    >
      <div
        className={`${isRecording ? "bg-white/30" : "bg-white/15"} rounded-full p-3`}
      >
        {isRecording ? (
          <div className="h-5 w-5 rounded-[4px] bg-white" />
        ) : (
          <AudioOutlined style={{ fontSize: "24px", color: "white" }} />
        )}
      </div>
      <span className="text-xl font-semibold tracking-[0.18em]">
        {isRecording ? "STOP" : "LISTEN"}
      </span>
    </button>
  );

  const renderAsrTab = () => (
    <>
      <div className="w-full rounded-[36px] border border-[#E7EEF8] bg-white p-8 shadow-sm">
        <div className="flex min-h-[360px] w-full items-center justify-center rounded-[28px] bg-gradient-to-b from-[#F6FAFE] to-white px-6 py-10">
          {isRecording ? (
            <div className="flex flex-col items-center text-center">
              <span className="mb-4 text-3xl font-bold tracking-[0.22em] text-[#2794FF]">
                RECORDING{dots}
              </span>
              <p className="text-lg italic text-[#7C8AA5]">Speak now...</p>
            </div>
          ) : isTranscribing ? (
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#2794FF] border-t-transparent" />
              <span className="text-2xl font-bold tracking-[0.22em] text-[#2794FF]">
                TRANSCRIBING
              </span>
              <p className="mt-2 text-base italic text-[#7C8AA5]">
                {showPatienceMessage
                  ? "Still processing, this can take a bit longer..."
                  : "Processing your audio..."}
              </p>
            </div>
          ) : (
            <div className="flex min-h-[260px] w-full items-center justify-center rounded-[30px] border border-[#ECF1F7] bg-[#FBFDFF] p-8 shadow-inner">
              <p className="text-center text-2xl font-medium italic leading-relaxed text-[#3C4B63]">
                &quot;{transcriptQuote}&quot;
              </p>
            </div>
          )}
        </div>
      </div>

      {isRecording && (
        <div className="mt-4 w-full">
          <VoiceWaveform mediaStreamRef={mediaStreamRef} isActive={isRecording} />
        </div>
      )}

      <div className="mt-8 flex w-full justify-center">
        {renderRecordingButton()}
      </div>

      <p className="mt-4 text-center text-sm text-[#8A97AE]">
        {isRecording
          ? "Tap STOP when you're finished speaking."
          : isTranscribing
            ? "Uploading your recording for transcription."
            : "Tap LISTEN to start transcribing."}
      </p>

      {/* Live stream disabled while websocket/chunk transcription is commented out.
      <div className="mt-6 w-full rounded-[28px] border border-[#E7EEF8] bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#95A3BA]">
            Live stream
          </h3>
          <span className="text-xs text-[#95A3BA]">
            {isRecording ? "Receiving chunks" : "Idle"}
          </span>
        </div>

        {liveChunks.length > 0 ? (
          <div className="max-h-[220px] space-y-3 overflow-y-auto pr-1">
            {liveChunks.map((chunk) => (
              <div
                key={chunk.id}
                className="rounded-2xl border border-[#D8EAFE] bg-gradient-to-r from-[#EDF7FF] to-[#F5FBFF] px-4 py-3"
              >
                <p className="text-sm leading-relaxed text-[#1B4B86]">
                  {chunk.text}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#D9E2EF] bg-[#F8FBFE] px-4 py-8 text-center">
            <p className="text-sm text-[#97A4B8]">
              Live transcript chunks will appear here while you speak.
            </p>
          </div>
        )}
      </div>
      */}

      {!isRecording && finalTranscript ? (
        <div className="mt-4 w-full rounded-[28px] bg-[#0B1B3A] p-5 shadow-lg shadow-blue-100/60">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-blue-200">
            Final transcript
          </h3>
          <p className="text-lg leading-8 text-white">{finalTranscript}</p>
        </div>
      ) : null}
    </>
  );

  const renderSigningTab = () => (
    <>
      <div className="w-full rounded-[34px] bg-gradient-to-b from-[#DFF1FF] to-[#F7FBFF] p-1 shadow-sm ring-1 ring-[#D7E8F8]">
        <div className="relative overflow-hidden rounded-[30px] bg-white/70 p-4">
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-[#FFD8A8] via-[#FFF0D7] to-[#DDEBFF]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.14),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(251,191,36,0.16),_transparent_30%)]" />

          <div className="relative mx-auto flex min-h-[340px] max-w-[320px] items-center justify-center rounded-[28px] border border-white/70 bg-gradient-to-b from-[#FFF8F1] via-white to-[#ECF6FF] shadow-[0_18px_40px_rgba(31,82,152,0.15)] overflow-hidden">
            <div className="w-full h-full min-h-[320px]">
              <LandingAvatarViewer
                modelUrl="/good-morning.glb"
                triggerAnimation={triggerAnimation}
                onAnimationComplete={handleAnimationComplete}
              />
            </div>
          </div>
        </div>
      </div>

      {isTranscribing && (
        <div className="mt-5 w-full rounded-[26px] border border-[#E4EDF8] bg-white px-6 py-6 text-center shadow-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-[#2E6BFF] border-t-transparent" />
            <p className="text-xl font-bold tracking-[0.22em] text-[#2794FF]">
              TRANSCRIBING
            </p>
            <p className="text-base italic text-[#7C8AA5]">
              {showPatienceMessage
                ? "Still processing, this can take a bit longer..."
                : "Processing your audio..."}
            </p>
          </div>
        </div>
      )}

      {!isTranscribing && (
        <div className="mt-5 w-full rounded-[26px] border border-[#E4EDF8] bg-white px-6 py-6 text-center shadow-sm">
          <p className="text-2xl italic leading-relaxed text-[#4B5871]">
            &quot;{transcriptQuote}&quot;
          </p>
        </div>
      )}

      {isRecording && (
        <div className="mt-4 w-full">
          <VoiceWaveform mediaStreamRef={mediaStreamRef} isActive={isRecording} />
        </div>
      )}

      <div className="mt-6 flex w-full justify-center">
        {renderRecordingButton()}
      </div>

      <p className="mt-4 text-center text-sm text-[#8A97AE]">
        {isRecording
          ? "Listening now. The caption updates as you speak."
          : isTranscribing
            ? "Uploading your recording for transcription."
            : "Tap LISTEN to start speaking."}
      </p>
    </>
  );

  return (
    <DashboardLayout>
      <div className="mx-auto flex w-full max-w-[560px] flex-col items-center px-5 py-6 md:px-6">
        {renderTabs()}

        <div className="w-full pb-8 pt-5">
          {activeTab === "asr" ? renderAsrTab() : renderSigningTab()}
        </div>
      </div>
    </DashboardLayout>
  );
}
