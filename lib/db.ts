import "server-only";
import mongoose from "mongoose";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

// Cached on globalThis so dev hot-reloads and warm serverless invocations
// reuse one connection instead of opening a new pool per request.
const g = globalThis as typeof globalThis & { _mongoose?: MongooseCache };
const cache: MongooseCache = (g._mongoose ??= { conn: null, promise: null });

mongoose.set("strictQuery", true);

export async function connectDB(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");

  cache.promise ??= mongoose.connect(uri, {
    // Fail fast instead of queueing queries while disconnected.
    bufferCommands: false,
    serverSelectionTimeoutMS: 8000,
  });

  try {
    cache.conn = await cache.promise;
  } catch (err) {
    // Clear the failed promise so the next request retries instead of
    // replaying the same rejection forever.
    cache.promise = null;
    throw err;
  }
  return cache.conn;
}
