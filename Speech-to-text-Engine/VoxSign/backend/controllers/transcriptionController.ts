import type { Request, Response } from "express";
import apiclient from "../lib/trranscriper_api.js";
import fs from "fs";
// import path from "path";
// import ffmpeg from "fluent-ffmpeg";

// const convertWebmToWav = (
//   inputPath: string,
//   outputPath: string,
// ): Promise<void> => {
//   return new Promise((resolve, reject) => {
//     ffmpeg(inputPath)
//       .toFormat("wav")
//       .on("error", (err: any) => {
//         console.error("FFmpeg error:", err);
//         reject(err);
//       })
//       .on("end", () => {
//         resolve();
//       })
//       .save(outputPath);
//   });
// };

export const transcribeAudio = async (req: Request, res: Response) => {
  let inputPath: string | undefined;

  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file provided" });
    }
    console.log("file received:", req.file);

    inputPath = req.file.path;
    // wavPath = path.join(
    //   path.dirname(inputPath),
    //   `${path.basename(inputPath, path.extname(inputPath))}.wav`,
    // );
    //
    // const fileExtension = path
    //   .extname(req.file.originalname || "")
    //   .toLowerCase();
    // const mimeType = (req.file.mimetype || "").toLowerCase();
    // const isWavInput =
    //   fileExtension === ".wav" ||
    //   fileExtension === ".wave" ||
    //   mimeType.includes("wav");
    //
    // if (isWavInput) {
    //   wavPath = inputPath;
    // } else {
    //   await convertWebmToWav(inputPath, wavPath);
    // }

    const fileBuffer = fs.readFileSync(inputPath);
    const mimeType = req.file.mimetype || "application/octet-stream";
    const fileName = req.file.originalname || "audio-upload";

    // Using FormData which is available in Node 18+
    const formData = new FormData();
    const blob = new Blob([fileBuffer], { type: mimeType });
    formData.append("wav", blob, fileName);

    const response = await apiclient.post("/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // Clean up temporary files
    if (inputPath && fs.existsSync(inputPath)) fs.unlinkSync(inputPath);

    res.json(response.data);
  } catch (error: any) {
    console.error(
      "Transcription error:",
      JSON.stringify(error.response?.data) || error.message,
      JSON.stringify(error),
    );

    // Clean up on error
    if (inputPath && fs.existsSync(inputPath)) fs.unlinkSync(inputPath);

    res.status(500).json({
      error: "Failed to transcribe audio",
      details: error.response?.data || error.message,
    });
  }
};
