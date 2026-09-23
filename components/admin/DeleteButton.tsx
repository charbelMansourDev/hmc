"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { sendJson } from "./api";
import { buttonClass } from "./ui";

export function DeleteButton({
  url,
  confirmText,
  redirectTo,
  label = "Delete",
  compact = false,
}: {
  url: string;
  confirmText: string;
  redirectTo?: string;
  label?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const onClick = async () => {
    if (!window.confirm(confirmText)) return;
    setBusy(true);
    const result = await sendJson(url, "DELETE");
    setBusy(false);
    if (!result.ok) {
      window.alert(result.message);
      return;
    }
    if (redirectTo) router.push(redirectTo);
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={compact ? "text-xs font-semibold text-danger hover:underline disabled:opacity-60" : buttonClass.danger}
    >
      {busy ? "Deleting…" : label}
    </button>
  );
}
