import type { Metadata } from "next";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { ServiceForm } from "@/components/admin/ServiceForm";
import { PageHeader } from "@/components/admin/ui";
import { loadOr404 } from "@/lib/admin-pages";
import { requireAdmin } from "@/lib/auth/guard";
import { getService, listBookableServices } from "@/lib/services";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit service" };

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireAdmin(`/admin/services/${id}`);
  const [service, bookable] = await Promise.all([loadOr404(() => getService(id)), listBookableServices()]);

  return (
    <>
      <PageHeader
        title={service.name}
        description="Edit how this service appears on the website."
        actions={
          <DeleteButton
            url={`/api/admin/services/${service.id}`}
            confirmText={`Delete “${service.name}”? It will disappear from the website.`}
            redirectTo="/admin/services"
          />
        }
      />
      <ServiceForm service={service} bookable={bookable} />
    </>
  );
}
