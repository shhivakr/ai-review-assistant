import { Router } from "express";
import { getStatsController, getFeedbackListController, getFeedbackDetailController } from "../controllers/dashboardController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Dashboard APIs are strictly admin-only
router.use(requireAuth);

router.get("/stats", getStatsController);
router.get("/feedback", getFeedbackListController);
router.get("/feedback/:id", getFeedbackDetailController);

export default router;
