import { AdminModel } from "../models/Admin.js";
import { comparePassword } from "../utils/password.js";
import { createAccessToken, createRefreshToken } from "../utils/jwt.js";

/**
 * Authenticates an administrator and creates the two tokens required by
 * the application's authentication flow.
 *
 * Access token:
 * - Short-lived.
 * - Returned to the frontend.
 * - Sent in the Authorization header for protected API requests.
 *
 * Refresh token:
 * - Longer-lived.
 * - Stored in an httpOnly cookie.
 * - Never exposed to frontend JavaScript.
 */
export async function loginAdmin(
  email: string,
  password: string,
): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  const normalizedEmail = email.trim().toLowerCase();

  const admin = await AdminModel.findOne({
    email: normalizedEmail,
  });

  /**
   * Use the same public error for a missing account and an incorrect
   * password. This prevents the login endpoint from revealing whether
   * a particular email address exists in the system.
   */
  if (!admin) {
    throw new Error("Invalid credentials");
  }

  const passwordMatches = await comparePassword(password, admin.passwordHash);

  if (!passwordMatches) {
    throw new Error("Invalid credentials");
  }

  const adminId = admin._id.toString();

  const accessToken = createAccessToken({
    sub: adminId,
    role: "admin",
  });

  const refreshToken = createRefreshToken({
    sub: adminId,
    type: "refresh",
  });

  return {
    accessToken,
    refreshToken,
  };
}
