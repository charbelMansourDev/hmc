import { NextResponse } from "next/server";
import { readLocalImage } from "@/lib/storage";

export const runtime = "nodejs";

// Serves images uploaded with the local storage backend (./uploads).
// Only `<uuid>.<jpg|png|webp>` names are accepted, so path traversal is impossible.
export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const file = path.length === 1 ? await readLocalImage(path[0]) : null;
  if (!file) return new NextResponse("Not found", { status: 404 });

  return new NextResponse(new Uint8Array(file.bytes), {
    headers: {
      "Content-Type": file.contentType,
      "Content-Length": String(file.bytes.length),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": "inline",
    },
  });
}
