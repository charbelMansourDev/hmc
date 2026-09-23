import { NextResponse } from "next/server";
import { adminRoute } from "@/lib/auth/guard";
import { createClinic, listClinics } from "@/lib/clinics";
import { clinicCreateSchema } from "@/lib/schemas";
import { readMultipart } from "@/lib/upload";

export const runtime = "nodejs";

export const GET = adminRoute(async () => NextResponse.json({ items: await listClinics() }));

// multipart/form-data: `data` (JSON) + `image` (required)
export const POST = adminRoute(async (req) => {
  const { data, image } = await readMultipart(req, clinicCreateSchema);
  return NextResponse.json(await createClinic(data, image), { status: 201 });
});
