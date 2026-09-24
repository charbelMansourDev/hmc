"use client";

import { useEffect } from "react";
import { smoothScrollTo } from "./scroll";

// Smooth, Motion-driven scrolling for every in-page link: nav, "Book" buttons,
// cards and footer. The URL is left untouched on purpose (no #hash is added);
// shared links such as /#team still work natively on page load.
export function SmoothScroll() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      // Leave modified / non-primary clicks alone (open in new tab, etc.).
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }
      const anchor = (e.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      const hash = anchor?.getAttribute("href");
      if (!hash || hash === "#") return;

      const id = decodeURIComponent(hash.slice(1));
      const target = id === "top" ? "top" : document.getElementById(id);
      if (!target) return;

      e.preventDefault();
      smoothScrollTo(target);

      // Keyboard activation (detail 0): move focus along with the scroll, so the
      // next Tab continues from the section rather than from the nav.
      if (e.detail === 0 && target !== "top") {
        if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
