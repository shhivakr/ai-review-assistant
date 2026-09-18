import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

/**
 * Creates Express middleware from a Zod schema.
 *
 * Validation belongs at the HTTP boundary so controllers can assume they
 * are receiving correctly shaped data. This also gives every future API
 * endpoint one consistent validation mechanism.
 */
export function validateBody(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      /**
       * Return only structured validation information.
       *
       * We intentionally do not expose internal exceptions or stack traces.
       */
      res.status(400).json({
        message: "Invalid request body",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });

      return;
    }

    /**
     * Replace the untrusted request body with the parsed Zod output.
     *
     * This is important because Zod can also normalize/coerce data when a
     * schema explicitly allows it. Controllers should consume this validated
     * value rather than the original untrusted payload.
     */
    req.body = result.data;

    next();
  };
}
