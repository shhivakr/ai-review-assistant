import { Schema, model, type InferSchemaType } from "mongoose";

const businessSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    logoUrl: {
      type: String,
      default: "",
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },

    address: {
      type: String,
      default: "",
      trim: true,
      maxlength: 300,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
      maxlength: 30,
    },

    googleReviewUrl: {
      type: String,
      default: "",
      trim: true,
    },

    qrToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

export type Business = InferSchemaType<typeof businessSchema>;

export const BusinessModel = model("Business", businessSchema);
