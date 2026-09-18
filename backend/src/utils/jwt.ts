import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";

/**
 * Access tokens are intentionally short-lived.
 *
 * If an access token is leaked, the exposure window is limited to 15 minutes.
 * The refresh token is used to obtain a new access token without requiring
 * the admin to log in again.
 */
const ACCESS_TOKEN_EXPIRES_IN = "15m";

/**
 * Refresh tokens live longer because they are stored in an httpOnly cookie
 * and are not exposed directly to frontend JavaScript.
 *
 * We will revisit refresh-token rotation/revocation when implementing the
 * complete authentication flow.
 */
const REFRESH_TOKEN_EXPIRES_IN = "7d";

export type AccessTokenPayload = {
  /**
   * JWT standard "sub" (subject) claim.
   * We use the MongoDB Admin _id as the subject.
   */
  sub: string;

  /**
   * The role is included so authorization middleware does not need to
   * perform a database lookup for every request just to know the role.
   */
  role: "admin";
};

export type RefreshTokenPayload = {
  /**
   * Identifies which admin owns the refresh token.
   */
  sub: string;

  /**
   * Explicitly identifies this token as a refresh token.
   *
   * This prevents an access token from accidentally being accepted by
   * refresh-token verification logic.
   */
  type: "refresh";
};

/**
 * Read and validate the access-token signing secret.
 *
 * Secrets must come from environment variables and must never be
 * hardcoded into source control.
 */
function getAccessSecret(): string {
  const secret = process.env.JWT_ACCESS_SECRET;

  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET is not defined");
  }

  return secret;
}

/**
 * Read and validate the refresh-token signing secret.
 *
 * A separate secret is used so compromise of one token type does not
 * automatically compromise the other token type.
 */
function getRefreshSecret(): string {
  const secret = process.env.JWT_REFRESH_SECRET;

  if (!secret) {
    throw new Error("JWT_REFRESH_SECRET is not defined");
  }

  return secret;
}

/**
 * Creates a short-lived access token used to authenticate API requests.
 */
export function createAccessToken(payload: AccessTokenPayload): string {
  const options: SignOptions = {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  };

  return jwt.sign(payload, getAccessSecret(), options);
}

/**
 * Creates a refresh token used to obtain new access tokens.
 */
export function createRefreshToken(payload: RefreshTokenPayload): string {
  const options: SignOptions = {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  };

  return jwt.sign(payload, getRefreshSecret(), options);
}

/**
 * Validates an access token and returns a strongly validated payload.
 *
 * jwt.verify() only proves that the token signature/expiration is valid.
 * It does NOT guarantee that the decoded payload has the shape our
 * application expects, so we validate the claims explicitly.
 */
export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, getAccessSecret());

  if (!isAccessTokenPayload(decoded)) {
    throw new Error("Invalid access token payload");
  }

  return decoded;
}

/**
 * Validates a refresh token and ensures that a token intended for another
 * purpose cannot be used in the refresh flow.
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const decoded = jwt.verify(token, getRefreshSecret());

  if (!isRefreshTokenPayload(decoded)) {
    throw new Error("Invalid refresh token payload");
  }

  return decoded;
}

/**
 * Runtime validation for access-token claims.
 *
 * TypeScript types disappear at runtime, so this check is necessary when
 * consuming data that came from an external/untrusted JWT.
 */
function isAccessTokenPayload(
  value: string | JwtPayload,
): value is AccessTokenPayload {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof value.sub === "string" &&
    value.sub.length > 0 &&
    value.role === "admin"
  );
}

/**
 * Runtime validation for refresh-token claims.
 */
function isRefreshTokenPayload(
  value: string | JwtPayload,
): value is RefreshTokenPayload {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof value.sub === "string" &&
    value.sub.length > 0 &&
    value.type === "refresh"
  );
}
