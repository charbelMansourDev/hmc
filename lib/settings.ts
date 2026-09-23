import "server-only";
import { SETTINGS_SINGLETON, SiteSettings, type SiteSettingsDoc } from "@/models/SiteSettings";
import { connectDB } from "./db";
import { toSettingsDTO } from "./dto";
import { parseWith } from "./http";
import { settingsBase, type SettingsInput, type SettingsUpdateInput } from "./schemas";
import type { SettingsDTO } from "./types";

export const SETTINGS_DEFAULTS: SettingsInput = {
  phone: "+961 4 520 065",
  email: null,
  address: null,
  openingHours: null,
  mapQuery: "Naccache, Lebanon",
};

function pickSettings(doc: SiteSettingsDoc): SettingsInput {
  return {
    phone: doc.phone,
    email: doc.email ?? null,
    address: doc.address ?? null,
    openingHours: doc.openingHours ?? null,
    mapQuery: doc.mapQuery,
  };
}

export async function getSettings(): Promise<SettingsDTO> {
  await connectDB();
  const doc = await SiteSettings.findOne({ singleton: SETTINGS_SINGLETON }).lean();
  return doc ? toSettingsDTO(doc) : { ...SETTINGS_DEFAULTS, updatedAt: null };
}

/**
 * Rule 8: with upsert, Mongoose validates the update as if inserting, so a
 * $set carrying only some required fields fails. Read the current values,
 * merge the patch, validate the whole thing, and write the whole document.
 * The constant `singleton` key (unique index) means only one row can exist.
 */
export async function updateSettings(patch: SettingsUpdateInput): Promise<SettingsDTO> {
  await connectDB();
  const current = await SiteSettings.findOne({ singleton: SETTINGS_SINGLETON }).lean();
  const merged = parseWith(settingsBase, {
    ...SETTINGS_DEFAULTS,
    ...(current ? pickSettings(current) : {}),
    ...patch,
  });

  const write = () =>
    SiteSettings.findOneAndUpdate(
      { singleton: SETTINGS_SINGLETON },
      { $set: merged },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
    ).lean();

  let doc;
  try {
    doc = await write();
  } catch (err) {
    // Two first-ever writes racing on the unique singleton key: retry as an update.
    if ((err as { code?: number }).code !== 11000) throw err;
    doc = await write();
  }
  if (!doc) throw new Error("Settings write returned no document");
  return toSettingsDTO(doc);
}
