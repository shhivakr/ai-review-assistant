import type { Request, Response } from "express";
import { loginAdmin } from "../services/authService.js";

/**
 * Handles administrator login requests.
 *
 * Responsibilities of the controller:
 * - Read and validate the HTTP request shape at the boundary.
 * - Delegate authentication to the service layer.
 * - Set the refresh token as an httpOnly cookie.
 * - Return only the access token and safe admin information.
 *
 * Business/authentication logic stays inside authService.ts.
 */
export async function loginController(
  req: Request,
  res: Response,
): Promise<void> {
  /**
   * The request body has already been validated by `validateBody(loginSchema)`.
   *
   * At this point the controller can safely consume the expected fields.
   */
  const { email, password } = req.body as {
    email: string;
    password: string;
  };

  try {
    const { accessToken, refreshToken } = await loginAdmin(email, password);

    /**
     * The refresh token must not be accessible through document.cookie or
     * frontend JavaScript. This limits the usefulness of an XSS attack
     * against the refresh credential.
     *
     * `sameSite: "lax"` is appropriate for the current local development
     * setup. We will revisit the production cookie policy when deployment
     * domains are known.
     */
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/api/admin",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      accessToken,
    });
  } catch (error) {
    /**
     * Authentication failures intentionally use a generic response.
     *
     * We don't distinguish "admin does not exist" from "wrong password"
     * at the HTTP boundary.
     */
    if (error instanceof Error && error.message === "Invalid credentials") {
      res.status(401).json({
        message: "Invalid credentials",
      });

      return;
    }

    /**
     * Unexpected errors should not expose implementation details to the
     * client. Log the actual error server-side for debugging.
     */
    console.error("Admin login failed:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
}
