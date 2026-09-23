import { NextResponse, type NextRequest } from "next/server";
import { recordLogin, verifyCredentials } from "@/lib/admins";
import { assertSameOrigin, setAdminCookie } from "@/lib/auth/guard";
import { HttpError, rateLimited, readJson, withErrors } from "@/lib/http";
import { clearLimit, clientKey, hitLimit, peekLimit } from "@/lib/ratelimit";
import { loginInput } from "@/lib/schemas";

export const runtime = "nodejs";

const MAX_FAILURES = 5;
const WINDOW_SECONDS = 15 * 60;

export const POST = withErrors(async (req: NextRequest) => {
  assertSameOrigin(req);
  const { username, password } = await readJson(req, loginInput);
  const user = username.trim().toLowerCase();

  const ipKey = `login:ip:${clientKey(req)}`;
  const userKey = `login:user:${user}`;
  const [ip, account] = await Promise.all([peekLimit(ipKey, WINDOW_SECONDS), peekLimit(userKey, WINDOW_SECONDS)]);
  if (ip.count >= MAX_FAILURES || account.count >= MAX_FAILURES) {
    throw rateLimited(Math.max(ip.retryAfter, account.retryAfter));
  }

  const admin = await verifyCredentials(user, password);
  if (!admin) {
    await Promise.all([
      hitLimit(ipKey, MAX_FAILURES, WINDOW_SECONDS),
      hitLimit(userKey, MAX_FAILURES, WINDOW_SECONDS),
    ]);
    // Same response whether the username or the password was wrong.
    throw new HttpError(401, "invalid_credentials", "Invalid username or password.");
  }

  await Promise.all([clearLimit(userKey, WINDOW_SECONDS), recordLogin(String(admin._id))]);
  const res = NextResponse.json({ ok: true });
  await setAdminCookie(res, req, String(admin._id), admin.tokenVersion);
  return res;
});
