import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/jwt.js";

/**
 * Extends Express's Request object with the authenticated admin identity.
 *
 * We only store the claims that were validated from the access token.
 * Controllers can use req.auth without needing to decode the JWT again.
 */
export type AuthenticatedRequest = Request & {
  auth: {
    adminId: string;
    role: "admin";
  };
};

/**
 * Protects admin-only API routes.
 *
 * Expected header:
 * Authorization: Bearer <access-token>
 *
 * Authentication failures intentionally return the same generic response.
 * We do not expose whether the token was missing, malformed, expired, or
 * signed with an incorrect secret.
 */
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authorization = req.header("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    res.status(401).json({
      message: "Authentication required",
    });

    return;
  }

  const token = authorization.slice("Bearer ".length).trim();

  if (!token) {
    res.status(401).json({
      message: "Authentication required",
    });

    return;
  }

  try {
    const payload = verifyAccessToken(token);

    /**
     * Express's Request type does not know about our custom `auth` property,
     * so we cast to AuthenticatedRequest after the JWT payload has been
     * successfully verified and validated.
     */
    const authenticatedRequest = req as AuthenticatedRequest;

    authenticatedRequest.auth = {
      adminId: payload.sub,
      role: payload.role,
    };

    next();
  } catch {
    /**
     * Never return the underlying JWT error to the client.
     *
     * Errors such as "jwt expired" or "invalid signature" are useful for
     * server-side debugging but should not become an authentication oracle.
     */
    res.status(401).json({
      message: "Authentication required",
    });
  }
}
