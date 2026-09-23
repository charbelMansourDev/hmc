import type { Metadata } from "next";
import "./site.css";

const ogImage =
  "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&h=630&q=75";

export const metadata: Metadata = {
  openGraph: {
    type: "website",
    title: "Hajj Medical Center — Comprehensive, human-centered care",
    description:
      "Specialist medicine, dentistry, nutrition, esthetics and rehabilitation under one roof in Naccache, Lebanon.",
    images: [ogImage],
  },
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
