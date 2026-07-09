import express, { type Request, type Response } from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./lib/db.js";
import apiRouter from "./routes/index.js";
import swaggerUi from "swagger-ui-express";
import path from "path";
import { pingModalWarm } from "./lib/modalWarmPing.js";

dotenv.config({ path: ".env.local" });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Static file server for storage
app.use("/storage", express.static(path.join(process.cwd(), "storage")));

connectDB();

app.use("/api", apiRouter);

// Background keepalive: ping the Modal GPU container on boot and every 4 minutes
// to prevent cold starts between user requests.
(async () => {
  try {
    await pingModalWarm();
  } catch {
    console.warn("[Keepalive] Initial Modal ping failed (non-critical)");
  }
})();
setInterval(() => {
  pingModalWarm().catch((err) =>
    console.warn("[Keepalive] Modal ping failed (non-critical):", err.message),
  );
}, 4 * 60 * 1000);

/**
 * @openapi
 * /status:
 *   get:
 *     summary: Get server and database status
 *     responses:
 *       200:
 *         description: Server is up and running
 *       500:
 *         description: Database connection error
 */
app.get("/status", async (req: Request, res: Response) => {
  try {
    if (!mongoose.connection.db) {
      return res
        .status(500)
        .json({ error: "Database connection not available" });
    }
    const status = await mongoose.connection.db.admin().serverStatus();
    res.json(status);
  } catch (error) {
    console.error("Error fetching status:", error);
    res.status(500).json({ error: "Error fetching status" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running http://localhost:${PORT}`);
});
