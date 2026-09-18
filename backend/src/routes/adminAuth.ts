import { Router } from "express";
import { loginController } from "../controllers/authController.js";
import { refreshTokenController } from "../controllers/refreshTokenController.js";
import { validateBody } from "../middleware/validate.js";
import { loginSchema } from "../validators/authValidator.js";
import { logoutController } from "../controllers/logoutController.js";
const router = Router();

router.post("/login", validateBody(loginSchema), loginController);

router.post("/refresh", refreshTokenController);
router.post("/logout", logoutController);


export default router;
