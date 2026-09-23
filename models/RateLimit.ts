import { Schema, model, models, type Model, type Types } from "mongoose";

// Fixed-window counters shared by every serverless instance (in-memory
// counters would not be, on Vercel). Documents expire via the TTL index.
export interface RateLimitDoc {
  _id: Types.ObjectId;
  key: string;
  count: number;
  expiresAt: Date;
}

const RateLimitSchema = new Schema<RateLimitDoc>({
  key: { type: String, required: true, unique: true, maxlength: 200 },
  count: { type: Number, required: true, default: 0 },
  expiresAt: { type: Date, required: true },
});

RateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RateLimit: Model<RateLimitDoc> =
  (models.RateLimit as Model<RateLimitDoc> | undefined) ?? model<RateLimitDoc>("RateLimit", RateLimitSchema);
