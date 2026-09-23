import "server-only";
import { isValidObjectId } from "mongoose";
import { NextResponse } from "next/server";
import type { ZodError, ZodType, ZodTypeDef } from "zod";

export type FieldErrors = Record<string, string>;

/** An error that maps directly to an HTTP response. Thrown by the data layer. */
export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public fields?: FieldErrors,
    public headers?: Record<string, string>,
  ) {
    super(message);
  }
}

export const badRequest = (message = "Invalid request.", fields?: FieldErrors) =>
  new HttpError(400, "invalid_payload", message, fields);
export const unauthorized = () => new HttpError(401, "unauthorized", "Not signed in.");
export const forbidden = () => new HttpError(403, "forbidden", "Cross-origin request rejected.");
export const notFound = (what = "Item") => new HttpError(404, "not_found", `${what} not found.`);
export const conflict = (message: string) => new HttpError(409, "conflict", message);
export const payloadTooLarge = (message = "Request is too large.") =>
  new HttpError(413, "payload_too_large", message);
export const unsupportedMediaType = (message: string) =>
  new HttpError(415, "unsupported_media_type", message);
export const rateLimited = (retryAfter: number, message = "Too many attempts. Please try again later.") =>
  new HttpError(429, "rate_limited", message, undefined, { "Retry-After": String(retryAfter) });

export function errorResponse(err: HttpError): NextResponse {
  return NextResponse.json(
    { error: { code: err.code, message: err.message, ...(err.fields ? { fields: err.fields } : {}) } },
    { status: err.status, headers: err.headers },
  );
}

function isDuplicateKey(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: number }).code === 11000;
}

/** Wraps a route handler: maps HttpError / duplicate keys, hides everything else behind a 500. */
export function withErrors<A extends unknown[]>(handler: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (err) {
      if (err instanceof HttpError) return errorResponse(err);
      if (isDuplicateKey(err)) return errorResponse(conflict("An item with the same key already exists."));
      console.error("[api] unexpected error:", err);
      return errorResponse(new HttpError(500, "server_error", "Something went wrong."));
    }
  };
}

export function zodFields(error: ZodError): FieldErrors {
  const fields: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    if (!(key in fields)) {
      fields[key] = issue.code === "unrecognized_keys" ? `Unknown field(s): ${issue.keys.join(", ")}` : issue.message;
    }
  }
  return fields;
}

export function parseWith<T>(schema: ZodType<T, ZodTypeDef, unknown>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) throw badRequest("Please check the highlighted fields.", zodFields(result.error));
  return result.data;
}

export const MAX_JSON_BYTES = 32 * 1024;

/** Reads and validates a JSON body: 415 if not JSON, 413 if too big, 400 if malformed or invalid. */
export async function readJson<T>(req: Request, schema: ZodType<T, ZodTypeDef, unknown>): Promise<T> {
  const type = req.headers.get("content-type") ?? "";
  if (!type.toLowerCase().startsWith("application/json")) {
    throw unsupportedMediaType("Expected an application/json body.");
  }
  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > MAX_JSON_BYTES) throw payloadTooLarge();

  const text = await req.text();
  if (text.length > MAX_JSON_BYTES) throw payloadTooLarge();

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    throw badRequest("Malformed JSON.");
  }
  return parseWith(schema, body);
}

/** Strict ObjectId check: anything that is not 24 hex chars simply does not exist (404, never a CastError). */
export function isObjectIdString(id: unknown): id is string {
  return typeof id === "string" && /^[a-f\d]{24}$/i.test(id) && isValidObjectId(id);
}

export function assertObjectId(id: unknown, what = "Item"): asserts id is string {
  if (!isObjectIdString(id)) throw notFound(what);
}
