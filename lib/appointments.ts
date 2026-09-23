import "server-only";
import { AppointmentRequest } from "@/models/AppointmentRequest";
import { Service } from "@/models/Service";
import { BOOKING_DAYS, type AppointmentStatus } from "./categories";
import { connectDB } from "./db";
import { toAppointmentDTO } from "./dto";
import { assertObjectId, badRequest, notFound } from "./http";
import type { AppointmentInput } from "./schemas";
import type { AppointmentDTO } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;
export const APPOINTMENTS_PAGE_SIZE = 25;

/** Day number (UTC) for a real YYYY-MM-DD calendar date, or null. */
function dayNumber(value: string): number | null {
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return null;
  return date.getTime() / DAY_MS;
}

export async function createAppointment(input: AppointmentInput): Promise<AppointmentDTO> {
  // Honeypot: only bots fill the hidden "website" field.
  if (input.website) throw badRequest("Invalid request.");

  // Same window the form offers (today + 13 days), with a day of slack either
  // side so visitors in other time zones are not rejected.
  const day = dayNumber(input.preferredDate);
  const today = Math.floor(Date.now() / DAY_MS);
  if (day === null || day < today - 1 || day > today + BOOKING_DAYS) {
    throw badRequest("Please check the highlighted fields.", {
      preferredDate: "Pick a date from the list.",
    });
  }

  await connectDB();
  const service = await Service.findById(input.serviceId).lean();
  if (!service || service.bookAs) {
    throw badRequest("Please check the highlighted fields.", { serviceId: "Choose a service from the list." });
  }

  const doc = await AppointmentRequest.create({
    name: input.name,
    phone: input.phone,
    preferredDate: input.preferredDate,
    service: service._id,
    serviceName: service.bookingLabel ?? service.name,
  });
  return toAppointmentDTO(doc.toObject());
}

export async function listAppointments(query: { status?: AppointmentStatus; page: number }) {
  await connectDB();
  const filter = query.status ? { status: query.status } : {};
  const [total, docs] = await Promise.all([
    AppointmentRequest.countDocuments(filter),
    AppointmentRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip((query.page - 1) * APPOINTMENTS_PAGE_SIZE)
      .limit(APPOINTMENTS_PAGE_SIZE)
      .lean(),
  ]);
  return {
    items: docs.map(toAppointmentDTO),
    total,
    page: query.page,
    pages: Math.max(1, Math.ceil(total / APPOINTMENTS_PAGE_SIZE)),
  };
}

export async function countAppointmentsByStatus(): Promise<Record<AppointmentStatus, number>> {
  await connectDB();
  const rows = await AppointmentRequest.aggregate<{ _id: AppointmentStatus; n: number }>([
    { $group: { _id: "$status", n: { $sum: 1 } } },
  ]);
  const counts: Record<AppointmentStatus, number> = { new: 0, contacted: 0, closed: 0 };
  for (const row of rows) counts[row._id] = row.n;
  return counts;
}

export async function getAppointment(id: string): Promise<AppointmentDTO> {
  assertObjectId(id, "Appointment request");
  await connectDB();
  const doc = await AppointmentRequest.findById(id).lean();
  if (!doc) throw notFound("Appointment request");
  return toAppointmentDTO(doc);
}

export async function setAppointmentStatus(id: string, status: AppointmentStatus): Promise<AppointmentDTO> {
  assertObjectId(id, "Appointment request");
  await connectDB();
  const doc = await AppointmentRequest.findByIdAndUpdate(
    id,
    { $set: { status } },
    { new: true, runValidators: true },
  ).lean();
  if (!doc) throw notFound("Appointment request");
  return toAppointmentDTO(doc);
}

export async function deleteAppointment(id: string): Promise<void> {
  assertObjectId(id, "Appointment request");
  await connectDB();
  const doc = await AppointmentRequest.findByIdAndDelete(id).lean();
  if (!doc) throw notFound("Appointment request");
}
