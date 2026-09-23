import { Schema, model, models, type Model, type Types } from "mongoose";
import { APPOINTMENT_RETENTION_DAYS, APPOINTMENT_STATUSES, type AppointmentStatus } from "../lib/categories";

// Deliberately minimal: name, phone, preferred date and service only.
// Do NOT add symptoms, conditions or any free-text field (see the build spec).
export interface AppointmentRequestDoc {
  _id: Types.ObjectId;
  name: string;
  phone: string;
  /** YYYY-MM-DD, stored as a string so it never drifts across time zones */
  preferredDate: string;
  service: Types.ObjectId | null;
  /** Snapshot of the booking label, so history survives renames and deletes */
  serviceName: string;
  status: AppointmentStatus;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentRequestSchema = new Schema<AppointmentRequestDoc>(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    phone: { type: String, required: true, trim: true, maxlength: 24 },
    preferredDate: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    service: { type: Schema.Types.ObjectId, ref: "Service", default: null },
    serviceName: { type: String, required: true, trim: true, maxlength: 80 },
    status: { type: String, enum: APPOINTMENT_STATUSES, required: true, default: "new" },
  },
  { timestamps: true, strict: "throw" },
);

// Retention: MongoDB deletes each request this long after it was submitted.
AppointmentRequestSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: APPOINTMENT_RETENTION_DAYS * 24 * 60 * 60 },
);
AppointmentRequestSchema.index({ status: 1, createdAt: -1 });

export const AppointmentRequest: Model<AppointmentRequestDoc> =
  (models.AppointmentRequest as Model<AppointmentRequestDoc> | undefined) ??
  model<AppointmentRequestDoc>("AppointmentRequest", AppointmentRequestSchema);
