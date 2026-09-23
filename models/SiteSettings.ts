import { Schema, model, models, type Model, type Types } from "mongoose";

export const SETTINGS_SINGLETON = "site";

export interface SiteSettingsDoc {
  _id: Types.ObjectId;
  /** Constant with a unique index, so an upsert can only ever touch one row. */
  singleton: typeof SETTINGS_SINGLETON;
  phone: string;
  email: string | null;
  address: string | null;
  openingHours: string | null;
  mapQuery: string;
  createdAt: Date;
  updatedAt: Date;
}

const SiteSettingsSchema = new Schema<SiteSettingsDoc>(
  {
    singleton: {
      type: String,
      enum: [SETTINGS_SINGLETON],
      default: SETTINGS_SINGLETON,
      required: true,
      unique: true,
      immutable: true,
    },
    phone: { type: String, required: true, trim: true, maxlength: 30 },
    email: { type: String, default: null, trim: true, maxlength: 120 },
    address: { type: String, default: null, trim: true, maxlength: 160 },
    openingHours: { type: String, default: null, trim: true, maxlength: 80 },
    mapQuery: { type: String, required: true, trim: true, maxlength: 120 },
  },
  { timestamps: true },
);

export const SiteSettings: Model<SiteSettingsDoc> =
  (models.SiteSettings as Model<SiteSettingsDoc> | undefined) ??
  model<SiteSettingsDoc>("SiteSettings", SiteSettingsSchema);
