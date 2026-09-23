import "server-only";
import { cache } from "react";
import { Clinic } from "@/models/Clinic";
import { Doctor } from "@/models/Doctor";
import { Service } from "@/models/Service";
import { SiteSettings, SETTINGS_SINGLETON } from "@/models/SiteSettings";
import { connectDB } from "./db";
import { toClinicDTO, toDoctorDTO, toServiceDTO, toSettingsDTO } from "./dto";
import { buildHomeContent } from "./home-content";
import { SETTINGS_DEFAULTS } from "./settings";
import type { HomeContent } from "./types";

/** Everything the public page renders, read live from MongoDB on each request. */
export const getHomeContent = cache(async (): Promise<HomeContent> => {
  await connectDB();
  const [services, clinics, doctors, settings] = await Promise.all([
    Service.find().lean(),
    Clinic.find().lean(),
    Doctor.find().lean(),
    SiteSettings.findOne({ singleton: SETTINGS_SINGLETON }).lean(),
  ]);

  return buildHomeContent({
    services: services.map(toServiceDTO),
    clinics: clinics.map(toClinicDTO),
    doctors: doctors.map(toDoctorDTO),
    settings: settings ? toSettingsDTO(settings) : { ...SETTINGS_DEFAULTS, updatedAt: null },
  });
});
