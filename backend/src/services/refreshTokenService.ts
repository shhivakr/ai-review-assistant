import { AdminModel } from "../models/Admin.js";
import { createAccessToken, verifyRefreshToken } from "../utils/jwt.js";

/**
 * Exchanges a valid refresh token for a new access token.
 *
 * The refresh token itself is never returned or replaced here.
 * For the current MVP authentication design, the refresh JWT remains valid
 * until its configured expiration time.
 *
 * A future hardening step can add refresh-token rotation/revocation.
 */
export async function refreshAdminAccessToken(
  refreshToken: string,
): Promise<string> {
  /**
   * Signature, expiration, and token-purpose validation all happen inside
   * verifyRefreshToken().
   */
  const payload = verifyRefreshToken(refreshToken);

  /**
   * The JWT proves that the token was issued for this admin, but it does not
   * prove that the admin still exists. Checking the database prevents a
   * deleted admin account from continuing to authenticate until token expiry.
   */
  const admin = await AdminModel.findById(payload.sub).select("_id role");

  if (!admin || admin.role !== "admin") {
    throw new Error("Invalid refresh token");
  }

  /**
   * Issue a fresh short-lived access token using the admin ID from the
   * validated refresh-token subject.
   */
  return createAccessToken({
    sub: admin._id.toString(),
    role: "admin",
  });
}
