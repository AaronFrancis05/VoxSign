import express from "express";
import { getProfile, upsertProfile } from "../controllers/profileController.js";
import { requireAuth } from "../middleware/auth.js";
const router = express.Router();
router.get("/me", requireAuth, getProfile);
router.post("/me", requireAuth, upsertProfile);
export default router;
//# sourceMappingURL=authRoutes.js.map