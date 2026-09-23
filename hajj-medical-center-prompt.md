# Build prompt — Hajj Medical Center

I have an existing static HTML site for **Hajj Medical Center**. I want it rebuilt
as a dynamic Next.js application with a real backend and a CMS, so staff can
update content without a developer or a redeploy.

Read my existing HTML/CSS first and preserve the visual design — this is a port,
not a redesign. Ask me before changing any layout or copy.

## Stack — use these exact versions

| | |
|---|---|
| Runtime | Node 22 (`.nvmrc` + `"engines": { "node": "22.x" }` — Vercel reads `engines`, **not** `.nvmrc`) |
| Framework | Next.js 15.5.25, App Router, TypeScript 5 |
| Styling | Tailwind CSS v4 (`@import "tailwindcss"` + `@theme`, **no** `tailwind.config.js`) |
| Database | MongoDB Atlas + Mongoose 8 |
| Auth | `jose` 6 (JWT in an httpOnly cookie) + `bcryptjs` 3 |
| Validation | `zod` 3 |
| Email | `nodemailer` 10 |
| File uploads | `@vercel/blob` 2 in production, local disk in dev |
| Seeding | `tsx` + `dotenv` |
| Hosting | Vercel |

## Architecture rules — these are not negotiable

These come from a production build; each one cost real debugging time.

1. **DTO boundary.** No Mongoose document ever reaches a Client Component.
   `.lean()` is not enough — `_id` stays a bson ObjectId and React throws
   "Only plain objects can be passed to Client Components". Map every document
   to a plain DTO (`id: string`) in a `lib/*.ts` data layer marked
   `import 'server-only'`.

2. **Never write uploads to `public/`.** Next indexes the public folder once at
   boot in production and caches negative lookups, so a file written there after
   startup 404s under `next build && next start` until the server restarts —
   while working perfectly in `next dev`. Write to Vercel Blob when
   `BLOB_READ_WRITE_TOKEN` is set, otherwise to `./uploads` served by a
   `GET /api/media/[...path]` route handler. One function, backend chosen by env,
   so local dev needs no cloud credentials.

3. **Middleware is not an authorization boundary.** Use it only for redirect UX
   (cf. CVE-2025-29927). The decision that matters is a `requireAdmin()` /
   `requireAdminApi()` helper called inside every protected page and mutating
   route handler, next to the data. Middleware `matcher` values must be static
   literals — a computed array is silently ignored.

4. **Role-scope every JWT.** If staff and any other audience share one
   `SESSION_SECRET`, one token type will satisfy the other's check — a full
   privilege escalation. Use separate cookie names, set `aud` to the role and
   pass `audience` to `jwtVerify`, and re-check a `role` claim. Test it: send a
   low-privilege cookie at an admin endpoint and assert 401.

5. **Cache the Mongoose connection on `globalThis`** with `bufferCommands: false`,
   and clear the cached promise on failure so the next request retries instead of
   replaying the same error forever.

6. **`export const dynamic = 'force-dynamic'`** on every page that reads the
   database, so CMS edits appear on the next page load with no rebuild.

7. **Idempotent seed script.** Upsert on a natural key so re-seeding never
   destroys content edited through the CMS. Use `$setOnInsert` for anything the
   CMS owns after first run. `tsx` does not read `.env.local` — load it explicitly
   with `dotenv`.

8. **Singleton content documents** (site-wide settings, hero copy, opening hours):
   give the schema a constant `singleton` field with a unique index so an upsert
   can only ever touch one row. **Gotcha:** with `upsert: true`, Mongoose runs
   update validators as though inserting, so a `$set` carrying only some required
   fields fails validation. Read the current value, merge, and write the whole
   document.

9. **`outputFileTracingRoot: path.resolve(process.cwd())`** in `next.config.ts` if
   a stray lockfile in a parent directory makes Next infer the wrong workspace root.

10. **Validate on the server, always.** Zod-parse every request body. Business
    rules live in the data layer, not only in the UI. Guard ObjectId strings with
    `isValidObjectId` before querying, or an invalid id throws a CastError (500)
    instead of simply not matching (404).

## What to build

**Public site** — port my existing pages, rendering live content from MongoDB.

**CMS at `/admin`** — username + password, bcrypt-hashed, seeded from env, one
admin account. Manage:

- **Services** — name, description, category, image, sort order
- **Doctors / staff** — name, specialty, photo, short bio, sort order
- **Departments or clinics** — if my HTML has them
- **Opening hours** and **contact details** (singleton)
- **Announcements / news** — optional, if my HTML has a news section

Full create / edit / delete with image upload for anything that has a photo.

**Appointment requests** — a public form writing to MongoDB, listed in the CMS.
Collect **name, phone, preferred date, and which service** only.

> Do not build a field for symptoms, conditions, or any clinical detail. Storing
> health information raises legal duties I have not scoped, and it is not needed
> to book a call-back. If I ask for one later, tell me what that implies before
> building it.

## Do not build

No payments. No patient accounts or portal. No medical records. No public
listing of appointment requests. Ask me before adding anything outside the list
above.

## How I want you to work

- Plan first and show me the plan before writing code.
- Verify as you go: typecheck, lint, production build, and exercise each API
  route with real requests — including the failure cases (unauthenticated,
  invalid payload, bad id, oversized upload).
- Tell me plainly when something is not verified rather than implying it works.
- `.gitignore` must exclude `.env.local` and the uploads directory. Audit the
  staged diff for credentials before the first commit.
