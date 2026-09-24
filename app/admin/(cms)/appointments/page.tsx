import type { Metadata } from "next";
import Link from "next/link";
import { AppointmentsTable } from "@/components/admin/AppointmentsTable";
import { PageHeader } from "@/components/admin/ui";
import { countAppointmentsByStatus, listAppointments } from "@/lib/appointments";
import { requireAdmin } from "@/lib/auth/guard";
import { APPOINTMENT_RETENTION_DAYS, APPOINTMENT_STATUSES, type AppointmentStatus } from "@/lib/categories";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Appointments" };

const LABEL: Record<AppointmentStatus, string> = { new: "New", contacted: "Contacted", closed: "Closed" };

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  await requireAdmin("/admin/appointments");
  const params = await searchParams;
  const status = APPOINTMENT_STATUSES.find((s) => s === params.status);
  const page = Math.max(1, Math.min(10_000, Number.parseInt(params.page ?? "1", 10) || 1));

  const [result, counts] = await Promise.all([listAppointments({ status, page }), countAppointmentsByStatus()]);
  const total = counts.new + counts.contacted + counts.closed;

  const tabs = [
    { key: undefined, label: "All", count: total },
    ...APPOINTMENT_STATUSES.map((s) => ({ key: s, label: LABEL[s], count: counts[s] })),
  ];
  const href = (s: AppointmentStatus | undefined, p = 1) => {
    const q = new URLSearchParams();
    if (s) q.set("status", s);
    if (p > 1) q.set("page", String(p));
    const qs = q.toString();
    return `/admin/appointments${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      <PageHeader
        title="Appointment requests"
        description={`Call-back requests from the website: name, phone, service and preferred date only. Deleted automatically after ${APPOINTMENT_RETENTION_DAYS} days.`}
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {tabs.map((t) => {
          const active = t.key === status;
          return (
            <Link
              key={t.label}
              href={href(t.key)}
              aria-current={active ? "page" : undefined}
              className={`rounded-pill border px-4 py-1.5 text-sm font-medium ${
                active ? "border-teal bg-teal text-white" : "border-line bg-surface text-ink-2 hover:bg-bg-soft"
              }`}
            >
              {t.label} <span className={active ? "text-white/80" : "text-muted"}>{t.count}</span>
            </Link>
          );
        })}
      </div>

      <AppointmentsTable items={result.items} />

      {result.pages > 1 ? (
        <nav className="mt-4 flex items-center gap-3 text-sm" aria-label="Pagination">
          {page > 1 ? (
            <Link className="font-semibold text-teal hover:underline" href={href(status, page - 1)}>
              ← Newer
            </Link>
          ) : null}
          <span className="text-muted">
            Page {result.page} of {result.pages}
          </span>
          {page < result.pages ? (
            <Link className="font-semibold text-teal hover:underline" href={href(status, page + 1)}>
              Older →
            </Link>
          ) : null}
        </nav>
      ) : null}
    </>
  );
}
