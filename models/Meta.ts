import { Schema, model, models, type Model, type Types } from "mongoose";

// Bookkeeping for the seed script: records which seed version has run, so a
// re-seed does not resurrect content deleted in the CMS.
export interface MetaDoc {
  _id: Types.ObjectId;
  key: string;
  seedVersion: number;
  seededAt: Date;
}

const MetaSchema = new Schema<MetaDoc>({
  key: { type: String, required: true, unique: true },
  seedVersion: { type: Number, required: true },
  seededAt: { type: Date, required: true },
});

export const Meta: Model<MetaDoc> =
  (models.Meta as Model<MetaDoc> | undefined) ?? model<MetaDoc>("Meta", MetaSchema);
