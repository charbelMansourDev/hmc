import Link from "next/link";
import { bookingWhatsApp } from "@/lib/phone";
import type { SettingsDTO } from "@/lib/types";
import { Notice } from "./ui";

/** Shown above the request lists while Settings sends new requests to WhatsApp. */
export function BookingChannelNotice({ settings }: { settings: SettingsDTO }) {
  if (!bookingWhatsApp(settings)) return null;
  return (
    <div className="mb-6">
      <Notice tone="info">
        New appointment requests go to WhatsApp on <strong>{settings.whatsapp ?? settings.phone}</strong>, so the
        website doesn&apos;t save them here. Change this in{" "}
        <Link href="/admin/settings" className="font-semibold text-teal hover:underline">
          Settings
        </Link>
        . Requests received earlier stay listed until they are deleted automatically.
      </Notice>
    </div>
  );
}
