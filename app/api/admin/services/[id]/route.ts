import { NextResponse } from "next/server";
import { adminRoute } from "@/lib/auth/guard";
import { assertObjectId } from "@/lib/http";
import { serviceUpdateSchema } from "@/lib/schemas";
import { deleteService, getService, updateService } from "@/lib/services";
import { readMultipart } from "@/lib/upload";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export const GET = adminRoute<Ctx>(async (_req, { params }) => {
  const { id } = await params;
  return NextResponse.json(await getService(id));
});

// multipart/form-data: `data` (partial JSON) + optional `image`
export const PATCH = adminRoute<Ctx>(async (req, { params }) => {
  const { id } = await params;
  assertObjectId(id, "Service"); // 404 before reading an upload for a bad id
  const { data, image } = await readMultipart(req, serviceUpdateSchema);
  return NextResponse.json(await updateService(id, data, image));
});

export const DELETE = adminRoute<Ctx>(async (_req, { params }) => {
  const { id } = await params;
  await deleteService(id);
  return new NextResponse(null, { status: 204 });
});
