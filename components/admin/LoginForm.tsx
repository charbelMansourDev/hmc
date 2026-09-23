"use client";

import { useState } from "react";
import { sendJson } from "./api";
import { buttonClass, Field, inputClass, Notice } from "./ui";

export function LoginForm({ next }: { next: string }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    const result = await sendJson("/api/admin/login", "POST", { username, password });
    if (result.ok) {
      // Full navigation so the new cookie is used for the first CMS render.
      window.location.assign(next);
      return;
    }
    setBusy(false);
    setError(result.message);
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-4" noValidate>
      {error ? <Notice tone="error">{error}</Notice> : null}
      <Field label="Username" htmlFor="username">
        <input
          id="username"
          className={inputClass}
          autoComplete="username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </Field>
      <Field label="Password" htmlFor="password">
        <input
          id="password"
          type="password"
          className={inputClass}
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Field>
      <button type="submit" className={`${buttonClass.primary} mt-2 w-full`} disabled={busy}>
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
