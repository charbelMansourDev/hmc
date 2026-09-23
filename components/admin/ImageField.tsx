"use client";

/* eslint-disable @next/next/no-img-element -- local previews of files not uploaded yet */
import { useEffect, useState } from "react";
import { Field } from "./ui";

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,image/webp";

type Props = {
  id: string;
  label: string;
  currentUrl: string | null;
  file: File | null;
  onFile: (file: File | null) => void;
  error?: string;
  required?: boolean;
  /** Aspect of the preview box, matching how the image is shown on the site */
  aspect?: string;
};

export function ImageField({ id, label, currentUrl, file, onFile, error, required, aspect = "16 / 11" }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.files?.[0] ?? null;
    setLocalError("");
    if (next && !ACCEPT.split(",").includes(next.type)) {
      setLocalError("Use a JPEG, PNG or WebP image.");
      e.target.value = "";
      return;
    }
    if (next && next.size > MAX_UPLOAD_BYTES) {
      setLocalError("That image is larger than 4 MB. Please resize it first.");
      e.target.value = "";
      return;
    }
    onFile(next);
  };

  const shown = preview ?? currentUrl;

  return (
    <Field
      label={label}
      htmlFor={id}
      error={localError || error}
      hint={`JPEG, PNG or WebP, up to 4 MB.${required && !currentUrl ? " Required." : ""}`}
    >
      <div className="flex flex-wrap items-start gap-4">
        <div
          className="w-48 shrink-0 overflow-hidden rounded-sm border border-line bg-bg-soft"
          style={{ aspectRatio: aspect }}
        >
          {shown ? (
            <img src={shown} alt="" className="size-full object-cover" />
          ) : (
            <div className="grid size-full place-items-center text-xs text-muted">No image</div>
          )}
        </div>
        <div className="grid gap-2">
          <input
            id={id}
            type="file"
            accept={ACCEPT}
            onChange={onChange}
            className="text-sm text-ink-2 file:mr-3 file:rounded-pill file:border-0 file:bg-teal-soft file:px-4 file:py-2 file:text-sm file:font-semibold file:text-teal hover:file:bg-teal/15"
          />
          {file ? (
            <button type="button" className="w-fit text-xs font-medium text-muted underline" onClick={() => onFile(null)}>
              Undo new image
            </button>
          ) : null}
        </div>
      </div>
    </Field>
  );
}
