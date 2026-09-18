import { QuestionModel, type Question } from "../models/Question.js";
import {
  MaxQuestionsLimitError,
  MinQuestionsLimitError,
  FixedQuestionConstraintError,
  QuestionNotFoundError,
  ConflictError,
} from "../utils/errors.js";

/**
 * Initializes the fixed Q1 question securely using an atomic upsert.
 * This guarantees no race conditions can create duplicate Q1s.
 */
async function initializeFixedQuestion(): Promise<void> {
  await QuestionModel.findOneAndUpdate(
    { order: 1 },
    {
      $setOnInsert: {
        text: "How would you rate your overall experience?",
        type: "RATING",
        isActive: true,
        order: 1,
        isFixed: true,
      },
    },
    { upsert: true, new: true }
  ).exec();
}

/**
 * Fetches all questions, including inactive ones.
 * Initializes Q1 if it doesn't exist.
 */
export async function getQuestions(): Promise<Question[]> {
  await initializeFixedQuestion();
  return QuestionModel.find().sort({ order: 1 }).exec();
}

/**
 * Creates a new custom question.
 * Enforces the max 4 active custom questions limit.
 */
export async function createQuestion(data: Partial<Question>): Promise<Question> {
  // If the question is being created as active, enforce the max active limit
  if (data.isActive !== false) {
    const activeCustomCount = await QuestionModel.countDocuments({
      isFixed: false,
      isActive: true,
    });
    if (activeCustomCount >= 4) {
      throw new MaxQuestionsLimitError("Cannot exceed 4 active custom questions.");
    }
  }

  // Determine the next order atomically-ish, but handle dupes gracefully below
  const lastQuestion = await QuestionModel.findOne().sort({ order: -1 }).exec();
  const nextOrder = lastQuestion && lastQuestion.order ? lastQuestion.order + 1 : 2;

  try {
    const question = await QuestionModel.create({
      ...data,
      isFixed: false,
      order: nextOrder,
    });
    return question;
  } catch (error: any) {
    // Gracefully handle MongoDB E11000 duplicate key error on the 'order' field
    if (error.code === 11000 && error.keyPattern && error.keyPattern.order) {
      throw new ConflictError(
        "A question ordering conflict occurred due to concurrent requests. Please try again."
      );
    }
    throw error;
  }
}

/**
 * Updates an existing question.
 * Protects Q1 and enforces active question limits.
 */
export async function updateQuestion(
  id: string,
  data: Partial<Question>
): Promise<Question> {
  const question = await QuestionModel.findById(id).exec();
  if (!question) {
    throw new QuestionNotFoundError();
  }

  if (question.isFixed) {
    throw new FixedQuestionConstraintError("Cannot modify the fixed Q1 question.");
  }

  // Enforce active question limits if toggling isActive
  if (data.isActive !== undefined && data.isActive !== question.isActive) {
    const activeCustomCount = await QuestionModel.countDocuments({
      isFixed: false,
      isActive: true,
    });

    if (data.isActive === false) {
      // Deactivating
      if (activeCustomCount <= 3) {
        throw new MinQuestionsLimitError(
          "Cannot deactivate. A minimum of 3 active custom questions is required."
        );
      }
    } else {
      // Activating
      if (activeCustomCount >= 4) {
        throw new MaxQuestionsLimitError(
          "Cannot activate. A maximum of 4 active custom questions is allowed."
        );
      }
    }
  }

  // If changing type to MULTIPLE_CHOICE without providing options, ensure existing options are valid
  if (data.type === "MULTIPLE_CHOICE" && data.options === undefined) {
      if (!question.options || question.options.length < 2) {
          // If we allow updating type without options, we should force them to be present
          throw new ConflictError("MULTIPLE_CHOICE questions require at least 2 options.");
      }
  }

  Object.assign(question, data);

  try {
    return await question.save();
  } catch (error: any) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.order) {
      throw new ConflictError("A question ordering conflict occurred.");
    }
    throw error;
  }
}

/**
 * Deletes a question.
 * Protects Q1 and enforces the minimum 3 active custom questions limit.
 */
export async function deleteQuestion(id: string): Promise<void> {
  const question = await QuestionModel.findById(id).exec();
  if (!question) {
    throw new QuestionNotFoundError();
  }

  if (question.isFixed) {
    throw new FixedQuestionConstraintError("Cannot delete the fixed Q1 question.");
  }

  // If we are deleting an active question, check if it drops us below the minimum
  if (question.isActive) {
    const activeCustomCount = await QuestionModel.countDocuments({
      isFixed: false,
      isActive: true,
    });
    if (activeCustomCount <= 3) {
      throw new MinQuestionsLimitError(
        "Cannot delete. A minimum of 3 active custom questions is required."
      );
    }
  }

  await question.deleteOne();
}
