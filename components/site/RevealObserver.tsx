"use client";

import { useEffect } from "react";

// Same reveal-on-scroll behaviour as the original script.js: staggered by
// position among .reveal siblings, then the delay is dropped so hover
// effects respond instantly.
export function RevealObserver() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));

    els.forEach((el) => {
      const siblings = Array.from(el.parentElement?.children ?? []).filter((c) =>
        c.classList.contains("reveal"),
      );
      const index = siblings.indexOf(el);
      if (index > 0) el.style.transitionDelay = `${(index % 6) * 60}ms`;
    });

    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }

    const timers: number[] = [];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          el.classList.add("is-in");
          io.unobserve(el);
          timers.push(window.setTimeout(() => (el.style.transitionDelay = ""), 1100));
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    els.forEach((el) => io.observe(el));

    return () => {
      io.disconnect();
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  return null;
}
