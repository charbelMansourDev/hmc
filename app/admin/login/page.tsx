import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { getAdminSession, safeNextPath } from "@/lib/auth/guard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const target = safeNextPath(next);
  if (await getAdminSession()) redirect(target);

  return (
    <main className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-sm rounded-lg border border-white dark:border-white/10 bg-surface/90 p-8 shadow-lg">
        <div className="mb-6 flex items-center gap-3">
          <span
            className="grid size-10 place-items-center rounded-[11px] text-white shadow-md"
            style={{ background: "linear-gradient(145deg, #5aa9f5 0%, #2f86e6 55%, #22a6a0 100%)" }}
            aria-hidden="true"
          >
            <svg viewBox="0 0 20 20" className="size-5" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round">
              <path d="M6 4.5v11M14 4.5v11M6 10h8" />
            </svg>
          </span>
          <div>
            <h1 className="text-xl text-ink">Hajj Medical Center</h1>
            <p className="text-xs text-muted">Content management</p>
          </div>
        </div>
        <LoginForm next={target} />
      </div>
    </main>
  );
}
