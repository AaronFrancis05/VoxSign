import apiclient from "../lib/trranscriper_api.js";
import axios from "axios";
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
const TRANSCRIPTION_API_URL = process.env.TRANSCRIPTION_API_URL;
export const warmUpModal = async (_req, res) => {
    try {
        const warmUrl = TRANSCRIPTION_API_URL?.replace("-transcribe.modal.run", "-warm.modal.run");
        if (!warmUrl) {
            console.warn("[WarmUp] TRANSCRIPTION_API_URL not set — skipping warm-up");
            return res.json({ status: "skipped" });
        }
        const response = await axios.get(warmUrl, { timeout: 60000 });
        console.log("[WarmUp] Modal warm response:", JSON.stringify(response.data));
        res.json(response.data);
    }
    catch (error) {
        // Warm-up is purely an optimization — failure must never surface to the user
        console.warn("[WarmUp] Ping failed (non-critical):", error.message);
        res.json({ status: "unreachable" });
    }
};
export const transcribeAudio = async (req, res) => {
    let inputPath;
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No audio file provided" });
        }
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
        console.log("[Transcription] Sending to transcription API...");
        const response = await apiclient.post("/", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            timeout: 120000, // 2-minute timeout for cold-start Modal
        });
        console.log("[Transcription] Received response from transcription API");
        // Clean up temporary files
        if (inputPath && fs.existsSync(inputPath))
            fs.unlinkSync(inputPath);
        res.json(response.data);
    }
    catch (error) {
        console.error("Transcription error:", JSON.stringify(error.response?.data) || error.message, JSON.stringify(error));
        // Clean up on error
        if (inputPath && fs.existsSync(inputPath))
            fs.unlinkSync(inputPath);
        res.status(500).json({
            error: "Failed to transcribe audio",
            details: error.response?.data || error.message,
        });
    }
};
//# sourceMappingURL=transcriptionController.js.map