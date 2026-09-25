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
  // Dark is the default theme; ThemeToggle updates this when light is chosen.
  themeColor: "#0d151d",
};

// Dark is the default and is rendered on the server (data-theme="dark" below),
// so it also applies without JavaScript. This runs before first paint and only
// switches to light for visitors who chose light with the toggle.
const themeScript = `(function(){try{if(localStorage.getItem('theme')==='light'){document.documentElement.setAttribute('data-theme','light');}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The inline script may switch data-theme before hydration, hence suppressHydrationWarning.
    <html
      lang="en"
      data-theme="dark"
      className={`${inter.variable} ${newsreader.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
