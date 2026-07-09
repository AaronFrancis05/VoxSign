"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

interface PressToTalkButtonProps {
  /** Ref to the live mic MediaStream — used to drive the reactive orb while holding. */
  mediaStreamRef: React.RefObject<MediaStream | null>;
  /** True while audio is actively being captured (button is held down). */
  isRecording: boolean;
  /** True while a captured clip is uploading / being transcribed. */
  isTranscribing?: boolean;
  /** Called the moment the user presses down (mouse, touch, or pen). */
  onPressStart: () => void;
  /** Called the moment the user releases, drags off, or the press is cancelled. */
  onPressEnd: () => void;
  label?: string;
  className?: string;
}

/**
 * Press-and-hold voice input button.
 *
 * Behaviour mirrors modern voice UIs (WhatsApp voice notes, ChatGPT voice mode):
 *  - Press down  -> starts capturing immediately, button scales down, orb appears.
 *  - While held  -> concentric rings pulse in real time with mic volume (Web Audio analyser).
 *  - Release     -> stops capturing immediately (synchronously), orb collapses,
 *                   and the parent's onPressEnd fires in the same tick so the
 *                   transcription/avatar state can update without any artificial delay.
 *  - Dragging the pointer off the button, or the press being cancelled (e.g. an
 *    incoming call on mobile), is treated the same as a release so recording
 *    never gets stuck on.
 */
export default function PressToTalkButton({
  mediaStreamRef,
  isRecording,
  isTranscribing = false,
  onPressStart,
  onPressEnd,
  label,
  className = "",
}: PressToTalkButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const ringRefs = useRef<HTMLDivElement[]>([]);
  const rafRef = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const smoothedLevelRef = useRef(0);
  const pointerIdRef = useRef<number | null>(null);

  // --- drive the reactive rings from live mic volume ---
  useEffect(() => {
    if (!isRecording || !mediaStreamRef.current) return;

    const rings = ringRefs.current;
    const stream = mediaStreamRef.current;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const audioContext = new AudioCtx();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.6;
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
      const avg = sum / data.length / 255; // 0..1

      // Smooth so the rings glide rather than jitter frame to frame.
      smoothedLevelRef.current += (avg - smoothedLevelRef.current) * 0.35;
      const level = Math.min(1, smoothedLevelRef.current * 1.6);

      rings.forEach((el, i) => {
        if (!el) return;
        const spread = 1 + i * 0.55;
        const scale = 1 + level * spread;
        const opacity = Math.max(0.12, 0.5 - i * 0.15) * (0.4 + level * 0.6);
        el.style.transform = `scale(${scale})`;
        el.style.opacity = String(opacity);
      });
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
      rings.forEach((el) => {
        if (!el) return;
        el.style.transform = "scale(1)";
        el.style.opacity = "0";
      });
    };
  }, [isRecording, mediaStreamRef]);

  const handleStart = useCallback(
    (pointerId?: number) => {
      if (pointerIdRef.current !== null) return; // already tracking a press
      pointerIdRef.current = pointerId ?? -1; // -1 marks a non-pointer (keyboard) press
      setIsPressed(true);
      onPressStart();
    },
    [onPressStart],
  );

  const handleEnd = useCallback(
    (pointerId?: number) => {
      if (pointerIdRef.current === null) return; // already ended — ignore duplicate events
      if (pointerId !== undefined && pointerId !== pointerIdRef.current) return;
      pointerIdRef.current = null;
      setIsPressed(false);
      onPressEnd(); // fires synchronously — no artificial delay before transcription/avatar react
    },
    [onPressEnd],
  );

  // Keyboard support: Space/Enter act as push-to-talk too (held down = recording).
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
    <div className={`relative flex flex-col items-center ${className}`}>
      <div className="relative flex h-[168px] w-[168px] items-center justify-center">
        {/* Reactive rings — only meaningful while recording, but always mounted so refs are stable */}
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            ref={(el) => {
              if (el) ringRefs.current[i] = el;
            }}
            className="pointer-events-none absolute h-24 w-24 rounded-full bg-gradient-to-br from-[#1FB6FF] to-[#2E6BFF] opacity-0"
            style={{ transition: isRecording ? "none" : "transform 220ms ease-out, opacity 220ms ease-out" }}
          />
        ))}

        <button
          ref={buttonRef}
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
            // A finger/mouse sliding off the button should stop recording, just like
            // WhatsApp's "slide to cancel" gesture ending the recording.
            if (isPressed) handleEnd(e.pointerId);
          }}
          onPointerCancel={(e) => handleEnd(e.pointerId)}
          onContextMenu={(e) => e.preventDefault()}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          disabled={busy}
          className={`relative z-10 flex h-24 w-24 select-none items-center justify-center rounded-full text-white shadow-xl transition-transform duration-150 ease-out ${
            busy
              ? "cursor-not-allowed bg-[#B9C4D6] shadow-none"
              : isRecording
                ? "scale-110 bg-red-500 shadow-red-200"
                : "bg-gradient-to-r from-[#1FB6FF] to-[#2E6BFF] shadow-blue-200 active:scale-95"
          }`}
          style={{ touchAction: "none" }}
        >
          {busy ? (
            <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-white border-t-transparent" />
          ) : isRecording ? (
            <div className="h-6 w-6 rounded-[6px] bg-white" />
          ) : (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <rect x="9" y="2" width="6" height="12" rx="3" fill="white" />
              <path d="M5 11a7 7 0 0 0 14 0" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
              <line x1="12" y1="18" x2="12" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {label && (
        <span className="mt-1 text-sm font-semibold tracking-[0.18em] text-[#5A6A85]">
          {label}
        </span>
      )}
    </div>
  );
}
