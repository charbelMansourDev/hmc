// Plain DTOs: the only shapes that cross from the data layer into components.
// Every id is a string; every date is an ISO string. No Mongoose types here.
import type { Accent, AppointmentStatus, Category, ServiceDisplay } from "./categories";

export type ImageStorage = "external" | "local" | "blob";

export type ImageDTO = {
  url: string;
  alt: string;
  storage: ImageStorage;
};

export type ServiceDTO = {
  id: string;
  slug: string;
  category: Category;
  display: ServiceDisplay;
  name: string;
  bookingLabel: string | null;
  chip: string | null;
  description: string | null;
  tags: string[];
  image: ImageDTO;
  bookAsId: string | null;
  sortOrder: number;
  updatedAt: string | null;
};

export type ClinicDTO = {
  id: string;
  slug: string;
  name: string;
  chip: string;
  description: string;
  image: ImageDTO;
  serviceId: string;
  sortOrder: number;
  updatedAt: string | null;
};

export type DoctorDTO = {
  id: string;
  slug: string;
  name: string;
  specialty: string;
  bio: string;
  photo: ImageDTO | null;
  accent: Accent;
  sortOrder: number;
  updatedAt: string | null;
};

export type SettingsDTO = {
  phone: string;
  email: string | null;
  address: string | null;
  openingHours: string | null;
  mapQuery: string;
  updatedAt: string | null;
};

export type AppointmentDTO = {
  id: string;
  name: string;
  phone: string;
  preferredDate: string;
  serviceId: string | null;
  serviceName: string;
  status: AppointmentStatus;
  createdAt: string;
};

export type BookingOption = { id: string; label: string };
export type BookingGroup = { label: string; options: BookingOption[] };

/** A card or feature on the public page, with the service id it books. */
export type PublicServiceItem = ServiceDTO & { bookingId: string };
export type PublicClinicItem = ClinicDTO & { bookingId: string };

export type HomeSection = {
  category: Category;
  heading: string;
  lede: string | null;
  anchor: string;
  wide: boolean;
  cards: PublicServiceItem[];
  features: PublicServiceItem[];
};

export type NavLink = { href: string; label: string };

export type HomeContent = {
  settings: SettingsDTO;
  sections: HomeSection[];
  clinics: PublicClinicItem[];
  doctors: DoctorDTO[];
  bookingGroups: BookingGroup[];
  specialistCount: number;
  nav: NavLink[];
};
