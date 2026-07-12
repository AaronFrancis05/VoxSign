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
  async (config) => {
    // Try Neon Auth session token first, fall back to stored token
    try {
      const { createAuthClient } = await import("@neondatabase/auth/next");
      const authClient = createAuthClient();
      const session = await authClient.getSession();
      const token = (session as any)?.data?.session?.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        return config;
      }
    } catch {
      // Neon Auth not available, fall through
    }

    const storedToken = localStorage.getItem("voxsign_token");
    if (storedToken) {
      config.headers.Authorization = `Bearer ${storedToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
