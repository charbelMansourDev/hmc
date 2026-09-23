import type { Metadata } from "next";
import { DoctorForm } from "@/components/admin/DoctorForm";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/guard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Add team member" };

export default async function NewDoctorPage() {
  await requireAdmin("/admin/team/new");
  return (
    <>
      <PageHeader title="Add team member" />
      <DoctorForm doctor={null} />
    </>
  );
}
