import express from "express";
import authRoutes from "./authRoutes.js";
import transcriptionRoutes from "./transcriptionRoutes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/transcribe", transcriptionRoutes);

export default router;
