import { NextResponse, type NextRequest } from "next/server";
import { revokeSessions } from "@/lib/admins";
import { assertSameOrigin, clearAdminCookie } from "@/lib/auth/guard";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/auth/jwt";
import { isObjectIdString, withErrors } from "@/lib/http";

export const runtime = "nodejs";

// Clears the cookie and bumps tokenVersion, so a copied token stops working too.
export const POST = withErrors(async (req: NextRequest) => {
  assertSameOrigin(req);
  const claims = await verifyAdminToken(req.cookies.get(ADMIN_COOKIE)?.value);
  if (claims && isObjectIdString(claims.sub)) await revokeSessions(claims.sub);

  const res = new NextResponse(null, { status: 204 });
  clearAdminCookie(res, req);
  return res;
});
