"use client";

import { useEffect } from "react";

// Progressive enhancement: smooth-scroll in-page anchor clicks in every browser.
// CSS `scroll-behavior: smooth` is set on <html>, but some browsers (notably
// Safari) ignore it for anchor navigation, so we drive the scroll ourselves.
// We honour `prefers-reduced-motion`, and `scrollIntoView` still respects the
// `scroll-margin-top` offsets that keep targets clear of the sticky header.
// Other document-level listeners (e.g. the booking preselect) are untouched:
// preventDefault only cancels the native jump, not other handlers.
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
      const target = id === "top" ? document.documentElement : document.getElementById(id);
      if (!target) return;

      e.preventDefault();
      const behavior: ScrollBehavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth";

      if (id === "top") {
        window.scrollTo({ top: 0, behavior });
      } else {
        target.scrollIntoView({ behavior, block: "start" });
      }

      // Mirror native anchor behaviour: reflect the section in the URL.
      history.pushState(null, "", hash);
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
