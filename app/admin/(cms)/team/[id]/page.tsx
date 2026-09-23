import type { Metadata } from "next";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { DoctorForm } from "@/components/admin/DoctorForm";
import { PageHeader } from "@/components/admin/ui";
import { loadOr404 } from "@/lib/admin-pages";
import { requireAdmin } from "@/lib/auth/guard";
import { getDoctor } from "@/lib/doctors";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit team member" };

export default async function EditDoctorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireAdmin(`/admin/team/${id}`);
  const doctor = await loadOr404(() => getDoctor(id));

  return (
    <>
      <PageHeader
        title={doctor.name}
        actions={
          <DeleteButton
            url={`/api/admin/doctors/${doctor.id}`}
            confirmText={`Remove “${doctor.name}” from the team?`}
            redirectTo="/admin/team"
          />
        }
      />
      <DoctorForm doctor={doctor} />
    </>
  );
}
