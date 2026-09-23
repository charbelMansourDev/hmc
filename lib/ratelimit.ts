import "server-only";
import { createHash } from "node:crypto";
import { RateLimit } from "@/models/RateLimit";
import { connectDB } from "./db";

// Fixed-window rate limiting stored in MongoDB, so it holds across all
// serverless instances. Best effort: it slows brute force and spam down,
// it is not a substitute for the platform firewall.

function bucketFor(windowSec: number) {
  const bucket = Math.floor(Date.now() / (windowSec * 1000));
  const expiresAt = new Date((bucket + 1) * windowSec * 1000);
  return { bucket, expiresAt };
}

const retryAfter = (expiresAt: Date) => Math.max(1, Math.ceil((expiresAt.getTime() - Date.now()) / 1000));

/** Current count in this window, without incrementing. */
export async function peekLimit(key: string, windowSec: number): Promise<{ count: number; retryAfter: number }> {
  await connectDB();
  const { bucket, expiresAt } = bucketFor(windowSec);
  const doc = await RateLimit.findOne({ key: `${key}:${bucket}` }).lean();
  return { count: doc?.count ?? 0, retryAfter: retryAfter(expiresAt) };
}

/** Increments and returns whether the caller is still within `limit`. */
export async function hitLimit(
  key: string,
  limit: number,
  windowSec: number,
): Promise<{ allowed: boolean; retryAfter: number }> {
  await connectDB();
  const { bucket, expiresAt } = bucketFor(windowSec);
  const filter = { key: `${key}:${bucket}` };
  const update = { $inc: { count: 1 }, $setOnInsert: { expiresAt } };
  let doc;
  try {
    doc = await RateLimit.findOneAndUpdate(filter, update, { upsert: true, new: true }).lean();
  } catch (err) {
    // Two concurrent first hits can race on the unique key; the retry updates.
    if ((err as { code?: number }).code !== 11000) throw err;
    doc = await RateLimit.findOneAndUpdate(filter, update, { upsert: true, new: true }).lean();
  }
  return { allowed: (doc?.count ?? 0) <= limit, retryAfter: retryAfter(expiresAt) };
}

export async function clearLimit(key: string, windowSec: number): Promise<void> {
  await connectDB();
  const { bucket } = bucketFor(windowSec);
  await RateLimit.deleteOne({ key: `${key}:${bucket}` });
}

/** A salted hash of the client IP, so raw IPs are never stored. */
export function clientKey(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || req.headers.get("x-real-ip") || "unknown";
  return createHash("sha256")
    .update(`${ip}|${process.env.SESSION_SECRET ?? ""}`)
    .digest("hex")
    .slice(0, 32);
}
