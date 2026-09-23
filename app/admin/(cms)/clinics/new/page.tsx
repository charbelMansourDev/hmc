import type { Metadata } from "next";
import { ClinicForm } from "@/components/admin/ClinicForm";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/guard";
import { listBookableServices } from "@/lib/services";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "New clinic" };

export default async function NewClinicPage() {
  await requireAdmin("/admin/clinics/new");
  const bookable = await listBookableServices();
  return (
    <>
      <PageHeader title="New clinic" />
      <ClinicForm clinic={null} bookable={bookable} />
    </>
  );
}
