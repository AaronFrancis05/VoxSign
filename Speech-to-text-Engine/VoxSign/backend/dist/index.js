import express, {} from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { db } from "./db/index.js";
import { sql } from "drizzle-orm";
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
app.use("/api", apiRouter);
// Background keepalive: ping the Modal GPU container on boot and every 4 minutes
(async () => {
    try {
        await pingModalWarm();
    }
    catch {
        console.warn("[Keepalive] Initial Modal ping failed (non-critical)");
    }
})();
setInterval(() => {
    pingModalWarm().catch((err) => console.warn("[Keepalive] Modal ping failed (non-critical):", err.message));
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
app.get("/status", async (req, res) => {
    try {
        const result = await db.execute(sql `SELECT 1 AS ok`);
        res.json({ status: "ok", db: "connected", result });
    }
    catch (error) {
        console.error("Error fetching status:", error);
        res.status(500).json({ error: "Database connection error" });
    }
});
app.listen(PORT, () => {
    console.log(`Server running http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map