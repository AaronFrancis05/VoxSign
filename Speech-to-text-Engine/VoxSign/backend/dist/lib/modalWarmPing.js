import axios from "axios";
const TRANSCRIPTION_API_URL = process.env.TRANSCRIPTION_API_URL;
export const pingModalWarm = async () => {
    const warmUrl = TRANSCRIPTION_API_URL?.replace(/-transcriber-(?:transcribe|t-\w+)\.modal\.run\/?$/, "-transcriber-warm.modal.run");
    if (!warmUrl) {
        console.warn("[ModalWarmPing] TRANSCRIPTION_API_URL not set — skipping ping");
        return;
    }
    const response = await axios.get(warmUrl, { timeout: 60000 });
    console.log("[ModalWarmPing] Modal warm response:", JSON.stringify(response.data));
};
//# sourceMappingURL=modalWarmPing.js.map