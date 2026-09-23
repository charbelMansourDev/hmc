import { NextResponse } from "next/server";
import { adminRoute } from "@/lib/auth/guard";
import { serviceCreateSchema } from "@/lib/schemas";
import { createService, listServices } from "@/lib/services";
import { readMultipart } from "@/lib/upload";

export const runtime = "nodejs";

export const GET = adminRoute(async () => NextResponse.json({ items: await listServices() }));

// multipart/form-data: `data` (JSON) + `image` (required)
export const POST = adminRoute(async (req) => {
  const { data, image } = await readMultipart(req, serviceCreateSchema);
  return NextResponse.json(await createService(data, image), { status: 201 });
});
