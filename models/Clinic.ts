import { Schema, model, models, type Model, type Types } from "mongoose";
import { ImageSchema, type ImageRef } from "./_image";

export interface ClinicDoc {
  _id: Types.ObjectId;
  slug: string;
  name: string;
  chip: string;
  description: string;
  image: ImageRef;
  /** The bookable service this clinic's card preselects */
  service: Types.ObjectId;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const ClinicSchema = new Schema<ClinicDoc>(
  {
    slug: { type: String, required: true, unique: true, immutable: true, trim: true, maxlength: 120 },
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    chip: { type: String, required: true, trim: true, maxlength: 24 },
    description: { type: String, required: true, trim: true, maxlength: 200 },
    image: { type: ImageSchema, required: true },
    service: { type: Schema.Types.ObjectId, ref: "Service", required: true },
    sortOrder: { type: Number, required: true, default: 0, min: 0, max: 9999 },
  },
  { timestamps: true },
);

ClinicSchema.index({ sortOrder: 1 });
ClinicSchema.index({ service: 1 });

export const Clinic: Model<ClinicDoc> =
  (models.Clinic as Model<ClinicDoc> | undefined) ?? model<ClinicDoc>("Clinic", ClinicSchema);
