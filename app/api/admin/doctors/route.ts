import { NextResponse } from "next/server";
import { adminRoute } from "@/lib/auth/guard";
import { createDoctor, listDoctors } from "@/lib/doctors";
import { doctorCreateSchema } from "@/lib/schemas";
import { readMultipart } from "@/lib/upload";

export const runtime = "nodejs";

export const GET = adminRoute(async () => NextResponse.json({ items: await listDoctors() }));

// multipart/form-data: `data` (JSON) + optional `image` (photo)
export const POST = adminRoute(async (req) => {
  const { data, image } = await readMultipart(req, doctorCreateSchema);
  return NextResponse.json(await createDoctor(data, image), { status: 201 });
});
