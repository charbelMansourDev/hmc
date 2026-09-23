import type { Metadata } from "next";
import "./admin.css";

export const metadata: Metadata = {
  title: { default: "CMS · Hajj Medical Center", template: "%s · HMC CMS" },
  robots: { index: false, follow: false },
};

// Styling only. This layout is NOT an authorization boundary: every CMS page
// calls requireAdmin() itself.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
