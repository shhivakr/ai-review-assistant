import { Router } from "express";
import { loginController } from "../controllers/authController.js";
import { validateBody } from "../middleware/validate.js";
import { loginSchema } from "../validators/authValidator.js";

const router = Router();

/**
 * POST /api/admin/login
 *
 * Zod validation runs before the controller. This keeps malformed input
 * outside the authentication service.
 */
router.post("/login", validateBody(loginSchema), loginController);

export default router;
