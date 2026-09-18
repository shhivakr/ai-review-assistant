import type { Request, Response } from "express";
import {
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from "../services/questionService.js";
import { AppError } from "../utils/errors.js";

export async function getQuestionsController(
  _req: Request,
  res: Response
): Promise<void> {
  try {
    const questions = await getQuestions();
    res.status(200).json({ questions });
  } catch (error) {
    console.error("Failed to fetch questions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function createQuestionController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const question = await createQuestion(req.body);
    res.status(201).json({ question });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    console.error("Failed to create question:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateQuestionController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const id = req.params.id as string;
    const question = await updateQuestion(id, req.body);
    res.status(200).json({ question });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    console.error("Failed to update question:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteQuestionController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const id = req.params.id as string;
    await deleteQuestion(id);
    res.status(200).json({ message: "Question deleted successfully" });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    console.error("Failed to delete question:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
