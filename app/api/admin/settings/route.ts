import { NextResponse } from "next/server";
import { adminRoute } from "@/lib/auth/guard";
import { readJson } from "@/lib/http";
import { settingsUpdateSchema } from "@/lib/schemas";
import { getSettings, updateSettings } from "@/lib/settings";

export const runtime = "nodejs";

export const GET = adminRoute(async () => NextResponse.json(await getSettings()));

export const PATCH = adminRoute(async (req) => {
  const patch = await readJson(req, settingsUpdateSchema);
  return NextResponse.json(await updateSettings(patch));
});
