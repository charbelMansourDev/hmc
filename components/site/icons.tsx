// Inline SVG icons copied from the original markup.

const stroke = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function BrandMark() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round">
      <path d="M6 4.5v11M14 4.5v11M6 10h8" />
    </svg>
  );
}

export function BuildingIcon() {
  return (
    <svg {...stroke}>
      <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-4h6v4M12 8v4M10 10h4" />
    </svg>
  );
}

export function PinIcon(props: { "aria-hidden"?: boolean }) {
  return (
    <svg {...stroke} {...props}>
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}

export function ClockIcon(props: { "aria-hidden"?: boolean }) {
  return (
    <svg {...stroke} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function CalendarIcon() {
  return (
    <svg {...stroke}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </svg>
  );
}

export function PhoneIcon(props: { "aria-hidden"?: boolean }) {
  return (
    <svg {...stroke} {...props}>
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
    </svg>
  );
}

export function MailIcon(props: { "aria-hidden"?: boolean }) {
  return (
    <svg {...stroke} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

export function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16">
      <path
        d="M3.5 8.5 6.5 11.5 12.5 4.5"
        fill="none"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PersonSilhouette() {
  return (
    <svg viewBox="0 0 64 64">
      <circle cx="32" cy="21" r="12" />
      <path d="M8 60c0-14 10.7-23 24-23s24 9 24 23z" />
    </svg>
  );
}
