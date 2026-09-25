import { telHref } from "@/lib/home-content";
import type { SettingsDTO } from "@/lib/types";
import { BookingCard } from "./BookingCard";
import { BuildingIcon, CalendarIcon, ClockIcon, PinIcon } from "./icons";
import { OpeningHours } from "./OpeningHours";

const HEADLINE = "Comprehensive, human-centered care – under one roof";

// The hero entrance is pure CSS (see site.css): it starts on first paint rather
// than after hydration, so the headline is never held back waiting for
// JavaScript. Each word gets its index (--i) to stagger the reveal.
const at = (i: number) => ({ "--i": i }) as React.CSSProperties;

export function Hero({ settings, specialistCount }: { settings: SettingsDTO; specialistCount: number }) {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-grid">
          <div className="hero-copy">
            <h1 aria-label={HEADLINE}>
              {HEADLINE.split(" ").map((word, i) => (
                <span key={i}>
                  <span className="hero-word" style={at(i)} aria-hidden="true">
                    {word}
                  </span>{" "}
                </span>
              ))}
            </h1>
            <p className="hero-lede">
              Specialist medicine, dentistry, nutrition, esthetics and rehabilitation together in Naccache – so
              your whole family&apos;s care lives in one place.
            </p>
            <div className="hero-actions">
              <a className="btn btn-primary" href="#book">
                Book an appointment
              </a>
              <a className="btn btn-light" href={telHref(settings.phone)}>
                Call {settings.phone}
              </a>
            </div>
          </div>

          <div className="hero-card">
            <BookingCard />
          </div>
        </div>

        <ul className="highlights">
          <li className="highlight" style={at(0)}>
            <span className="highlight-icon" aria-hidden="true">
              <BuildingIcon />
            </span>
            {specialistCount} specialties, one address
          </li>
          <li className="highlight" style={at(1)}>
            <span className="highlight-icon" aria-hidden="true">
              <PinIcon />
            </span>
            Naccache, Lebanon
          </li>
          <li className="highlight" style={at(2)}>
            <span className="highlight-icon" aria-hidden="true">
              <ClockIcon />
            </span>
            {settings.openingHours ? <OpeningHours value={settings.openingHours} /> : "[Opening hours]"}
          </li>
          <li className="highlight" style={at(3)}>
            <span className="highlight-icon" aria-hidden="true">
              <CalendarIcon />
            </span>
            Walk-ins &amp; appointments
          </li>
        </ul>
      </div>
    </section>
  );
}
