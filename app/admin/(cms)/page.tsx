import type { Metadata } from "next";
import Link from "next/link";
import { AppointmentsTable } from "@/components/admin/AppointmentsTable";
import { BookingChannelNotice } from "@/components/admin/BookingChannelNotice";
import { Card, PageHeader } from "@/components/admin/ui";
import { countAppointmentsByStatus, listAppointments } from "@/lib/appointments";
import { requireAdmin } from "@/lib/auth/guard";
import { APPOINTMENT_RETENTION_DAYS } from "@/lib/categories";
import { listClinics } from "@/lib/clinics";
import { listDoctors } from "@/lib/doctors";
import { listServices } from "@/lib/services";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await requireAdmin("/admin");
  const [counts, latest, services, clinics, doctors, settings] = await Promise.all([
    countAppointmentsByStatus(),
    listAppointments({ status: "new", page: 1 }),
    listServices(),
    listClinics(),
    listDoctors(),
    getSettings(),
  ]);

  const stats = [
    { label: "New requests", value: counts.new, href: "/admin/appointments?status=new" },
    { label: "Services", value: services.length, href: "/admin/services" },
    { label: "Clinics", value: clinics.length, href: "/admin/clinics" },
    { label: "Team members", value: doctors.length, href: "/admin/team" },
  ];

  return (
    <>
      <PageHeader title={`Welcome back, ${session.username}`} description="Everything you change here appears on the website on the next page load." />
      <BookingChannelNotice settings={settings} />
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="transition hover:-translate-y-0.5 hover:shadow-lg">
              <p className="text-3xl font-semibold text-ink">{s.value}</p>
              <p className="mt-1 text-sm text-muted">{s.label}</p>
            </Card>
          </Link>
        ))}
      </div>
      <div className="mb-3 flex items-end justify-between">
        <h2 className="text-xl text-ink">Latest new requests</h2>
        <Link href="/admin/appointments" className="text-sm font-semibold text-teal hover:underline">
          All requests →
        </Link>
      </div>
      <AppointmentsTable items={latest.items.slice(0, 5)} />
      <p className="mt-3 text-xs text-muted">
        Requests are deleted automatically {APPOINTMENT_RETENTION_DAYS} days after they are received.
      </p>
    </>
  );
}
