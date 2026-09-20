import type { Request, Response } from "express";
import { submitFeedback } from "../services/feedbackService.js";
import { AppError } from "../utils/errors.js";

/**
 * POST /api/public/feedback/:qrToken
 * Accepts rating and dynamic answers from the customer.
 */
export async function submitFeedbackController(
  req: Request,
  res: Response
): Promise<void> {
  const { qrToken } = req.params;
  const { rating, answers } = req.body;

  if (!qrToken || typeof qrToken !== "string" || qrToken.trim() === "") {
    res.status(400).json({ message: "Invalid token" });
    return;
  }

  try {
    const feedback = await submitFeedback(qrToken.trim(), rating, answers);

    res.status(201).json({
      message: "Feedback submitted successfully",
      feedbackId: (feedback as any)._id,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    console.error("Failed to submit feedback:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * POST /api/public/feedback/:id/generate
 * Triggers AI review generation for a submitted feedback document.
 */
export async function generateReviewController(
  req: Request,
  res: Response
): Promise<void> {
  const { id } = req.params;

  if (!id || typeof id !== "string") {
    res.status(400).json({ message: "Invalid ID" });
    return;
  }

  try {
    const { generateReviewOptions } = await import("../services/aiService.js");
    await generateReviewOptions(id);

    const { FeedbackModel } = await import("../models/Feedback.js");
    const updated = await FeedbackModel.findById(id).exec();

    if (!updated) {
      res.status(404).json({ message: "Feedback not found" });
      return;
    }

    res.status(200).json({
      generatedReviews: updated.generatedReviews,
    });
  } catch (error) {
    console.error("Failed to generate review:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * PATCH /api/public/feedback/:id/select
 * Saves the customer's chosen review index and any edited text.
 */
export async function selectReviewController(
  req: Request,
  res: Response
): Promise<void> {
  const { id } = req.params;

  if (!id || typeof id !== "string") {
    res.status(400).json({ message: "Invalid ID" });
    return;
  }

  const { selectedIndex, editedReviewText } = req.body;

  try {
    const { FeedbackModel } = await import("../models/Feedback.js");
    const updated = await FeedbackModel.findByIdAndUpdate(
      id,
      { $set: { selectedIndex, editedReviewText } },
      { new: true }
    ).exec();

    if (!updated) {
      res.status(404).json({ message: "Feedback not found" });
      return;
    }

    res.status(200).json({ message: "Review selection saved" });
  } catch (error) {
    console.error("Failed to save review selection:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * POST /api/public/feedback/:id/redirect
 * Records the 'Continue to Google' click event for funnel tracking.
 * Does NOT claim a Google review was posted.
 */
export async function redirectReviewController(
  req: Request,
  res: Response
): Promise<void> {
  const { id } = req.params;

  if (!id || typeof id !== "string") {
    res.status(400).json({ message: "Invalid ID" });
    return;
  }

  try {
    const { FeedbackModel } = await import("../models/Feedback.js");
    const updated = await FeedbackModel.findByIdAndUpdate(
      id,
      { $set: { redirectClicked: true } },
      { new: true }
    ).exec();

    if (!updated) {
      res.status(404).json({ message: "Feedback not found" });
      return;
    }

    res.status(200).json({ message: "Redirect recorded" });
  } catch (error) {
    console.error("Failed to record redirect:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
