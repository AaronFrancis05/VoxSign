"use client";

import React, { useEffect, useRef } from "react";

interface VoiceWaveformProps {
  mediaStreamRef: React.RefObject<MediaStream | null>;
  isActive: boolean;
}

export default function VoiceWaveform({ mediaStreamRef, isActive }: VoiceWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    if (!isActive) return;
    if (!mediaStreamRef.current) return;

    const stream = mediaStreamRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 128;
    source.connect(analyser);

    audioContextRef.current = audioContext;
    sourceRef.current = source;
    analyserRef.current = analyser;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const barCount = Math.min(bufferLength, 32);
      const gap = 3;
      const barWidth = (w - gap * (barCount - 1)) / barCount;

      for (let i = 0; i < barCount; i++) {
        const value = dataArray[i] / 255;
        const barHeight = Math.max(2, value * h);

        const gradient = ctx.createLinearGradient(0, h, 0, h - barHeight);
        gradient.addColorStop(0, "#1FB6FF");
        gradient.addColorStop(1, "#2E6BFF");
        ctx.fillStyle = gradient;

        const x = i * (barWidth + gap);
        const y = h - barHeight;

        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [barWidth / 2, barWidth / 2, barWidth / 2, barWidth / 2]);
        ctx.fill();
      }
    };
    draw();

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * (window.devicePixelRatio || 1);
      canvas.height = rect.height * (window.devicePixelRatio || 1);
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", handleResize);

      try { source.disconnect(); } catch (_) { /* already disconnected */ }
      try { analyser.disconnect(); } catch (_) { /* already disconnected */ }
      try { audioContext.close(); } catch (_) { /* already closed */ }

      audioContextRef.current = null;
      sourceRef.current = null;
      analyserRef.current = null;
    };
  }, [isActive, mediaStreamRef]);

  return (
    <div className="w-full overflow-hidden rounded-[26px] bg-white/80 px-1 py-1 shadow-sm ring-1 ring-[#E5EEF9]">
      <canvas
        ref={canvasRef}
        className="block h-10 w-full md:h-14"
      />
    </div>
  );
}
