// The dates the booking form offers. Shared by the form (client) and the
// appointments API (server), so the two can never disagree.
import { BOOKING_DAYS, CLOSED_WEEKDAYS } from "./categories";

const DAY_MS = 24 * 60 * 60 * 1000;
const pad = (n: number) => String(n).padStart(2, "0");

/** A day in the visitor's own calendar; `offset` counts days from today (0 = today). */
export type BookingDate = { value: string; date: Date; offset: number };

/** Today and the next BOOKING_DAYS - 1 days, minus the days the clinic is closed. */
export function upcomingBookingDates(now: Date = new Date()): BookingDate[] {
  const dates: BookingDate[] = [];
  for (let offset = 0; offset < BOOKING_DAYS; offset++) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
    if (CLOSED_WEEKDAYS.includes(date.getDay())) continue;
    dates.push({ value: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`, date, offset });
  }
  return dates;
}

/** Day number (UTC) for a real YYYY-MM-DD calendar date, or null. */
export function dayNumber(value: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return null;
  return date.getTime() / DAY_MS;
}

/**
 * Server check for a submitted preferred date: a real date in the window the
 * form offers, with a day of slack either side so visitors in other time zones
 * are not rejected, and never a day the clinic is closed. (A calendar date's
 * weekday is the same everywhere, so UTC is fine for that part.)
 */
export function isBookableDate(value: string, now: number = Date.now()): boolean {
  const day = dayNumber(value);
  if (day === null) return false;
  const today = Math.floor(now / DAY_MS);
  if (day < today - 1 || day > today + BOOKING_DAYS) return false;
  return !CLOSED_WEEKDAYS.includes(new Date(day * DAY_MS).getUTCDay());
}
