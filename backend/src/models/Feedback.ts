import { Schema, model, type InferSchemaType } from "mongoose";

const answerSchema = new Schema(
  {
    questionId: { type: Schema.Types.ObjectId, required: true, ref: "Question" },
    questionText: { type: String, required: true },
    type: { type: String, enum: ["RATING", "TEXT", "MULTIPLE_CHOICE"], required: true },
    answer: { type: Schema.Types.Mixed, required: true },
  },
  { _id: false }
);

const generatedReviewsSchema = new Schema(
  {
    sentiment: {
      type: String,
      enum: ["POSITIVE", "NEUTRAL", "NEGATIVE"],
      required: true,
    },
    summary: { type: String, required: true },
    reviews: [
      {
        style: { type: String, required: true },
        text: { type: String, required: true },
      },
    ],
  },
  { _id: false }
);

const feedbackSchema = new Schema(
  {
    qrToken: { type: String, required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    answers: { type: [answerSchema], required: true },
    generatedReviews: { type: generatedReviewsSchema, default: null },
    selectedIndex: { type: Number, default: null },
    editedReviewText: { type: String, default: null },
    redirectClicked: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export type Feedback = InferSchemaType<typeof feedbackSchema>;
export const FeedbackModel = model("Feedback", feedbackSchema);
