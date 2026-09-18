import type { Request, Response } from "express";

/**
 * Logs the administrator out of the browser session.
 *
 * Because the refresh token is stored in an httpOnly cookie, logout is
 * implemented by expiring that cookie on the server response.
 *
 * The short-lived access token is intentionally not revoked here. It may
 * remain usable until its 15-minute expiration. A future token-revocation
 * strategy can address immediate access-token invalidation if required.
 */
export function logoutController(_req: Request, res: Response): void {
  /**
   * The cookie options must match the options used when the cookie was
   * created. Matching the path is particularly important; otherwise the
   * browser may retain the original cookie.
   */
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/admin",
  });

  res.status(200).json({
    message: "Logged out successfully",
  });
}
