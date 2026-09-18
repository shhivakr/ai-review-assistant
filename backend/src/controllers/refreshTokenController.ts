import type { Request, Response } from "express";
import { refreshAdminAccessToken } from "../services/refreshTokenService.js";

/**
 * Handles access-token refresh requests.
 *
 * The refresh token is read exclusively from the httpOnly cookie. It is
 * never accepted through the request body or query string.
 */
export async function refreshTokenController(
  req: Request,
  res: Response,
): Promise<void> {
  const refreshToken = req.cookies?.refreshToken;

  /**
   * Treat a missing cookie exactly like an invalid token.
   *
   * This keeps the authentication boundary simple and avoids exposing
   * unnecessary information about the refresh-token state.
   */
  if (typeof refreshToken !== "string" || !refreshToken) {
    res.status(401).json({
      message: "Authentication required",
    });

    return;
  }

  try {
    const accessToken = await refreshAdminAccessToken(refreshToken);

    /**
     * Only the new short-lived access token is returned to the frontend.
     * The refresh token remains protected inside the httpOnly cookie.
     */
    res.status(200).json({
      accessToken,
    });
  } catch (error) {
    /**
     * JWT verification errors, expired tokens, deleted admins, and malformed
     * tokens all result in the same public authentication response.
     */
    if (
      error instanceof Error &&
      (error.message === "Invalid refresh token" ||
        error.name === "JsonWebTokenError" ||
        error.name === "TokenExpiredError")
    ) {
      res.status(401).json({
        message: "Authentication required",
      });

      return;
    }

    /**
     * Unexpected failures are logged server-side but never exposed to the
     * client because they may contain implementation details.
     */
    console.error("Refresh token request failed:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
}
