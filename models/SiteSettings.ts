import { Schema, model, models, type Model, type Types } from "mongoose";
import { BOOKING_CHANNELS, MAX_GOOGLE_PLACES, type BookingChannel } from "../lib/categories";

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
  /** Where booking requests go. Missing on documents written before it existed (read as "whatsapp"). */
  bookingChannel?: BookingChannel;
  /** WhatsApp number in international format; null means "use the phone number". */
  whatsapp?: string | null;
  /** Google Place IDs whose reviews the site shows (the only Places data we may store). */
  googlePlaceIds?: string[];
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
    bookingChannel: { type: String, enum: BOOKING_CHANNELS, default: "whatsapp" },
    whatsapp: { type: String, default: null, trim: true, maxlength: 24 },
    googlePlaceIds: {
      type: [{ type: String, trim: true, maxlength: 256 }],
      default: [],
      validate: {
        validator: (ids: string[]) => ids.length <= MAX_GOOGLE_PLACES,
        message: `At most ${MAX_GOOGLE_PLACES} Google places.`,
      },
    },
  },
  { timestamps: true },
);

export const SiteSettings: Model<SiteSettingsDoc> =
  (models.SiteSettings as Model<SiteSettingsDoc> | undefined) ??
  model<SiteSettingsDoc>("SiteSettings", SiteSettingsSchema);
