export class AppError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class MaxQuestionsLimitError extends AppError {
  constructor(message: string = "Maximum active questions limit reached") {
    super(message, 400);
  }
}

export class MinQuestionsLimitError extends AppError {
  constructor(message: string = "Minimum active custom questions limit reached") {
    super(message, 400);
  }
}

export class FixedQuestionConstraintError extends AppError {
  constructor(message: string = "Cannot modify or delete a fixed question") {
    super(message, 403);
  }
}

export class QuestionNotFoundError extends AppError {
  constructor(message: string = "Question not found") {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Conflict occurred") {
    super(message, 409);
  }
}
