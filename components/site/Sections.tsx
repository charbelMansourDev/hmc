import * as motion from "motion/react-client";
import Image from "next/image";
import { telHref } from "@/lib/home-content";
import type { DoctorDTO, HomeSection, PublicClinicItem, SettingsDTO } from "@/lib/types";
import { AppointmentForm } from "./AppointmentForm";
import { ClinicCard, FeatureCard, ServiceCard } from "./Cards";
import { ClockIcon, MailIcon, PersonSilhouette, PhoneIcon, PinIcon } from "./icons";
import { cascade, draw, fadeUp, pop, slideIn, VIEWPORT } from "./motion/variants";

// Every block reveals once as it scrolls into view (initial="hidden" ->
// whileInView="show"); children inherit the labels and stagger in.
const reveal = { initial: "hidden", whileInView: "show", viewport: VIEWPORT } as const;

const LIFT = { y: -6, transition: { type: "spring", stiffness: 320, damping: 22 } } as const;

function SectionHead({ heading, lede }: { heading: string; lede?: string | null }) {
  return (
    <motion.div className="section-head" {...reveal} variants={cascade(0.1)}>
      <motion.h2 variants={fadeUp}>{heading}</motion.h2>
      {lede ? <motion.p variants={fadeUp}>{lede}</motion.p> : null}
    </motion.div>
  );
}

export function ServiceSection({ section }: { section: HomeSection }) {
  return (
    <section className="section" id={section.anchor}>
      <div className="container">
        <SectionHead heading={section.heading} lede={section.lede} />
        {section.cards.length > 0 ? (
          <motion.div className={section.wide ? "grid grid--wide" : "grid"} {...reveal} variants={cascade(0.055)}>
            {section.cards.map((item) => (
              <ServiceCard key={item.id} item={item} wide={section.wide} />
            ))}
          </motion.div>
        ) : null}
        {section.features.length > 0 ? (
          <motion.div className="features" {...reveal} variants={cascade(0.12)}>
            {section.features.map((item) => (
              <FeatureCard key={item.id} item={item} />
            ))}
          </motion.div>
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
        <motion.div className="grid grid--wide" {...reveal} variants={cascade(0.08)}>
          {clinics.map((item) => (
            <ClinicCard key={item.id} item={item} />
          ))}
        </motion.div>
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
        <motion.ol className="steps" {...reveal} variants={cascade(0.14)}>
          {STEPS.map((step, i) => (
            <motion.li className="step" key={step.title} variants={fadeUp} whileHover={LIFT}>
              <motion.span className="step-num" variants={pop}>
                {i + 1}
              </motion.span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </motion.li>
          ))}
        </motion.ol>
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
        <motion.div className="team" {...reveal} variants={cascade(0.1)}>
          {doctors.map((doctor) => (
            <motion.article className="member" key={doctor.id} variants={fadeUp} whileHover={LIFT}>
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
            </motion.article>
          ))}
        </motion.div>
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
        <motion.div className="why" {...reveal} variants={fadeUp}>
          <motion.ul variants={cascade(0.12, 0.15)}>
            {REASONS.map((reason) => (
              <motion.li key={reason} variants={slideIn}>
                <motion.span className="check" aria-hidden="true" variants={pop}>
                  <svg viewBox="0 0 16 16">
                    <motion.path
                      d="M3.5 8.5 6.5 11.5 12.5 4.5"
                      fill="none"
                      stroke="#fff"
                      strokeWidth={2.2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      variants={draw}
                    />
                  </svg>
                </motion.span>
                {reason}
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
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
        <motion.div className="visit" {...reveal} variants={cascade(0.12)}>
          <AppointmentForm />

          <motion.div className="panel" variants={fadeUp}>
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
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
