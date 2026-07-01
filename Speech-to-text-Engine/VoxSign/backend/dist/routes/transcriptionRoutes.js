import express from "express";
import multer from "multer";
import { transcribeAudio } from "../controllers/transcriptionController.js";
const router = express.Router();
const upload = multer({ dest: "storage/temp/" });
router.post("/", upload.single("audio"), transcribeAudio);
export default router;
//# sourceMappingURL=transcriptionRoutes.js.map