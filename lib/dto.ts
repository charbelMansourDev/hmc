import "server-only";
import type { Types } from "mongoose";
import type { ImageRef } from "@/models/_image";
import type { AdminDoc } from "@/models/Admin";
import type { AppointmentRequestDoc } from "@/models/AppointmentRequest";
import type { ClinicDoc } from "@/models/Clinic";
import type { DoctorDoc } from "@/models/Doctor";
import type { ServiceDoc } from "@/models/Service";
import type { SiteSettingsDoc } from "@/models/SiteSettings";
import type {
  AppointmentDTO,
  ClinicDTO,
  DoctorDTO,
  ImageDTO,
  ServiceDTO,
  SettingsDTO,
} from "./types";

// Rule 1: Mongoose documents never leave the data layer. Every read goes
// through .lean() and one of these mappers, which turn ObjectIds into
// strings and Dates into ISO strings.

const id = (value: Types.ObjectId | string): string => String(value);
const iso = (value: Date | null | undefined): string | null => (value ? new Date(value).toISOString() : null);

export function toImageDTO(ref: ImageRef): ImageDTO {
  return { url: ref.url, alt: ref.alt, storage: ref.storage };
}

export function toServiceDTO(doc: ServiceDoc): ServiceDTO {
  return {
    id: id(doc._id),
    slug: doc.slug,
    category: doc.category,
    display: doc.display,
    name: doc.name,
    bookingLabel: doc.bookingLabel ?? null,
    chip: doc.chip ?? null,
    description: doc.description ?? null,
    tags: [...(doc.tags ?? [])],
    image: toImageDTO(doc.image),
    bookAsId: doc.bookAs ? id(doc.bookAs) : null,
    sortOrder: doc.sortOrder,
    updatedAt: iso(doc.updatedAt),
  };
}

export function toClinicDTO(doc: ClinicDoc): ClinicDTO {
  return {
    id: id(doc._id),
    slug: doc.slug,
    name: doc.name,
    chip: doc.chip,
    description: doc.description,
    image: toImageDTO(doc.image),
    serviceId: id(doc.service),
    sortOrder: doc.sortOrder,
    updatedAt: iso(doc.updatedAt),
  };
}

export function toDoctorDTO(doc: DoctorDoc): DoctorDTO {
  return {
    id: id(doc._id),
    slug: doc.slug,
    name: doc.name,
    specialty: doc.specialty,
    bio: doc.bio ?? "",
    photo: doc.photo ? toImageDTO(doc.photo) : null,
    accent: doc.accent,
    sortOrder: doc.sortOrder,
    updatedAt: iso(doc.updatedAt),
  };
}

export function toSettingsDTO(doc: SiteSettingsDoc): SettingsDTO {
  return {
    phone: doc.phone,
    email: doc.email ?? null,
    address: doc.address ?? null,
    openingHours: doc.openingHours ?? null,
    mapQuery: doc.mapQuery,
    updatedAt: iso(doc.updatedAt),
  };
}

export function toAppointmentDTO(doc: AppointmentRequestDoc): AppointmentDTO {
  return {
    id: id(doc._id),
    name: doc.name,
    phone: doc.phone,
    preferredDate: doc.preferredDate,
    serviceId: doc.service ? id(doc.service) : null,
    serviceName: doc.serviceName,
    status: doc.status,
    createdAt: iso(doc.createdAt) ?? new Date(0).toISOString(),
  };
}

export type AdminSession = { adminId: string; username: string };

export function toAdminSession(doc: AdminDoc): AdminSession {
  return { adminId: id(doc._id), username: doc.username };
}
