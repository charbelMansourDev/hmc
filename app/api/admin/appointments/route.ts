import { NextResponse } from "next/server";
import { listAppointments } from "@/lib/appointments";
import { adminRoute } from "@/lib/auth/guard";
import { parseWith } from "@/lib/http";
import { appointmentListQuery } from "@/lib/schemas";

export const runtime = "nodejs";

// GET /api/admin/appointments?status=new&page=2
export const GET = adminRoute(async (req) => {
  const query = parseWith(appointmentListQuery, Object.fromEntries(req.nextUrl.searchParams));
  return NextResponse.json(await listAppointments(query));
});
