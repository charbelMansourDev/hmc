import { AdminNav } from "@/components/admin/AdminNav";
import { countAppointmentsByStatus } from "@/lib/appointments";
import { getAdminSession } from "@/lib/auth/guard";

// Shell only (sidebar + content area). NOT the auth boundary: layouts do not
// re-run on every navigation, so each page calls requireAdmin() itself.
export default async function CmsLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  const counts = session ? await countAppointmentsByStatus() : null;

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[240px_1fr]">
      <aside className="border-b border-line bg-bg-soft/80 px-4 py-5 md:sticky md:top-0 md:h-dvh md:border-r md:border-b-0">
        <div className="mb-6 px-3">
          <p className="font-serif text-lg font-semibold text-ink">Hajj Medical Center</p>
          <p className="text-xs text-muted">Content management</p>
        </div>
        <AdminNav username={session?.username ?? null} newCount={counts?.new ?? 0} />
      </aside>
      <main className="px-4 py-8 md:px-10">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
