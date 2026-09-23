"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ACCENT_LABELS, ACCENTS, type Accent } from "@/lib/categories";
import type { DoctorDTO } from "@/lib/types";
import { sendMultipart, type FieldErrors } from "./api";
import { ImageField } from "./ImageField";
import { buttonClass, Card, Field, inputClass, Notice } from "./ui";

const ACCENT_TEXT: Record<Accent, string> = {
  teal: "#0e8a6d",
  green: "#3d9a3f",
  coral: "#e04a33",
  blue: "#2e6ad1",
};

export function DoctorForm({ doctor }: { doctor: DoctorDTO | null }) {
  const router = useRouter();
  const [name, setName] = useState(doctor?.name ?? "");
  const [specialty, setSpecialty] = useState(doctor?.specialty ?? "");
  const [bio, setBio] = useState(doctor?.bio ?? "");
  const [accent, setAccent] = useState<Accent>(doctor?.accent ?? "teal");
  const [photoAlt, setPhotoAlt] = useState(doctor?.photo?.alt ?? "");
  const [sortOrder, setSortOrder] = useState(String(doctor?.sortOrder ?? 100));
  const [photo, setPhoto] = useState<File | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [fields, setFields] = useState<FieldErrors>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setFields({});
    const payload = {
      name,
      specialty,
      bio,
      accent,
      photoAlt: photoAlt || null,
      sortOrder: Number(sortOrder),
      ...(doctor && removePhoto && !photo ? { removePhoto: true } : {}),
    };
    const result = doctor
      ? await sendMultipart<DoctorDTO>(`/api/admin/doctors/${doctor.id}`, "PATCH", payload, photo)
      : await sendMultipart<DoctorDTO>("/api/admin/doctors", "POST", payload, photo);
    setBusy(false);
    if (!result.ok) {
      setError(result.message);
      setFields(result.fields);
      return;
    }
    router.push("/admin/team");
    router.refresh();
  };

  const err = (key: string) => fields[key];

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6">
      {error ? <Notice tone="error">{error}</Notice> : null}
      <Card className="grid gap-5">
        <Field label="Name" htmlFor="name" error={err("name")} hint="e.g. “Dr. Rania Haddad”.">
          <input id="name" className={inputClass} value={name} maxLength={80} onChange={(e) => setName(e.target.value)} aria-invalid={Boolean(err("name"))} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Specialty" htmlFor="specialty" error={err("specialty")} hint="e.g. “Dental specialist”.">
            <input id="specialty" className={inputClass} value={specialty} maxLength={60} onChange={(e) => setSpecialty(e.target.value)} aria-invalid={Boolean(err("specialty"))} />
          </Field>
          <Field label="Colour" htmlFor="accent" error={err("accent")}>
            <select id="accent" className={inputClass} value={accent} onChange={(e) => setAccent(e.target.value as Accent)}>
              {ACCENTS.map((a) => (
                <option key={a} value={a}>
                  {ACCENT_LABELS[a]}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Short bio" htmlFor="bio" error={err("bio")} hint="One line, up to 160 characters.">
          <textarea id="bio" rows={2} className={inputClass} value={bio} maxLength={160} onChange={(e) => setBio(e.target.value)} />
        </Field>
        <p className="text-sm">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">Preview · </span>
          <span style={{ color: ACCENT_TEXT[accent] }} className="font-medium">
            {bio ? `${specialty || "Specialty"} – ${bio}` : specialty || "Specialty"}
          </span>
        </p>
      </Card>

      <Card className="grid gap-5">
        <ImageField
          id="photo"
          label="Photo (optional)"
          currentUrl={removePhoto ? null : (doctor?.photo?.url ?? null)}
          file={photo}
          onFile={setPhoto}
          error={err("image")}
          aspect="5 / 4"
        />
        {doctor?.photo && !photo ? (
          <label className="flex items-center gap-2 text-sm text-ink-2">
            <input type="checkbox" checked={removePhoto} onChange={(e) => setRemovePhoto(e.target.checked)} />
            Remove the current photo (shows the coloured placeholder instead)
          </label>
        ) : null}
        <Field label="Photo description (alt text)" htmlFor="photoAlt" error={err("photoAlt")} hint="Optional. Defaults to “Photo of <name>”.">
          <input id="photoAlt" className={inputClass} value={photoAlt} maxLength={140} onChange={(e) => setPhotoAlt(e.target.value)} />
        </Field>
        <Field label="Sort order" htmlFor="sortOrder" error={err("sortOrder")} hint="Lower numbers appear first.">
          <input id="sortOrder" type="number" min={0} max={9999} className={`${inputClass} max-w-40`} value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
        </Field>
      </Card>

      <div className="flex flex-wrap gap-3">
        <button type="submit" className={buttonClass.primary} disabled={busy}>
          {busy ? "Saving…" : doctor ? "Save changes" : "Add team member"}
        </button>
        <button type="button" className={buttonClass.secondary} onClick={() => router.push("/admin/team")}>
          Cancel
        </button>
      </div>
    </form>
  );
}
