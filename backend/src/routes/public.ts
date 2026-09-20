import { Router } from "express";
import { getPublicBusinessController } from "../controllers/publicController.js";
import { 
  submitFeedbackController,
  generateReviewController,
  selectReviewController,
  redirectReviewController
} from "../controllers/feedbackController.js";
import { validateBody } from "../middleware/validate.js";
import { submitFeedbackSchema } from "../validators/feedbackValidator.js";
import { publicLimiter, aiGenerationLimiter } from "../middleware/rateLimiter.js";

const router = Router();

// Apply base public rate limiter to all public routes
router.use(publicLimiter);

/**
 * GET /api/public/business/:qrToken
 * Retrieves public-facing business details and active questions.
 */
router.get("/business/:qrToken", getPublicBusinessController);

/**
 * POST /api/public/feedback/:qrToken
 * Submits customer feedback securely against active questions.
 */
router.post(
  "/feedback/:qrToken",
  validateBody(submitFeedbackSchema),
  submitFeedbackController
);

/**
 * POST /api/public/feedback/:id/generate
 * Triggers AI generation for the submitted feedback.
 */
router.post("/feedback/:id/generate", aiGenerationLimiter, generateReviewController);

/**
 * PATCH /api/public/feedback/:id/select
 * Saves the customer's selected and optionally edited review.
 */
router.patch("/feedback/:id/select", selectReviewController);

/**
 * POST /api/public/feedback/:id/redirect
 * Records the 'Google redirect clicked' funnel event.
 */
router.post("/feedback/:id/redirect", redirectReviewController);

export default router;
