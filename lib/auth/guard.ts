import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest, NextResponse } from "next/server";
import { cache } from "react";
import { Admin } from "@/models/Admin";
import { connectDB } from "../db";
import { toAdminSession, type AdminSession } from "../dto";
import { errorResponse, forbidden, isObjectIdString, unauthorized, withErrors } from "../http";
import { ADMIN_COOKIE, SESSION_TTL_SECONDS, signAdminToken, verifyAdminToken } from "./jwt";

// Rule 3: middleware only redirects. These helpers are the authorization
// boundary and are called inside every protected page and route handler.

async function sessionFromToken(token: string | undefined): Promise<AdminSession | null> {
  const claims = await verifyAdminToken(token);
  if (!claims || !isObjectIdString(claims.sub)) return null;
  await connectDB();
  const admin = await Admin.findById(claims.sub).lean();
  // The account must still exist, still be an admin, and not have logged out since.
  if (!admin || admin.role !== "admin" || admin.tokenVersion !== claims.ver) return null;
  return toAdminSession(admin);
}

/** The current admin session for Server Components, deduplicated per request. */
export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  return sessionFromToken(token);
});

/** Call at the top of every CMS page (outside try/catch: redirect() throws). */
export async function requireAdmin(nextPath?: string): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) {
    redirect(nextPath ? `/admin/login?next=${encodeURIComponent(nextPath)}` : "/admin/login");
  }
  return session;
}

type ApiAuth = { ok: true; session: AdminSession } | { ok: false; response: NextResponse };

/** Call first in every admin route handler. 401 without a valid session; 403 for cross-origin mutations. */
export async function requireAdminApi(req: NextRequest): Promise<ApiAuth> {
  if (req.method !== "GET" && req.method !== "HEAD") {
    const origin = req.headers.get("origin");
    if (origin && origin !== req.nextUrl.origin) return { ok: false, response: errorResponse(forbidden()) };
  }
  const session = await sessionFromToken(req.cookies.get(ADMIN_COOKIE)?.value);
  if (!session) return { ok: false, response: errorResponse(unauthorized()) };
  return { ok: true, session };
}

/**
 * Every admin route handler is declared through this wrapper: it runs
 * requireAdminApi() before the handler and maps errors to JSON responses.
 */
export function adminRoute<C>(
  handler: (req: NextRequest, ctx: C, session: AdminSession) => Promise<Response>,
) {
  return withErrors(async (req: NextRequest, ctx: C) => {
    const auth = await requireAdminApi(req);
    if (!auth.ok) return auth.response;
    return handler(req, ctx, auth.session);
  });
}

/** Rejects a cross-origin POST on public endpoints that set or clear cookies. */
export function assertSameOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (origin && origin !== req.nextUrl.origin) throw forbidden();
}

function isHttps(req: NextRequest): boolean {
  return req.nextUrl.protocol === "https:" || req.headers.get("x-forwarded-proto") === "https";
}

export async function setAdminCookie(res: NextResponse, req: NextRequest, adminId: string, tokenVersion: number) {
  const token = await signAdminToken(adminId, tokenVersion);
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isHttps(req),
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function clearAdminCookie(res: NextResponse, req: NextRequest) {
  res.cookies.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: isHttps(req),
    path: "/",
    maxAge: 0,
  });
}

/** Only allow post-login redirects back into the CMS. */
export function safeNextPath(next: unknown): string {
  if (typeof next !== "string") return "/admin";
  if (!next.startsWith("/admin") || next.startsWith("//") || next.startsWith("/admin/login")) return "/admin";
  return next;
}
