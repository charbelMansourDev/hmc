import type { Metadata } from "next";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/guard";
import { googlePlacesKey } from "@/lib/google-reviews";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  await requireAdmin("/admin/settings");
  const settings = await getSettings();
  return (
    <>
      <PageHeader
        title="Settings"
        description="Contact details and opening hours, where appointment requests go, and the Google reviews section."
      />
      <SettingsForm settings={settings} reviewsKeySet={Boolean(googlePlacesKey())} />
    </>
  );
}
