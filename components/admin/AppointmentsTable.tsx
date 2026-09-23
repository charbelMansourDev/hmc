"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { APPOINTMENT_STATUSES, type AppointmentStatus } from "@/lib/categories";
import type { AppointmentDTO } from "@/lib/types";
import { sendJson } from "./api";
import { DeleteButton } from "./DeleteButton";
import { EmptyState } from "./ui";

const STATUS_LABEL: Record<AppointmentStatus, string> = { new: "New", contacted: "Contacted", closed: "Closed" };
const STATUS_STYLE: Record<AppointmentStatus, string> = {
  new: "bg-teal-soft text-teal border-teal/20",
  contacted: "bg-[#eef3fb] text-blue border-blue/20",
  closed: "bg-bg-soft text-muted border-line",
};

const received = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Beirut" });
const preferred = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });

function formatPreferred(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  return preferred.format(new Date(Date.UTC(y, m - 1, d)));
}

export function AppointmentsTable({ items }: { items: AppointmentDTO[] }) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);

  const changeStatus = async (id: string, status: AppointmentStatus) => {
    setPending(id);
    const result = await sendJson(`/api/admin/appointments/${id}`, "PATCH", { status });
    setPending(null);
    if (!result.ok) window.alert(result.message);
    router.refresh();
  };

  if (items.length === 0) return <EmptyState>No appointment requests here yet.</EmptyState>;

  return (
    <div className="overflow-x-auto rounded-lg border border-white bg-white/90 shadow-md">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
          <tr>
            <th className="px-4 py-3 font-semibold">Received</th>
            <th className="px-4 py-3 font-semibold">Name</th>
            <th className="px-4 py-3 font-semibold">Phone</th>
            <th className="px-4 py-3 font-semibold">Service</th>
            <th className="px-4 py-3 font-semibold">Preferred date</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {items.map((a) => (
            <tr key={a.id} className={pending === a.id ? "opacity-60" : undefined}>
              <td className="whitespace-nowrap px-4 py-3 text-muted">{received.format(new Date(a.createdAt))}</td>
              <td className="px-4 py-3 font-medium text-ink">{a.name}</td>
              <td className="whitespace-nowrap px-4 py-3">
                <a className="text-teal hover:underline" href={`tel:${a.phone.replace(/[^\d+]/g, "")}`}>
                  {a.phone}
                </a>
              </td>
              <td className="px-4 py-3 text-ink-2">{a.serviceName}</td>
              <td className="whitespace-nowrap px-4 py-3 text-ink-2">{formatPreferred(a.preferredDate)}</td>
              <td className="px-4 py-3">
                <select
                  aria-label={`Status for ${a.name}`}
                  value={a.status}
                  disabled={pending === a.id}
                  onChange={(e) => changeStatus(a.id, e.target.value as AppointmentStatus)}
                  className={`rounded-pill border px-3 py-1 text-xs font-semibold ${STATUS_STYLE[a.status]}`}
                >
                  {APPOINTMENT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-3 text-right">
                <DeleteButton
                  compact
                  url={`/api/admin/appointments/${a.id}`}
                  confirmText={`Delete the request from ${a.name}? This cannot be undone.`}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
