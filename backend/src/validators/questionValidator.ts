import { z } from "zod";

const questionTypeSchema = z.enum(["RATING", "TEXT", "MULTIPLE_CHOICE"]);

export const createQuestionSchema = z
  .object({
    text: z.string().trim().min(1, "Question text is required").max(300),
    type: questionTypeSchema,
    options: z.array(z.string().trim().min(1).max(100)).optional(),
    isActive: z.boolean().optional().default(true),
  })
  .superRefine((data, ctx) => {
    if (data.type === "MULTIPLE_CHOICE") {
      if (!data.options || data.options.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "MULTIPLE_CHOICE questions require at least 2 options",
          path: ["options"],
        });
      }
    } else {
      if (data.options && data.options.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Options are only allowed for MULTIPLE_CHOICE questions",
          path: ["options"],
        });
      }
    }
  });

export const updateQuestionSchema = z
  .object({
    text: z.string().trim().min(1).max(300).optional(),
    type: questionTypeSchema.optional(),
    options: z.array(z.string().trim().min(1).max(100)).optional(),
    isActive: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    // If type is being updated to MULTIPLE_CHOICE, we must ensure options are valid.
    // However, in a PUT request, they might just be updating the text.
    // We enforce that if type is MULTIPLE_CHOICE, options must be valid.
    if (data.type === "MULTIPLE_CHOICE") {
      if (data.options !== undefined && data.options.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "MULTIPLE_CHOICE questions require at least 2 options",
          path: ["options"],
        });
      }
    } else if (data.type === "RATING" || data.type === "TEXT") {
      if (data.options && data.options.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Options are only allowed for MULTIPLE_CHOICE questions",
          path: ["options"],
        });
      }
    }
  });
