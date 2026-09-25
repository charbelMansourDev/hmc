# Hajj Medical Center

The clinic's public website plus a small CMS, built with Next.js 15 (App Router)
and MongoDB. Staff sign in at `/admin` to edit services, clinics, the team and
site settings, and to review appointment requests submitted from the site.

## Stack

- **Next.js 15.5** (App Router) · **React 19** · **TypeScript 5.9** · **Node 22**
- **MongoDB** via **Mongoose 8**
- **Tailwind CSS 4** (admin UI); the public site ports the original hand-written CSS
- **jose** (JWT sessions) · **bcryptjs** (password hashing)
- **Vercel Blob** for uploaded images (falls back to local disk in development)
- **nodemailer** for optional appointment-notification email

## Local development

```bash
nvm use                 # Node 22 (see .nvmrc)
npm ci
cp .env.example .env.local   # then fill in the values below
npm run seed            # populate the database + create the admin
npm run dev             # http://localhost:3000
```

In development, uploaded images are written to `./uploads/` and served by
`GET /api/media/<uuid>.<ext>` — nothing is written to `public/`.

## Environment variables

Set these in `.env.local` for local work, and in **Vercel → Settings →
Environment Variables** for deployment. `.env.example` lists the names.

| Variable | Required | Read by | Notes |
|---|---|---|---|
| `MONGODB_URI` | **yes** (runtime) | app + seed | Atlas connection string. **Use separate dev and prod databases.** |
| `SESSION_SECRET` | **yes** (runtime) | app | 32+ chars (`openssl rand -base64 48`). Signs admin JWTs and salts the rate-limit IP hash. Keep it **stable** — changing it logs every admin out. |
| `ADMIN_USERNAME` | **yes** (seed) | seed only | The admin login. Only the seed script reads this, not the running app. |
| `ADMIN_PASSWORD` | **yes** (seed) | seed only | 12+ chars. Only the seed script reads this. |
| `APP_URL` | optional | app | Public URL, e.g. `https://…`. Used **only** in the appointment-notification email link. |
| `BLOB_READ_WRITE_TOKEN` | for uploads | app | Enables Vercel Blob. **Required to upload images in the CMS on Vercel** (the filesystem there is read-only). Auto-added when you create a Blob store. |
| `MAPBOX_TOKEN` | optional | app | Public Mapbox token (`pk.…`) for the "Visit us" map (dark "night" style in dark mode). Read at request time; secret `sk.…` tokens are ignored. Restrict it to your site URLs in the Mapbox dashboard. Without it, a Google map is shown. |
| `SMTP_HOST` `SMTP_PORT` `SMTP_USER` `SMTP_PASS` `SMTP_FROM` | optional | app | Appointment-notification email. If any is missing, email is silently disabled (requests are still saved). |
| `APPOINTMENT_NOTIFY_TO` | optional | app | Recipient of appointment notifications. |
| `MAIL_TRANSPORT=json` | dev only | app | Logs the email to the server console instead of sending it. Ignored in production. |

The only variables the **deployed app** needs to run are `MONGODB_URI` and
`SESSION_SECRET`. Everything else is either seed-time (`ADMIN_*`) or optional and
can be added later — but **Vercel bakes env vars at deploy time, so redeploy
after changing any of them.**

## Seeding

`npm run seed` populates services, clinics, team and settings, and creates the
single admin account. It is **idempotent**: every item is upserted on a natural
key with `$setOnInsert`, so re-running never overwrites content edited in the
CMS, and a seed-version marker stops a re-run from resurrecting items you deleted
in the CMS. A second run should insert nothing.

```bash
npm run seed                              # content (first run) + admin
npm run seed -- --admin-only              # admin account only
npm run seed -- --content                 # re-apply seed content (still never overwrites)
npm run seed -- --reset-admin-password    # set admin password from env, log out sessions
```

The CMS supports **exactly one admin**; the seed refuses to create a second.

> Run the seed from a machine that can reach the database directly (e.g. your
> laptop) — it connects to MongoDB over the raw wire protocol, so it cannot run
> from Vercel or from a proxied/HTTPS-only network.

## Deploying to Vercel

1. **MongoDB Atlas**
   - Create a cluster and a database user (strong password).
   - **Network access:** Vercel's function IPs are dynamic, so allow
     `0.0.0.0/0` (safe over Atlas's enforced TLS with a strong password) or use
     the Atlas ↔ Vercel integration / PrivateLink.
   - Copy the `mongodb+srv://…` connection string. **Keep dev and prod on
     separate databases.**
2. **Import the repo into Vercel.** Next.js is auto-detected; Node 22 is picked
   up from `engines` / `.nvmrc`. No build configuration is needed.
3. **Create a Vercel Blob store** (project → Storage). This adds
   `BLOB_READ_WRITE_TOKEN` automatically — required for CMS image uploads.
4. **Set environment variables** (Production): `MONGODB_URI`, `SESSION_SECRET`,
   `APP_URL`, and any SMTP values. (`ADMIN_*` are only needed wherever you run
   the seed.)
5. **Seed the Atlas database** from your machine with the Atlas `MONGODB_URI`.
6. **Deploy.** Remember to redeploy after any later env-var change.

**Tip:** set the Vercel function region close to your Atlas cluster's region to
reduce database latency.

## How it fits together

- `app/(site)/` — the public site (server components with small client islands
  for the header, booking and reveal animations).
- `app/admin/` — the CMS (login, dashboard, services/clinics/team/settings,
  appointments). Every page is dynamic and calls the admin guard first.
- `app/api/` — public endpoints (`appointments`, `media`) and guarded admin
  endpoints.
- `lib/` — the data layer (all `server-only`): DB connection, validation
  (zod), DTO mappers, storage, auth (jose), rate limiting, mail.
- `models/` — Mongoose schemas.
- `middleware.ts` — redirects unauthenticated visitors away from `/admin`
  (a UX convenience; the real authorization check runs inside every page and
  route handler).

## Security notes

- `/admin` is `noindex`; security headers are set in `next.config.ts`.
- Admin sessions are httpOnly JWT cookies scoped to an `admin` audience;
  logging out bumps a token version that invalidates any copied token.
- Login and appointment endpoints are rate limited (stored in MongoDB).
- Appointment requests hold only name, phone, preferred date and service — no
  free-text or clinical fields — and are deleted automatically 90 days after
  submission (TTL index).
