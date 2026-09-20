import mongoose from "mongoose";
import { BusinessModel } from "../models/Business.js";
import { FeedbackModel, type Feedback } from "../models/Feedback.js";
import { QuestionModel } from "../models/Question.js";
import { NotFoundError, ValidationError } from "../utils/errors.js";

type AnswerInput = {
  questionId: string;
  answer: string | number;
};

export async function submitFeedback(
  qrToken: string,
  rating: number,
  answers: AnswerInput[]
): Promise<Feedback> {
  const business = await BusinessModel.findOne({ qrToken }).lean().exec();
  if (!business) {
    throw new NotFoundError("Business not found for the provided token");
  }

  // Load active questions from DB to validate against
  const activeQuestions = await QuestionModel.find({ isActive: true }).lean().exec();
  const questionMap = new Map(activeQuestions.map((q) => [q._id.toString(), q]));

  const validatedAnswers = [];

  for (const submitted of answers) {
    const q = questionMap.get(submitted.questionId);
    if (!q) {
      throw new ValidationError(`Question ID ${submitted.questionId} is invalid or inactive`);
    }
    
    // Prevent overriding the fixed overall rating via custom answers
    if (q.isFixed) continue; 

    const { type, text, options } = q;
    let finalAnswer = submitted.answer;

    if (type === "RATING") {
      const numAnswer = Number(finalAnswer);
      if (isNaN(numAnswer) || numAnswer < 1 || numAnswer > 5) {
        throw new ValidationError(`Rating for question '${text}' must be between 1 and 5`);
      }
      finalAnswer = numAnswer;
    } else if (type === "MULTIPLE_CHOICE") {
      if (!options || !options.includes(String(finalAnswer))) {
        throw new ValidationError(`Answer '${finalAnswer}' is not a valid option for question '${text}'`);
      }
    } else if (type === "TEXT") {
      if (typeof finalAnswer !== "string" || finalAnswer.trim().length === 0) {
        throw new ValidationError(`Text answer for question '${text}' cannot be empty`);
      }
    }

    validatedAnswers.push({
      questionId: new mongoose.Types.ObjectId(submitted.questionId),
      questionText: text,
      type,
      answer: finalAnswer,
    });
  }

  const feedback = await FeedbackModel.create({
    qrToken,
    rating,
    answers: validatedAnswers,
  });

  return feedback;
}
