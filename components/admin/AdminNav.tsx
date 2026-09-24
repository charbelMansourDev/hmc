"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

const LINKS = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/appointments", label: "Appointments" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/clinics", label: "Clinics" },
  { href: "/admin/team", label: "Team" },
  { href: "/admin/settings", label: "Contact & hours" },
];

export function AdminNav({ username, newCount }: { username: string | null; newCount: number }) {
  const pathname = usePathname();
  const [busy, setBusy] = useState(false);

  const logout = async () => {
    setBusy(true);
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => null);
    window.location.assign("/admin/login");
  };

  return (
    <nav aria-label="CMS" className="flex h-full flex-col gap-1">
      {LINKS.map((link) => {
        const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center justify-between rounded-sm px-3 py-2 text-sm font-medium transition ${
              active ? "bg-teal text-white shadow-sm" : "text-ink-2 hover:bg-surface"
            }`}
          >
            {link.label}
            {link.href === "/admin/appointments" && newCount > 0 ? (
              <span
                className={`rounded-pill px-2 py-0.5 text-xs font-semibold ${
                  active ? "bg-white/20 text-white" : "bg-teal-soft text-teal"
                }`}
              >
                {newCount}
              </span>
            ) : null}
          </Link>
        );
      })}

      <div className="mt-auto grid gap-1 border-t border-line pt-4">
        <ThemeToggle className="grid size-9 place-items-center rounded-sm text-ink-2 transition hover:bg-surface" />
        {/* Plain <a>: a full page load, so CMS styles never carry over into the site. */}
        <a href="/" target="_blank" rel="noreferrer" className="rounded-sm px-3 py-2 text-sm text-ink-2 hover:bg-surface">
          View website ↗
        </a>
        <button
          type="button"
          onClick={logout}
          disabled={busy}
          className="rounded-sm px-3 py-2 text-left text-sm text-ink-2 hover:bg-surface disabled:opacity-60"
        >
          {busy ? "Signing out…" : "Sign out"}
        </button>
        {username ? <p className="px-3 pt-1 text-xs text-muted">Signed in as {username}</p> : null}
      </div>
    </nav>
  );
}
