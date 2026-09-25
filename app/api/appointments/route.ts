import { after, NextResponse, type NextRequest } from "next/server";
import { createAppointment } from "@/lib/appointments";
import { HttpError, rateLimited, readJson, withErrors } from "@/lib/http";
import { sendAppointmentEmail } from "@/lib/mail";
import { bookingWhatsApp } from "@/lib/phone";
import { clientKey, hitLimit } from "@/lib/ratelimit";
import { appointmentInput } from "@/lib/schemas";
import { getSettings } from "@/lib/settings";

export const runtime = "nodejs";

const LIMIT = 5;
const WINDOW_SECONDS = 60 * 60;

// Public: creates an appointment request (name, phone, preferred date, service).
export const POST = withErrors(async (req: NextRequest) => {
  // While Settings sends requests to WhatsApp, the site never posts here;
  // refuse, so nothing (e.g. a bot) can fill the inbox staff aren't watching.
  if (bookingWhatsApp(await getSettings())) {
    throw new HttpError(409, "whatsapp_only", "Appointment requests are taken on WhatsApp.");
  }

  const input = await readJson(req, appointmentInput);

  const limit = await hitLimit(`appt:${clientKey(req)}`, LIMIT, WINDOW_SECONDS);
  if (!limit.allowed) {
    throw rateLimited(limit.retryAfter, "Too many requests from this device. Please call us instead.");
  }

  const appointment = await createAppointment(input);
  // Runs after the response is sent (waitUntil on Vercel); failures are logged only.
  after(() => sendAppointmentEmail(appointment));
  return NextResponse.json({ id: appointment.id }, { status: 201 });
});
