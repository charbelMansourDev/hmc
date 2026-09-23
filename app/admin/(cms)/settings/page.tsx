import type { Metadata } from "next";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/guard";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Contact & hours" };

export default async function SettingsPage() {
  await requireAdmin("/admin/settings");
  const settings = await getSettings();
  return (
    <>
      <PageHeader title="Contact & opening hours" description="Shown in the hero, the “Visit us” section and the footer." />
      <SettingsForm settings={settings} />
    </>
  );
}
