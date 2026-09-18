import { Router } from "express";
import {
  getQuestionsController,
  createQuestionController,
  updateQuestionController,
  deleteQuestionController,
} from "../controllers/questionController.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import {
  createQuestionSchema,
  updateQuestionSchema,
} from "../validators/questionValidator.js";

const router = Router();

router.use(requireAuth);

router.get("/", getQuestionsController);

router.post(
  "/",
  validateBody(createQuestionSchema),
  createQuestionController
);

router.put(
  "/:id",
  validateBody(updateQuestionSchema),
  updateQuestionController
);

router.delete("/:id", deleteQuestionController);

export default router;
