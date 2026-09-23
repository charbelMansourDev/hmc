import "server-only";
import { seedClinics, seedDoctors, seedServices, seedSettings } from "@/scripts/seed-data";
import { buildHomeContent } from "./home-content";
import type { HomeContent } from "./types";

// Phase 2: the visual port renders the seed content directly (ids = slugs).
// Phase 3 replaces this with the MongoDB-backed data layer.
export async function getHomeContent(): Promise<HomeContent> {
  return buildHomeContent({
    services: seedServices.map((s) => ({
      id: s.slug,
      slug: s.slug,
      category: s.category,
      display: s.display,
      name: s.name,
      bookingLabel: s.bookingLabel,
      chip: s.chip,
      description: s.description,
      tags: s.tags,
      image: { ...s.image, storage: "external" },
      bookAsId: s.bookAs,
      sortOrder: s.sortOrder,
      updatedAt: null,
    })),
    clinics: seedClinics.map((c) => ({
      id: c.slug,
      slug: c.slug,
      name: c.name,
      chip: c.chip,
      description: c.description,
      image: { ...c.image, storage: "external" },
      serviceId: c.service,
      sortOrder: c.sortOrder,
      updatedAt: null,
    })),
    doctors: seedDoctors.map((d) => ({
      id: d.slug,
      slug: d.slug,
      name: d.name,
      specialty: d.specialty,
      bio: d.bio,
      photo: null,
      accent: d.accent,
      sortOrder: d.sortOrder,
      updatedAt: null,
    })),
    settings: { ...seedSettings, updatedAt: null },
  });
}
