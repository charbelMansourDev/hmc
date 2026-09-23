import "server-only";
import type { ZodType, ZodTypeDef } from "zod";
import { badRequest, parseWith, payloadTooLarge, unsupportedMediaType } from "./http";
import type { ImageExt } from "./storage";

/** 4 MiB: comfortably under Vercel's ~4.5 MB request-body limit. */
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const MAX_MULTIPART_BYTES = MAX_IMAGE_BYTES + 256 * 1024;

export type UploadedImage = { bytes: Uint8Array; ext: ImageExt };

const DECLARED: Record<string, ImageExt> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/** Identifies the real file type from its first bytes; never trusts the client's label. */
function sniff(bytes: Uint8Array): ImageExt | null {
  const b = bytes;
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
  if (
    b.length >= 8 &&
    b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
    b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a
  ) {
    return "png";
  }
  if (
    b.length >= 12 &&
    b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
    b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
  ) {
    return "webp";
  }
  return null;
}

/**
 * Parses a multipart create/update request: `data` is a JSON string validated
 * with `schema`, `image` is an optional file. Returns 415 for non-multipart
 * bodies or non-image files, 413 for oversized ones, 400 for invalid data.
 */
export async function readMultipart<T>(
  req: Request,
  schema: ZodType<T, ZodTypeDef, unknown>,
): Promise<{ data: T; image: UploadedImage | null }> {
  const type = (req.headers.get("content-type") ?? "").toLowerCase();
  if (!type.startsWith("multipart/form-data")) {
    throw unsupportedMediaType("Expected a multipart/form-data body.");
  }
  if (Number(req.headers.get("content-length") ?? 0) > MAX_MULTIPART_BYTES) {
    throw payloadTooLarge("Images must be 4 MB or smaller.");
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    throw badRequest("Malformed form data.");
  }

  const raw = form.get("data");
  if (typeof raw !== "string") throw badRequest("Missing form data.");
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw badRequest("Malformed JSON in form data.");
  }
  const data = parseWith(schema, parsed);

  const file = form.get("image");
  if (file === null || (file instanceof File && file.size === 0)) return { data, image: null };
  if (!(file instanceof File)) throw badRequest("Invalid image field.");

  if (file.size > MAX_IMAGE_BYTES) throw payloadTooLarge("Images must be 4 MB or smaller.");

  const declared = DECLARED[file.type.toLowerCase()];
  if (!declared) throw unsupportedMediaType("Use a JPEG, PNG or WebP image.");

  const bytes = new Uint8Array(await file.arrayBuffer());
  const actual = sniff(bytes);
  if (!actual || actual !== declared) {
    throw unsupportedMediaType("The file is not a valid JPEG, PNG or WebP image.");
  }
  return { data, image: { bytes, ext: actual } };
}
