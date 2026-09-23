import type { Metadata } from "next";
import { ServiceForm } from "@/components/admin/ServiceForm";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/guard";
import { CATEGORIES } from "@/lib/categories";
import { listBookableServices } from "@/lib/services";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "New service" };

export default async function NewServicePage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  await requireAdmin("/admin/services/new");
  const { category } = await searchParams;
  const bookable = await listBookableServices();

  return (
    <>
      <PageHeader title="New service" />
      <ServiceForm service={null} bookable={bookable} defaultCategory={CATEGORIES.find((c) => c === category)} />
    </>
  );
}
