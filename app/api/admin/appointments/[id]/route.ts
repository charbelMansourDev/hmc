import { NextResponse } from "next/server";
import { deleteAppointment, getAppointment, setAppointmentStatus } from "@/lib/appointments";
import { adminRoute } from "@/lib/auth/guard";
import { assertObjectId, readJson } from "@/lib/http";
import { appointmentStatusInput } from "@/lib/schemas";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export const GET = adminRoute<Ctx>(async (_req, { params }) => {
  const { id } = await params;
  return NextResponse.json(await getAppointment(id));
});

export const PATCH = adminRoute<Ctx>(async (req, { params }) => {
  const { id } = await params;
  assertObjectId(id, "Appointment request");
  const { status } = await readJson(req, appointmentStatusInput);
  return NextResponse.json(await setAppointmentStatus(id, status));
});

export const DELETE = adminRoute<Ctx>(async (_req, { params }) => {
  const { id } = await params;
  await deleteAppointment(id);
  return new NextResponse(null, { status: 204 });
});
