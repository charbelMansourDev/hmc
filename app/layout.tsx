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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eaf1f8" },
    { media: "(prefers-color-scheme: dark)", color: "#0d151d" },
  ],
};

// Runs before first paint: resolve the theme (stored override, else the
// system preference) and set data-theme so there is no light/dark flash.
// Also adds the `js` class the reveal styles depend on.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){}document.documentElement.classList.add('js');})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The inline script adds the `js` class before hydration, hence suppressHydrationWarning.
    <html lang="en" className={`${inter.variable} ${newsreader.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
