import { z } from "zod";
import mongoose from "mongoose";

export const submitFeedbackSchema = z.object({
  rating: z.number().int().min(1).max(5, "Rating must be between 1 and 5"),
  answers: z.array(
    z.object({
      questionId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
        message: "Invalid question ID format",
      }),
      answer: z.union([z.string(), z.number()]),
    })
  ).default([]),
});
