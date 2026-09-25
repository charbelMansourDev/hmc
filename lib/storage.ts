import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { del, put } from "@vercel/blob";
import type { ImageRef } from "@/models/_image";

// Rule 2: uploads never go to public/ (Next indexes it once at boot, so files
// written later 404 under `next start`). One module, backend chosen by env:
//   BLOB_READ_WRITE_TOKEN set -> Vercel Blob
//   otherwise                 -> ./uploads, served by GET /api/media/[...path]

export type ImageExt = "jpg" | "png" | "webp";

export const CONTENT_TYPES: Record<ImageExt, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export const UPLOAD_DIR = path.join(process.cwd(), "uploads");

/** Local file names are always `<uuid>.<ext>`; anything else is rejected. */
export const LOCAL_FILE_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$/;

function blobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function saveImage(bytes: Uint8Array, ext: ImageExt, alt: string): Promise<ImageRef> {
  const name = `${randomUUID()}.${ext}`;
  const contentType = CONTENT_TYPES[ext];

  if (blobConfigured()) {
    const blob = await put(`hmc/${name}`, Buffer.from(bytes), {
      access: "public",
      contentType,
      addRandomSuffix: false,
    });
    return { url: blob.url, alt, key: blob.pathname, storage: "blob" };
  }

  if (process.env.VERCEL) {
    // Vercel's filesystem is read-only; refuse clearly rather than fail oddly.
    throw new Error("Image storage is not configured: set BLOB_READ_WRITE_TOKEN (Vercel Blob).");
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, name), bytes);
  return { url: `/api/media/${name}`, alt, key: name, storage: "local" };
}

/**
 * A plain copy of an image sub-document. Never spread a Mongoose sub-document
 * (`{ ...doc.image }`): that copies Mongoose's internals, not url/key/storage,
 * so the copy can't be deleted or re-saved correctly.
 */
export function plainImage(img: ImageRef | null | undefined): ImageRef | null {
  if (!img) return null;
  return { url: img.url, alt: img.alt, key: img.key ?? null, storage: img.storage };
}

/** Deletes a stored image. External (seeded) images are never touched. Never throws. */
export async function deleteImage(ref: ImageRef | null | undefined): Promise<void> {
  if (!ref) return;
  try {
    if (ref.storage === "blob") {
      await del(ref.url);
    } else if (ref.storage === "local" && ref.key && LOCAL_FILE_RE.test(ref.key)) {
      await unlink(path.join(UPLOAD_DIR, ref.key));
    }
  } catch (err) {
    if ((err as NodeJS.ErrnoException)?.code !== "ENOENT") {
      console.error("[storage] could not delete image", ref.storage, ref.key, err);
    }
  }
}

/** Reads a locally stored image by file name, or null if it is invalid/missing. */
export async function readLocalImage(name: string): Promise<{ bytes: Buffer; contentType: string } | null> {
  if (!LOCAL_FILE_RE.test(name)) return null;
  const resolved = path.resolve(UPLOAD_DIR, name);
  if (!resolved.startsWith(UPLOAD_DIR + path.sep)) return null;
  try {
    const bytes = await readFile(resolved);
    const ext = name.split(".").pop() as ImageExt;
    return { bytes, contentType: CONTENT_TYPES[ext] };
  } catch {
    return null;
  }
}
