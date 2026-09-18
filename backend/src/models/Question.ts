import { Schema, model, type InferSchemaType } from "mongoose";

export const QuestionTypeEnum = ["RATING", "TEXT", "MULTIPLE_CHOICE"] as const;

const questionSchema = new Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    type: {
      type: String,
      enum: QuestionTypeEnum,
      required: true,
    },
    options: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      required: true,
      unique: true,
    },
    isFixed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export type Question = InferSchemaType<typeof questionSchema>;

export const QuestionModel = model("Question", questionSchema);
