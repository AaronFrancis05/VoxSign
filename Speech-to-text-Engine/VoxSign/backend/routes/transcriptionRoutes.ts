import express from "express";
import multer from "multer";
import { transcribeAudio, warmUpModal } from "../controllers/transcriptionController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("audio"), transcribeAudio);
router.get("/warm", warmUpModal);

export default router;
