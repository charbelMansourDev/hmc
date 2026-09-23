import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import type { AppointmentDTO } from "./types";

// Optional appointment notifications. Disabled unless SMTP_HOST, SMTP_PORT,
// SMTP_USER, SMTP_PASS and APPOINTMENT_NOTIFY_TO are all set.
// MAIL_TRANSPORT=json (development only) renders the message to the server
// log instead of sending it, so the content can be checked without SMTP.

const g = globalThis as typeof globalThis & { _mailer?: Transporter };
let warned = false;

function transport(): Transporter | null {
  if (process.env.MAIL_TRANSPORT === "json" && process.env.NODE_ENV !== "production") {
    return (g._mailer ??= nodemailer.createTransport({ jsonTransport: true }));
  }
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !process.env.APPOINTMENT_NOTIFY_TO) {
    return null;
  }
  const port = Number(SMTP_PORT);
  return (g._mailer ??= nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  }));
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function formatDate(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

export async function sendAppointmentEmail(appointment: AppointmentDTO): Promise<void> {
  const mailer = transport();
  if (!mailer) {
    if (!warned) console.info("[mail] appointment notifications disabled (SMTP not configured)");
    warned = true;
    return;
  }

  const appUrl = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const link = `${appUrl}/admin/appointments`;
  const received = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Beirut",
  }).format(new Date(appointment.createdAt));

  const rows: [string, string][] = [
    ["Service", appointment.serviceName],
    ["Preferred date", formatDate(appointment.preferredDate)],
    ["Name", appointment.name],
    ["Phone", appointment.phone],
    ["Received", `${received} (Beirut)`],
  ];

  const text = [
    "A new appointment request was submitted on the website.",
    "",
    ...rows.map(([k, v]) => `${k}: ${v}`),
    "",
    `Open the CMS: ${link}`,
    "",
    "Please call the patient back to confirm. Do not reply with medical information.",
  ].join("\n");

  const html = `<p>A new appointment request was submitted on the website.</p>
<table cellpadding="4">${rows
    .map(([k, v]) =>
      k === "Phone"
        ? `<tr><td><strong>${k}</strong></td><td><a href="tel:${escapeHtml(v.replace(/[^\d+]/g, ""))}">${escapeHtml(v)}</a></td></tr>`
        : `<tr><td><strong>${k}</strong></td><td>${escapeHtml(v)}</td></tr>`,
    )
    .join("")}</table>
<p><a href="${escapeHtml(link)}">Open the CMS</a></p>
<p style="color:#6a7885">Please call the patient back to confirm. Do not reply with medical information.</p>`;

  try {
    const info = await mailer.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER || "website@localhost",
      to: process.env.APPOINTMENT_NOTIFY_TO || "clinic@localhost",
      // Generic subject: no personal or health-related detail on lock screens.
      subject: "New appointment request",
      text,
      html,
    });
    if (process.env.MAIL_TRANSPORT === "json") console.info("[mail] json transport:", info.message);
  } catch (err) {
    // Never fails the request, and never logs personal data.
    console.error(`[mail] could not send notification for appointment ${appointment.id}:`, (err as Error).message);
  }
}
