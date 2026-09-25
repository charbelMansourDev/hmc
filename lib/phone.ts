// Phone helpers shared by the zod schemas (server) and the booking form
// (client). No imports, so the public bundle doesn't pull in zod.

const PHONE_CHARS = /^\+?[\d\s().-]+$/;

/** Digits with optional +, spaces, dashes, dots and parentheses; 7–15 digits. */
export function isValidPhone(value: string): boolean {
  const v = value.trim();
  if (v.length > 24 || !PHONE_CHARS.test(v)) return false;
  const digits = v.replace(/\D/g, "").length;
  return digits >= 7 && digits <= 15;
}

/**
 * The number in the digits-only international form wa.me needs:
 * "+961 4 520 065" or "00961 4 520 065" -> "9614520065". A local number with
 * no country code ("04 520 065") can't be routed, so it returns null.
 */
export function whatsappDigits(value: string | null | undefined): string | null {
  const v = value?.trim();
  if (!v || !isValidPhone(v)) return null;
  const digits = v.replace(/\D/g, "");
  const international = v.startsWith("+") ? digits : v.startsWith("00") ? digits.slice(2) : null;
  if (!international || international.startsWith("0") || international.length < 8) return null;
  return international;
}

/** WhatsApp click-to-chat link that opens a chat with `text` ready to send. */
export function whatsappUrl(digits: string, text: string): string {
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

/** Where booking requests go: the WhatsApp number (digits), or null for the CMS inbox. */
export function bookingWhatsApp(settings: {
  bookingChannel: string;
  whatsapp: string | null;
  phone: string;
}): string | null {
  return settings.bookingChannel === "whatsapp" ? whatsappDigits(settings.whatsapp ?? settings.phone) : null;
}
