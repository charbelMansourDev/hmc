import { NextResponse } from "next/server";
import { adminRoute } from "@/lib/auth/guard";
import { deleteDoctor, getDoctor, updateDoctor } from "@/lib/doctors";
import { assertObjectId } from "@/lib/http";
import { doctorUpdateSchema } from "@/lib/schemas";
import { readMultipart } from "@/lib/upload";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export const GET = adminRoute<Ctx>(async (_req, { params }) => {
  const { id } = await params;
  return NextResponse.json(await getDoctor(id));
});

export const PATCH = adminRoute<Ctx>(async (req, { params }) => {
  const { id } = await params;
  assertObjectId(id, "Team member");
  const { data, image } = await readMultipart(req, doctorUpdateSchema);
  return NextResponse.json(await updateDoctor(id, data, image));
});

export const DELETE = adminRoute<Ctx>(async (_req, { params }) => {
  const { id } = await params;
  await deleteDoctor(id);
  return new NextResponse(null, { status: 204 });
});
