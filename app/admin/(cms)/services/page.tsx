import type { Metadata } from "next";
import Link from "next/link";
import { Thumb } from "@/components/admin/Thumb";
import { buttonClass, EmptyState, PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/guard";
import { CATEGORIES, CATEGORY_META } from "@/lib/categories";
import { listServices } from "@/lib/services";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Services" };

export default async function ServicesPage() {
  await requireAdmin("/admin/services");
  const services = await listServices();
  const names = new Map(services.map((s) => [s.id, s.bookingLabel ?? s.name]));

  return (
    <>
      <PageHeader
        title="Services"
        description="The cards in each section of the website. Order within a section follows the sort order."
        actions={
          <Link href="/admin/services/new" className={buttonClass.primary}>
            New service
          </Link>
        }
      />
      <div className="grid gap-8">
        {CATEGORIES.map((category) => {
          const items = services.filter((s) => s.category === category);
          return (
            <section key={category}>
              <div className="mb-3 flex items-end justify-between gap-4">
                <h2 className="text-xl text-ink">{CATEGORY_META[category].heading}</h2>
                <Link href={`/admin/services/new?category=${category}`} className="text-sm font-semibold text-teal hover:underline">
                  Add to this section
                </Link>
              </div>
              {items.length === 0 ? (
                <EmptyState>No services in this section, so it is hidden on the website.</EmptyState>
              ) : (
                <ul className="divide-y divide-line overflow-hidden rounded-lg border border-white bg-white/90 shadow-md">
                  {items.map((s) => (
                    <li key={s.id}>
                      <Link href={`/admin/services/${s.id}`} className="flex items-center gap-4 px-4 py-3 hover:bg-bg-soft">
                        <Thumb image={s.image} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-ink">
                            {s.name}
                            {s.display === "feature" ? (
                              <span className="ml-2 rounded-pill bg-bg-soft px-2 py-0.5 text-xs font-semibold text-muted">Feature</span>
                            ) : null}
                          </p>
                          <p className="truncate text-xs text-muted">
                            {s.chip ? `${s.chip} · ` : ""}
                            {s.bookAsId ? `Books “${names.get(s.bookAsId) ?? "?"}”` : `Booking: “${s.bookingLabel ?? s.name}”`}
                          </p>
                        </div>
                        <span className="text-xs text-muted">#{s.sortOrder}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
