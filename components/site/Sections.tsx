import { telHref } from "@/lib/home-content";
import type { DoctorDTO, HomeSection, PublicClinicItem, SettingsDTO } from "@/lib/types";
import { AppointmentForm } from "./AppointmentForm";
import { ClinicCard, FeatureCard, ServiceCard } from "./Cards";
import { CheckIcon, ClockIcon, MailIcon, PersonSilhouette, PhoneIcon, PinIcon } from "./icons";
import Image from "next/image";

function SectionHead({ heading, lede }: { heading: string; lede?: string | null }) {
  return (
    <div className="section-head reveal">
      <h2>{heading}</h2>
      {lede ? <p>{lede}</p> : null}
    </div>
  );
}

export function ServiceSection({ section }: { section: HomeSection }) {
  return (
    <section className="section" id={section.anchor}>
      <div className="container">
        <SectionHead heading={section.heading} lede={section.lede} />
        {section.cards.length > 0 ? (
          <div className={section.wide ? "grid grid--wide" : "grid"}>
            {section.cards.map((item) => (
              <ServiceCard key={item.id} item={item} wide={section.wide} />
            ))}
          </div>
        ) : null}
        {section.features.length > 0 ? (
          <div className="features">
            {section.features.map((item) => (
              <FeatureCard key={item.id} item={item} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function ClinicsSection({ clinics }: { clinics: PublicClinicItem[] }) {
  if (clinics.length === 0) return null;
  return (
    <section className="section" id="clinics">
      <div className="container">
        <SectionHead heading="Dedicated clinics" />
        <div className="grid grid--wide">
          {clinics.map((item) => (
            <ClinicCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  { title: "Book", text: "Choose the team and time that suits you." },
  { title: "Visit", text: "Meet your clinician in our modern, welcoming center." },
  { title: "Follow up", text: "Leave with a clear, coordinated next step." },
];

export function StepsSection() {
  return (
    <section className="section" id="how">
      <div className="container">
        <SectionHead heading="How a visit works" />
        <ol className="steps">
          {STEPS.map((step, i) => (
            <li className="step reveal" key={step.title}>
              <span className="step-num">{i + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function TeamSection({ doctors }: { doctors: DoctorDTO[] }) {
  if (doctors.length === 0) return null;
  return (
    <section className="section" id="team">
      <div className="container">
        <SectionHead heading="Meet the team" lede="Full team bios coming soon." />
        <div className="team">
          {doctors.map((doctor) => (
            <article className="member reveal" key={doctor.id}>
              {doctor.photo ? (
                <div className={`avatar avatar--${doctor.accent} avatar--photo`}>
                  <Image
                    src={doctor.photo.url}
                    alt={doctor.photo.alt}
                    width={580}
                    height={464}
                    sizes="(max-width: 820px) 50vw, 290px"
                    unoptimized={doctor.photo.storage === "external"}
                  />
                </div>
              ) : (
                <div className={`avatar avatar--${doctor.accent}`} aria-hidden="true">
                  <PersonSilhouette />
                </div>
              )}
              <h3>{doctor.name}</h3>
              <p className={`role--${doctor.accent}`}>
                {doctor.bio ? `${doctor.specialty} – ${doctor.bio}` : doctor.specialty}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

const REASONS = [
  "Specialists, dentists and dietitians under one roof",
  "Straightforward, unhurried appointments",
  "In-house panoramic X-ray",
  "Care coordinated across every team",
];

export function WhySection() {
  return (
    <section className="section" id="why">
      <div className="container">
        <SectionHead heading="Why patients choose us" />
        <div className="why reveal">
          <ul>
            {REASONS.map((reason) => (
              <li key={reason}>
                <span className="check" aria-hidden="true">
                  <CheckIcon />
                </span>
                {reason}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function VisitSection({ settings }: { settings: SettingsDTO }) {
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(settings.mapQuery)}&z=15&output=embed`;
  return (
    <section className="section" id="visit">
      <div className="container">
        <SectionHead heading="Visit us" />
        <div className="visit">
          <AppointmentForm />

          <div className="panel reveal">
            <ul className="contact-list">
              <li>
                <PinIcon aria-hidden />
                {settings.address ?? "[Address]"}
              </li>
              <li>
                <PhoneIcon aria-hidden />
                <a href={telHref(settings.phone)}>{settings.phone}</a>
              </li>
              <li>
                <MailIcon aria-hidden />
                {settings.email ? <a href={`mailto:${settings.email}`}>{settings.email}</a> : "[Email]"}
              </li>
              <li>
                <ClockIcon aria-hidden />
                {settings.openingHours ?? "[Hours]"}
              </li>
            </ul>
            <div className="map">
              <iframe
                title={`Map of ${settings.mapQuery}`}
                src={mapSrc}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
