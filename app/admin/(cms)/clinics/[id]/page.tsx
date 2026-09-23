import type { Metadata } from "next";
import { ClinicForm } from "@/components/admin/ClinicForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { PageHeader } from "@/components/admin/ui";
import { loadOr404 } from "@/lib/admin-pages";
import { requireAdmin } from "@/lib/auth/guard";
import { getClinic } from "@/lib/clinics";
import { listBookableServices } from "@/lib/services";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit clinic" };

export default async function EditClinicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireAdmin(`/admin/clinics/${id}`);
  const [clinic, bookable] = await Promise.all([loadOr404(() => getClinic(id)), listBookableServices()]);

  return (
    <>
      <PageHeader
        title={clinic.name}
        actions={
          <DeleteButton
            url={`/api/admin/clinics/${clinic.id}`}
            confirmText={`Delete “${clinic.name}”? It will disappear from the website.`}
            redirectTo="/admin/clinics"
          />
        }
      />
      <ClinicForm clinic={clinic} bookable={bookable} />
    </>
  );
}
