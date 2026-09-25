"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SettingsDTO } from "@/lib/types";
import { sendJson, type FieldErrors } from "./api";
import { buttonClass, Card, Field, inputClass, Notice } from "./ui";

export function SettingsForm({ settings }: { settings: SettingsDTO }) {
  const router = useRouter();
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email ?? "");
  const [address, setAddress] = useState(settings.address ?? "");
  const [openingHours, setOpeningHours] = useState(settings.openingHours ?? "");
  const [mapQuery, setMapQuery] = useState(settings.mapQuery);
  const [fields, setFields] = useState<FieldErrors>({});
  const [message, setMessage] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    setFields({});
    const result = await sendJson<SettingsDTO>("/api/admin/settings", "PATCH", {
      phone,
      email: email || null,
      address: address || null,
      openingHours: openingHours || null,
      mapQuery,
    });
    setBusy(false);
    if (!result.ok) {
      setMessage({ tone: "error", text: result.message });
      setFields(result.fields);
      return;
    }
    setMessage({ tone: "success", text: "Saved. The website shows the new details on the next page load." });
    router.refresh();
  };

  const err = (key: string) => fields[key];

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6">
      {message ? <Notice tone={message.tone}>{message.text}</Notice> : null}
      <Card className="grid gap-5">
        <Field label="Phone" htmlFor="phone" error={err("phone")} hint="Shown in the hero “Call” button, the contact card and the footer.">
          <input id="phone" type="tel" className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} aria-invalid={Boolean(err("phone"))} />
        </Field>
        <Field label="Email" htmlFor="email" error={err("email")} hint="Leave empty to show the [Email] placeholder.">
          <input id="email" type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={Boolean(err("email"))} />
        </Field>
        <Field label="Address" htmlFor="address" error={err("address")} hint="Leave empty to show the [Address] placeholder.">
          <input id="address" className={inputClass} value={address} maxLength={160} onChange={(e) => setAddress(e.target.value)} />
        </Field>
        <Field
          label="Opening hours"
          htmlFor="openingHours"
          error={err("openingHours")}
          hint="One line, e.g. “Mon–Sat, 9:00 AM – 7:00 PM”. Shown in the hero strip and the contact card."
        >
          <input id="openingHours" className={inputClass} value={openingHours} maxLength={80} onChange={(e) => setOpeningHours(e.target.value)} />
        </Field>
        <Field label="Map location" htmlFor="mapQuery" error={err("mapQuery")} hint="A place name, e.g. “Naccache, Lebanon”, or exact coordinates copied from Google Maps, e.g. “33.9228, 35.5971”.">
          <input id="mapQuery" className={inputClass} value={mapQuery} maxLength={120} onChange={(e) => setMapQuery(e.target.value)} aria-invalid={Boolean(err("mapQuery"))} />
        </Field>
      </Card>
      <div>
        <button type="submit" className={buttonClass.primary} disabled={busy}>
          {busy ? "Saving…" : "Save contact details"}
        </button>
      </div>
    </form>
  );
}
