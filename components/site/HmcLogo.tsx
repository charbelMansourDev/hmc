// The clinic's logo: the client's "HMC" artwork (doctor, HMC + tooth, name,
// specialties and doctors), redrawn as vectors in the site's palette. The
// text is set in the site's Inter and coloured by the theme tokens (see
// .hmc-logo in site.css), so it follows the dark/light toggle; the icons
// carry the brand gradient in both themes.
//
// `id` must be unique on the page: it namespaces the gradient definitions.

const iconStroke = {
  fill: "none",
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

function BrandGradient({ id, x2, y2 }: { id: string; x2: number; y2: number }) {
  return (
    <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={x2} y2={y2}>
      <stop offset="0" stopColor="#5aa9f5" />
      <stop offset="0.55" stopColor="#2f86e6" />
      <stop offset="1" stopColor="#22a6a0" />
    </linearGradient>
  );
}

/** Doctor with a stethoscope in a portrait frame, drawn on a 100 × 120 grid. */
function Doctor() {
  return (
    <>
      <rect x="3" y="3" width="94" height="115.5" rx="10" />
      <path d="M28.6 36.8C27.6 19.8 37.4 9 49.2 9C61 9 70.8 19.6 69.8 36.6" />
      <path d="M28.6 36.8C24.6 35.8 22.4 38.6 23.2 42.2C24 45.6 26.8 47 29.9 46.2C32.1 56.6 39.7 64.6 49.2 64.6C58.7 64.6 66.3 56.6 68.5 46.2C71.6 47 74.4 45.4 75.2 42C76 38.4 73.8 35.6 69.8 36.6" />
      <path d="M29.2 33.2C33.4 29.6 36.8 25 39.4 19.6C42.2 25.8 48.6 28.4 56.4 29.6C62.4 30.6 66.8 32.8 69.6 36.2" />
      <path d="M38.8 60.4V70.4L49.2 88.6L59.6 70.4V60.4" />
      <path d="M38.8 70.4C31 72.6 22.8 75.2 17.4 80C11.6 85.2 8.8 94 8.8 109" />
      <path d="M59.6 70.4C67.4 72.6 75.6 75.2 81 80C86.8 85.2 89.6 94 89.6 109" />
      <path d="M28.4 73.9V87" />
      <path d="M22.6 104H19.6V96.6C19.6 91.2 23.6 87 28.4 87C33.2 87 37.2 91.2 37.2 96.6V104H34.2" />
      <path d="M69.9 73.9V89.8" />
      <circle cx="69.9" cy="97" r="7.2" />
    </>
  );
}

/** Molar outline, drawn on a 64 × 64 grid. */
function Tooth() {
  return (
    <path d="M32.2 10.4C35.6 6.6 39.4 4.6 44.2 4.6C52 4.6 57.6 10.6 57.6 19.2C57.6 27.4 54 33.6 51 41.2C48.6 47.4 47.8 53.6 46.2 58.2C45.2 61.2 41.4 61.4 40.4 58.2C39 53.6 37.8 42.2 32 42.2C26.2 42.2 25 53.6 23.6 58.2C22.6 61.4 18.8 61.2 17.8 58.2C16.2 53.6 15.4 47.4 13 41.2C10 33.6 6.4 27.4 6.4 19.2C6.4 10.6 12 4.6 19.8 4.6C25.4 4.6 28.8 7.4 32.2 10.4C34.4 12.4 36 13.6 38.6 13.6" />
  );
}

/** The full logo, as the client supplied it (footer). */
export function HmcLogo({ id }: { id: string }) {
  return (
    <svg
      className="hmc-logo"
      viewBox="0 0 450 206"
      role="img"
      aria-label="HMC, Hajj Medical Center Naccache, Medical & Dental Clinics. Dr. Marcel Hajj M.D., Dr. Gregory Hage"
    >
      <defs>
        <BrandGradient id={`${id}-doctor`} x2={100} y2={120} />
        <BrandGradient id={`${id}-tooth`} x2={64} y2={64} />
      </defs>
      <g transform="translate(5 17.5) scale(1.41)" stroke={`url(#${id}-doctor)`} strokeWidth={3.2} {...iconStroke}>
        <Doctor />
      </g>
      <g transform="translate(336 -3.5) scale(1.41)" stroke={`url(#${id}-tooth)`} strokeWidth={3} {...iconStroke}>
        <Tooth />
      </g>
      <text className="hmc-ink" x="155" y="77" fontSize="79" letterSpacing="-2.2">
        HMC
      </text>
      <text className="hmc-ink-2" x="156" y="99.5" fontSize="19">
        Hajj Medical Center Naccache
      </text>
      <text className="hmc-accent" x="156" y="126" fontSize="24.2">
        Medical &amp; Dental Clinics
      </text>
      <text className="hmc-ink" x="155" y="158.5" fontSize="29.5" fontWeight="800">
        Dr. Marcel Hajj M.D.
      </text>
      <text className="hmc-ink" x="155" y="190" fontSize="29.5" fontWeight="800">
        Dr. Gregory Hage
      </text>
    </svg>
  );
}

/** Header version: the doctor, "HMC" + tooth, and the name underneath. Decorative (the link is labelled). */
export function HmcLogoCompact({ id }: { id: string }) {
  return (
    <svg className="hmc-logo" viewBox="0 0 196 50" aria-hidden="true" focusable="false">
      <defs>
        <BrandGradient id={`${id}-doctor`} x2={100} y2={120} />
        <BrandGradient id={`${id}-tooth`} x2={64} y2={64} />
      </defs>
      <g transform="translate(0.6 0.6) scale(0.405)" stroke={`url(#${id}-doctor)`} strokeWidth={4.6} {...iconStroke}>
        <Doctor />
      </g>
      <text className="hmc-ink" x="50" y="27" fontSize="30" fontWeight="500" letterSpacing="-0.8">
        HMC
      </text>
      <g transform="translate(119.5 -1.2) scale(0.44)" stroke={`url(#${id}-tooth)`} strokeWidth={4.8} {...iconStroke}>
        <Tooth />
      </g>
      <text className="hmc-ink-2" x="50.5" y="45" fontSize="12.5" fontWeight="500" letterSpacing="0.05">
        Hajj Medical Center
      </text>
    </svg>
  );
}
