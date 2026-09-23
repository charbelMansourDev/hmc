import { NextResponse } from "next/server";
import { adminRoute } from "@/lib/auth/guard";
import { deleteClinic, getClinic, updateClinic } from "@/lib/clinics";
import { assertObjectId } from "@/lib/http";
import { clinicUpdateSchema } from "@/lib/schemas";
import { readMultipart } from "@/lib/upload";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export const GET = adminRoute<Ctx>(async (_req, { params }) => {
  const { id } = await params;
  return NextResponse.json(await getClinic(id));
});

export const PATCH = adminRoute<Ctx>(async (req, { params }) => {
  const { id } = await params;
  assertObjectId(id, "Clinic");
  const { data, image } = await readMultipart(req, clinicUpdateSchema);
  return NextResponse.json(await updateClinic(id, data, image));
});

export const DELETE = adminRoute<Ctx>(async (_req, { params }) => {
  const { id } = await params;
  await deleteClinic(id);
  return new NextResponse(null, { status: 204 });
});
