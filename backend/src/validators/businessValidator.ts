import { z } from "zod";

/**
 * Validation schema for creating/updating the business configuration.
 *
 * The application is currently single-tenant, so these fields represent
 * the one business used by the demo.
 *
 * `qrToken` is intentionally excluded. QR token generation and replacement
 * will be handled by the QR-specific API so ordinary business updates
 * cannot accidentally invalidate an existing QR code.
 */
export const updateBusinessSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Business name is required")
    .max(120, "Business name is too long"),

  logoUrl: z
    .string()
    .trim()
    .max(2048, "Logo URL is too long")
    .optional()
    .default(""),

  description: z
    .string()
    .trim()
    .max(500, "Description is too long")
    .optional()
    .default(""),

  address: z
    .string()
    .trim()
    .max(300, "Address is too long")
    .optional()
    .default(""),

  phone: z
    .string()
    .trim()
    .max(30, "Phone number is too long")
    .optional()
    .default(""),

  googleReviewUrl: z
    .string()
    .trim()
    .max(2048, "Google review URL is too long")
    .optional()
    .default(""),
});
