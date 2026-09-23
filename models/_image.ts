import { Schema } from "mongoose";

export type ImageStorage = "external" | "local" | "blob";

export interface ImageRef {
  url: string;
  alt: string;
  /** Storage key (blob pathname or local filename); null for external images */
  key: string | null;
  /** Where the file lives. Deletion dispatches on this, not on the current env. */
  storage: ImageStorage;
}

export const ImageSchema = new Schema<ImageRef>(
  {
    url: { type: String, required: true, maxlength: 2048 },
    alt: { type: String, required: true, trim: true, minlength: 3, maxlength: 140 },
    key: { type: String, default: null, maxlength: 256 },
    storage: { type: String, enum: ["external", "local", "blob"], required: true },
  },
  { _id: false },
);
