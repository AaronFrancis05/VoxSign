import type { Request, Response } from "express";
import apiclient from "../lib/trranscriper_api.js";
import { pingModalWarm } from "../lib/modalWarmPing.js";
import crypto from "node:crypto";

const CACHE_MAX = 100;
const transcriptionCache = new Map<string, any>();

function getCacheKey(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

export const warmUpModal = async (_req: Request, res: Response) => {
  try {
    await pingModalWarm();
    res.json({ status: "ok" });
  } catch (error: any) {
    console.warn("[WarmUp] Ping failed (non-critical):", error.message);
    res.json({ status: "unreachable" });
  }
};

export const transcribeAudio = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file provided" });
    }

    const fileBuffer = req.file.buffer;
    const mimeType = req.file.mimetype || "application/octet-stream";
    const fileName = req.file.originalname || "audio-upload";

    // Exact-match cache: only hits on byte-identical audio (e.g. repeated test clips).
    // Real live speech recordings are never bit-for-bit identical, so this is a free
    // safety net for deterministic inputs, not a primary optimization.
    const cacheKey = getCacheKey(fileBuffer);
    const cached = transcriptionCache.get(cacheKey);
    if (cached) {
      console.log("[Transcription] Cache hit — returning cached result");
      return res.json(cached);
    }

    const formData = new FormData();
    const blob = new Blob([new Uint8Array(fileBuffer)], { type: mimeType });
    formData.append("wav", blob, fileName);

    console.log("[Transcription] Sending to transcription API...");
    const response = await apiclient.post("/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 120000,
    });
    console.log("[Transcription] Received response from transcription API");

    // Store in cache with FIFO eviction
    if (transcriptionCache.size >= CACHE_MAX) {
      const firstKey = transcriptionCache.keys().next().value;
      if (firstKey) transcriptionCache.delete(firstKey);
    }
    transcriptionCache.set(cacheKey, response.data);

    res.json(response.data);
  } catch (error: any) {
    console.error(
      "Transcription error:",
      JSON.stringify(error.response?.data) || error.message,
      JSON.stringify(error),
    );

    res.status(500).json({
      error: "Failed to transcribe audio",
      details: error.response?.data || error.message,
    });
  }
};
