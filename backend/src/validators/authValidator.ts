import { z } from "zod";

/**
 * Validation schema for administrator login.
 *
 * We deliberately keep password validation here minimal. Authentication
 * should reject an incorrect password, but login should not impose password
 * composition rules that belong to password creation/change flows.
 */
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("A valid email address is required")
    .max(254, "Email address is too long"),

  password: z
    .string()
    .min(1, "Password is required")
    .max(128, "Password is too long"),
});
