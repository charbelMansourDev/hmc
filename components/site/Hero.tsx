import { telHref } from "@/lib/home-content";
import type { SettingsDTO } from "@/lib/types";
import { BookingCard } from "./BookingCard";
import { BuildingIcon, CalendarIcon, ClockIcon, PinIcon } from "./icons";

export function Hero({ settings, specialistCount }: { settings: SettingsDTO; specialistCount: number }) {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-grid">
          <div className="hero-copy">
            <h1>Comprehensive, human-centered care – under one roof</h1>
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

          <BookingCard />
        </div>

        <ul className="highlights">
          <li className="highlight">
            <span className="highlight-icon" aria-hidden="true">
              <BuildingIcon />
            </span>
            {specialistCount} specialties, one address
          </li>
          <li className="highlight">
            <span className="highlight-icon" aria-hidden="true">
              <PinIcon />
            </span>
            Naccache, Lebanon
          </li>
          <li className="highlight">
            <span className="highlight-icon" aria-hidden="true">
              <ClockIcon />
            </span>
            {settings.openingHours ?? "[Opening hours]"}
          </li>
          <li className="highlight">
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
