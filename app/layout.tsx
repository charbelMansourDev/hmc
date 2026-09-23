import type { Metadata, Viewport } from "next";
import { Inter, Newsreader } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// The opsz axis keeps `font-optical-sizing: auto` working on the big headings.
const newsreader = Newsreader({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-newsreader",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hajj Medical Center — Comprehensive care in Naccache",
  description:
    "Specialist medicine, dentistry, nutrition, esthetics and rehabilitation together in Naccache, Lebanon — so your whole family's care lives in one place.",
};

export const viewport: Viewport = {
  themeColor: "#eaf1f8",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The inline script adds the `js` class before hydration, hence suppressHydrationWarning.
    <html lang="en" className={`${inter.variable} ${newsreader.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
