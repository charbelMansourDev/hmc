"use client";

import { useEffect, useRef, useState } from "react";
import type { NavLink } from "@/lib/types";
import { BrandMark } from "./icons";

export function SiteHeader({ nav }: { nav: NavLink[] }) {
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className="site-header">
      <div className="container">
        <nav ref={navRef} className={open ? "nav nav-open" : "nav"} aria-label="Main">
          <a className="brand" href="#top" aria-label="Hajj Medical Center home">
            <span className="brand-mark" aria-hidden="true">
              <BrandMark />
            </span>
            Hajj Medical Center
          </a>

          <ul className="nav-links" id="nav-links">
            {nav.map((link) => (
              <li key={link.href}>
                <a href={link.href} onClick={close}>
                  {link.label}
                </a>
              </li>
            ))}
            <li className="nav-links-cta">
              <a className="btn btn-primary btn-block" href="#book" onClick={close}>
                Book an appointment
              </a>
            </li>
          </ul>

          <a className="btn btn-primary btn-sm nav-cta" href="#book">
            Book an appointment
          </a>

          <button
            className="nav-toggle"
            type="button"
            aria-controls="nav-links"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span></span>
          </button>
        </nav>
      </div>
    </header>
  );
}
