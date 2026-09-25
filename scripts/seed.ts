// Idempotent seed. Usage:
//   npm run seed                          content (first run only) + admin account
//   npm run seed -- --admin-only          admin account only
//   npm run seed -- --content             re-apply seed content even if already seeded
//                                         (still never overwrites existing items)
//   npm run seed -- --reset-admin-password  set the admin password from env, log out sessions
//
// Everything is upserted on a natural key (slug / singleton / username) with
// $setOnInsert, so re-running never overwrites content edited in the CMS.
// A seed-version marker stops a re-run from resurrecting items deleted in the CMS.
// NB: this file must not import anything that imports "server-only".
import "./load-env";
import bcrypt from "bcryptjs";
import mongoose, { type Model } from "mongoose";
import { Admin } from "../models/Admin";
import { AppointmentRequest } from "../models/AppointmentRequest";
import { Clinic } from "../models/Clinic";
import { Doctor } from "../models/Doctor";
import { Meta } from "../models/Meta";
import { RateLimit } from "../models/RateLimit";
import { Service } from "../models/Service";
import { SETTINGS_SINGLETON, SiteSettings } from "../models/SiteSettings";
import { settingsSchema } from "../lib/schemas";
import { SEED_VERSION, seedClinics, seedDoctors, seedServices, seedSettings } from "./seed-data";

const args = new Set(process.argv.slice(2));
const ADMIN_ONLY = args.has("--admin-only");
const FORCE_CONTENT = args.has("--content");
const RESET_PASSWORD = args.has("--reset-admin-password");

function fail(message: string): never {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

type Counts = { inserted: number; existing: number };
const summary: Record<string, Counts> = {};

async function upsertAll<T extends { slug: string }>(
  label: string,
  model: Model<never>,
  docs: T[],
): Promise<void> {
  // Validate every seed document with the Mongoose schema first; bulkWrite does not.
  for (const doc of docs) {
    const err = new (model as unknown as Model<T>)(doc).validateSync();
    if (err) fail(`${label} "${doc.slug}" is invalid: ${err.message}`);
  }
  const res = await (model as unknown as Model<T>).bulkWrite(
    docs.map((doc) => ({
      updateOne: {
        filter: { slug: doc.slug },
        update: { $setOnInsert: doc },
        upsert: true,
      },
    })) as never,
  );
  summary[label] = { inserted: res.upsertedCount, existing: docs.length - res.upsertedCount };
}

async function seedContent() {
  const external = (img: { url: string; alt: string }) => ({ ...img, key: null, storage: "external" as const });

  // Pass 1: bookable services. Pass 2: cross-link cards, which need their target's _id.
  const bookable = seedServices.filter((s) => !s.bookAs);
  const links = seedServices.filter((s) => s.bookAs);
  const toDoc = (s: (typeof seedServices)[number], bookAs: mongoose.Types.ObjectId | null) => ({
    slug: s.slug,
    category: s.category,
    display: s.display,
    name: s.name,
    bookingLabel: s.bookingLabel,
    chip: s.chip,
    description: s.description,
    tags: s.tags,
    image: external(s.image),
    bookAs,
    sortOrder: s.sortOrder,
  });

  await upsertAll("services", Service as never, bookable.map((s) => toDoc(s, null)));

  const idBySlug = new Map(
    (await Service.find({}, { slug: 1 }).lean()).map((d) => [d.slug, d._id as mongoose.Types.ObjectId]),
  );
  const resolve = (slug: string) => idBySlug.get(slug) ?? fail(`Seed references unknown service "${slug}"`);

  await upsertAll("service links", Service as never, links.map((s) => toDoc(s, resolve(s.bookAs!))));

  await upsertAll(
    "clinics",
    Clinic as never,
    seedClinics.map((c) => ({
      slug: c.slug,
      name: c.name,
      chip: c.chip,
      description: c.description,
      image: external(c.image),
      service: resolve(c.service),
      sortOrder: c.sortOrder,
    })),
  );

  await upsertAll(
    "team",
    Doctor as never,
    seedDoctors.map((d) => ({ ...d, photo: null })),
  );

  // Singleton: $setOnInsert only, so existing CMS values are never overwritten.
  const settingsCheck = settingsSchema.safeParse(seedSettings);
  if (!settingsCheck.success) fail(`settings are invalid: ${settingsCheck.error.message}`);
  const settingsError = new SiteSettings({ singleton: SETTINGS_SINGLETON, ...seedSettings }).validateSync();
  if (settingsError) fail(`settings are invalid: ${settingsError.message}`);
  const settings = await SiteSettings.updateOne(
    { singleton: SETTINGS_SINGLETON },
    { $setOnInsert: { singleton: SETTINGS_SINGLETON, ...seedSettings } },
    { upsert: true },
  );
  summary.settings = { inserted: settings.upsertedCount, existing: 1 - settings.upsertedCount };
}

async function seedAdmin() {
  const username = process.env.ADMIN_USERNAME?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!username) fail("ADMIN_USERNAME is not set (in .env.local).");
  if (!password || password.length < 12) fail("ADMIN_PASSWORD must be at least 12 characters.");

  const others = await Admin.countDocuments({ username: { $ne: username } });
  if (others > 0) fail("Another admin account already exists. This CMS supports exactly one admin.");

  const passwordHash = await bcrypt.hash(password, 12);
  if (RESET_PASSWORD) {
    const res = await Admin.updateOne(
      { username },
      { $set: { passwordHash }, $inc: { tokenVersion: 1 }, $setOnInsert: { role: "admin" } },
      { upsert: true },
    );
    summary.admin = { inserted: res.upsertedCount, existing: 1 - res.upsertedCount };
    console.log("  admin password reset; existing sessions logged out");
  } else {
    const res = await Admin.updateOne(
      { username },
      { $setOnInsert: { username, passwordHash, role: "admin", tokenVersion: 0 } },
      { upsert: true },
    );
    summary.admin = { inserted: res.upsertedCount, existing: 1 - res.upsertedCount };
  }
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) fail("MONGODB_URI is not set (in .env.local).");

  await mongoose.connect(uri, { bufferCommands: false, serverSelectionTimeoutMS: 10_000 });
  console.log(`Connected to database "${mongoose.connection.name}"`);

  // Build indexes (unique slugs, singleton, username, TTLs) before writing.
  for (const model of [Service, Clinic, Doctor, SiteSettings, AppointmentRequest, Admin, RateLimit, Meta]) {
    await (model as Model<unknown>).init();
  }

  if (!ADMIN_ONLY) {
    const marker = await Meta.findOne({ key: "seed" }).lean();
    if (marker && marker.seedVersion >= SEED_VERSION && !FORCE_CONTENT) {
      console.log(`  content already seeded (v${marker.seedVersion}); skipping. Use --content to re-apply.`);
    } else {
      await seedContent();
      await Meta.updateOne(
        { key: "seed" },
        { $set: { seedVersion: SEED_VERSION, seededAt: new Date() } },
        { upsert: true },
      );
    }
  }
  await seedAdmin();

  console.log("\nSeed summary (inserted / already present):");
  for (const [label, c] of Object.entries(summary)) {
    console.log(`  ${label.padEnd(14)} ${String(c.inserted).padStart(3)} / ${c.existing}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
