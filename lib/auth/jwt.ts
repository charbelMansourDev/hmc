// Edge-safe (imported by middleware): jose only. No server-only, mongoose or bcrypt here.
// Import the JWT subpaths, not the "jose" barrel: the barrel drags in the JWE
// decrypt path (DecompressionStream), which the Edge Runtime flags as unsupported.
import { SignJWT } from "jose/jwt/sign";
import { jwtVerify } from "jose/jwt/verify";

// Rule 4: the token is scoped to its audience. Any future audience (e.g.
// "staff") must get its own cookie name and `aud`, so one token type can
// never satisfy the other's check even though they share SESSION_SECRET.
export const ADMIN_COOKIE = "hmc_admin";
export const ADMIN_AUDIENCE = "admin";
export const ADMIN_ROLE = "admin";
const ISSUER = "hmc";
export const SESSION_TTL_SECONDS = 8 * 60 * 60;

function secretKey(): Uint8Array | null {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) return null;
  return new TextEncoder().encode(secret);
}

export async function signAdminToken(adminId: string, tokenVersion: number): Promise<string> {
  const key = secretKey();
  if (!key) throw new Error("SESSION_SECRET is missing or shorter than 32 characters");
  return new SignJWT({ role: ADMIN_ROLE, ver: tokenVersion })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(ISSUER)
    .setAudience(ADMIN_AUDIENCE)
    .setSubject(adminId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(key);
}

export type AdminClaims = { sub: string; ver: number };

/** Verifies signature, algorithm, issuer, audience and expiry, then re-checks the role claim. Fails closed. */
export async function verifyAdminToken(token: string | null | undefined): Promise<AdminClaims | null> {
  if (!token) return null;
  const key = secretKey();
  if (!key) return null;
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
      issuer: ISSUER,
      audience: ADMIN_AUDIENCE,
    });
    if (payload.role !== ADMIN_ROLE) return null;
    if (typeof payload.sub !== "string" || typeof payload.ver !== "number") return null;
    return { sub: payload.sub, ver: payload.ver };
  } catch {
    return null;
  }
}
