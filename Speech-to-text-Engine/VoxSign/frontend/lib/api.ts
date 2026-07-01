import axios from "axios";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").trim();
const RESOLVED_API_URL =
  API_URL.startsWith("http://") || API_URL.startsWith("https://")
    ? API_URL
    : "http://localhost:5000/api";

const api = axios.create({
  baseURL: RESOLVED_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

if (typeof window !== "undefined") {
  console.info(`[VoxSign] API base URL: ${api.defaults.baseURL}`);
}

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("voxsign_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

// WebSocket transcription is disabled for now.
// export const getTranscriptionWebSocketUrl = () => {
//   const httpUrl = new URL(RESOLVED_API_URL);
//   httpUrl.protocol = httpUrl.protocol === "https:" ? "wss:" : "ws:";
//   httpUrl.pathname = "/ws/transcribe";
//   httpUrl.search = "";
//   return httpUrl.toString();
// };
