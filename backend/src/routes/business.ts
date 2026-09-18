import { Router } from "express";
import {
  getBusinessController,
  updateBusinessController,
} from "../controllers/businessController.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { updateBusinessSchema } from "../validators/businessValidator.js";

const router = Router();

/**
 * All business settings endpoints are administrator-only.
 *
 * The authentication middleware runs before the controller, so public
 * customers cannot read or modify administrative business configuration.
 */
router.use(requireAuth);

/**
 * GET /api/admin/business
 *
 * Returns the current business configuration.
 */
router.get("/", getBusinessController);

/**
 * PUT /api/admin/business
 *
 * Creates the initial business configuration or updates the existing one.
 * Zod validation runs before the controller.
 */
router.put("/", validateBody(updateBusinessSchema), updateBusinessController);

export default router;
