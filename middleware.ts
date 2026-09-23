import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifyAdminToken } from "./lib/auth/jwt";

// Redirect UX only — NOT an authorization boundary (cf. CVE-2025-29927).
// Every CMS page calls requireAdmin() and every admin route handler calls
// requireAdminApi(); those checks are what protect the data.
export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  const claims = await verifyAdminToken(req.cookies.get(ADMIN_COOKIE)?.value);
  if (claims) return NextResponse.next();

  const login = new URL("/admin/login", req.url);
  login.searchParams.set("next", pathname + search);
  return NextResponse.redirect(login);
}

// Must be a static literal: a computed matcher is silently ignored.
// /api is deliberately not matched; admin route handlers answer 401 themselves.
export const config = {
  matcher: ["/admin/:path*"],
};
