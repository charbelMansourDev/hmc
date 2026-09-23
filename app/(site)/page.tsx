import { BookingProvider } from "@/components/site/BookingProvider";
import { Hero } from "@/components/site/Hero";
import { RevealObserver } from "@/components/site/RevealObserver";
import {
  ClinicsSection,
  ServiceSection,
  StepsSection,
  TeamSection,
  VisitSection,
  WhySection,
} from "@/components/site/Sections";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getHomeContent } from "@/lib/home";

// Content is edited in the CMS: render on every request, never at build time.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const content = await getHomeContent();

  return (
    <>
      <div className="page-glow" aria-hidden="true"></div>
      <BookingProvider groups={content.bookingGroups} phone={content.settings.phone}>
        <SiteHeader nav={content.nav} />
        <main id="top">
          <Hero settings={content.settings} specialistCount={content.specialistCount} />
          {content.sections.map((section) => (
            <ServiceSection key={section.category} section={section} />
          ))}
          <ClinicsSection clinics={content.clinics} />
          <StepsSection />
          <TeamSection doctors={content.doctors} />
          <WhySection />
          <VisitSection settings={content.settings} />
        </main>
        <SiteFooter nav={content.nav} settings={content.settings} />
      </BookingProvider>
      <RevealObserver />
    </>
  );
}
