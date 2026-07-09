"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

interface VoiceInputPanelProps {
  /** Ref to the live mic MediaStream — used to drive the glow ring. */
  mediaStreamRef: React.RefObject<MediaStream | null>;
  isRecording: boolean;
  isTranscribing?: boolean;
  onPressStart: () => void;
  onPressEnd: () => void;
  className?: string;
}

/**
 * Compact press-and-hold voice input control.
 *
 * Small dark navy stage, minimalist mic glyph, and a soft blue glow ring that
 * expands and contracts with live volume — driven from a Web Audio analyser
 * with heavy smoothing so it glides rather than jitters.
 */
export default function VoiceInputPanel({
  mediaStreamRef,
  isRecording,
  isTranscribing = false,
  onPressStart,
  onPressEnd,
  className = "",
}: VoiceInputPanelProps) {
  const [isPressed, setIsPressed] = useState(false);
  const glowRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const smoothedLevelRef = useRef(0);
  const pointerIdRef = useRef<number | null>(null);

  // --- drive the glow ring from live mic volume ---
  useEffect(() => {
    if (!isRecording || !mediaStreamRef.current) return;

    const stream = mediaStreamRef.current;
    const ringEl = ringRef.current;
    const glowEl = glowRef.current;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const audioContext = new AudioCtx();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.75;
    source.connect(analyser);

    audioContextRef.current = audioContext;
    sourceRef.current = source;
    analyserRef.current = analyser;

    const data = new Uint8Array(analyser.frequencyBinCount);

    const tick = () => {
      rafRef.current = requestAnimationFrame(tick);
      analyser.getByteFrequencyData(data);

      let sum = 0;
      for (let i = 0; i < data.length; i++) sum += data[i];
      const raw = sum / data.length / 255; // 0..1

      smoothedLevelRef.current += (raw - smoothedLevelRef.current) * 0.18;
      const level = Math.min(1, smoothedLevelRef.current * 1.8);

      if (ringEl) {
        const scale = 1 + level * 0.5;
        ringEl.style.transform = `scale(${scale})`;
        ringEl.style.opacity = String(0.35 + level * 0.5);
      }
      if (glowEl) {
        const blur = 18 + level * 34;
        const spread = 1 + level * 7;
        glowEl.style.boxShadow = `0 0 ${blur}px ${spread}px rgba(90,150,255,${0.25 + level * 0.35})`;
      }
    };
    tick();

    return () => {
      cancelAnimationFrame(rafRef.current);
      try { source.disconnect(); } catch { /* noop */ }
      try { analyser.disconnect(); } catch { /* noop */ }
      try { audioContext.close(); } catch { /* noop */ }
      audioContextRef.current = null;
      sourceRef.current = null;
      analyserRef.current = null;
      smoothedLevelRef.current = 0;

      if (ringEl) {
        ringEl.style.transform = "scale(1)";
        ringEl.style.opacity = "0";
      }
      if (glowEl) glowEl.style.boxShadow = "0 0 0px 0px rgba(90,150,255,0)";
    };
  }, [isRecording, mediaStreamRef]);

  const handleStart = useCallback(
    (pointerId?: number) => {
      if (pointerIdRef.current !== null) return;
      pointerIdRef.current = pointerId ?? -1;
      setIsPressed(true);
      onPressStart();
    },
    [onPressStart],
  );

  const handleEnd = useCallback(
    (pointerId?: number) => {
      if (pointerIdRef.current === null) return;
      if (pointerId !== undefined && pointerId !== pointerIdRef.current) return;
      pointerIdRef.current = null;
      setIsPressed(false);
      onPressEnd();
    },
    [onPressEnd],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === " " || e.key === "Enter") && !e.repeat) {
      e.preventDefault();
      handleStart();
    }
  };
  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      handleEnd();
    }
  };

  const busy = isTranscribing;

  return (
    <div
      className={`inline-flex rounded-full bg-gradient-to-b from-[#0B1220] to-[#060A13] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.3)] ${className}`}
    >
      <div className="relative flex h-20 w-20 items-center justify-center">
        <div
          ref={glowRef}
          className="pointer-events-none absolute h-12 w-12 rounded-full"
          style={{ boxShadow: "0 0 0px 0px rgba(90,150,255,0)", transition: isRecording ? "none" : "box-shadow 260ms ease-out" }}
        />
        <div
          ref={ringRef}
          className="pointer-events-none absolute h-16 w-16 rounded-full border border-[#5A96FF]/70 opacity-0"
          style={{ transition: isRecording ? "none" : "transform 260ms ease-out, opacity 260ms ease-out" }}
        />
        <div className="pointer-events-none absolute h-12 w-12 rounded-full border border-white/10" />

        <button
          type="button"
          aria-pressed={isRecording}
          aria-label={isRecording ? "Recording — release to stop" : "Hold to talk"}
          onPointerDown={(e) => {
            e.preventDefault();
            (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
            handleStart(e.pointerId);
          }}
          onPointerUp={(e) => handleEnd(e.pointerId)}
          onPointerLeave={(e) => {
            if (isPressed) handleEnd(e.pointerId);
          }}
          onPointerCancel={(e) => handleEnd(e.pointerId)}
          onContextMenu={(e) => e.preventDefault()}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          disabled={busy}
          style={{ touchAction: "none" }}
          className={`relative z-10 flex h-10 w-10 select-none items-center justify-center rounded-full transition-all duration-200 ease-out ${
            busy
              ? "cursor-not-allowed bg-[#1B2536]"
              : isRecording
                ? "scale-105 bg-gradient-to-b from-[#2A3650] to-[#1A2338] ring-2 ring-[#5A96FF]/60"
                : "bg-gradient-to-b from-[#232D42] to-[#161D2C] ring-1 ring-white/10 active:scale-95"
          }`}
        >
          {busy ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#C7D2E8] border-t-transparent" />
          ) : (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <rect x="9" y="2" width="6" height="12" rx="3" fill={isRecording ? "#F2F5FA" : "#E4E9F2"} />
              <path
                d="M5 11a7 7 0 0 0 14 0"
                stroke={isRecording ? "#F2F5FA" : "#E4E9F2"}
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
              <line
                x1="12"
                y1="18"
                x2="12"
                y2="22"
                stroke={isRecording ? "#F2F5FA" : "#E4E9F2"}
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
