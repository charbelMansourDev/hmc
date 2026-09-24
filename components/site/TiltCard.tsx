"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type Variants } from "motion/react";

// Cards reveal through their parent grid's stagger ("hidden" -> "show"). On hover
// they lift, zoom their image (the inner .media-zoom inherits "hover"), tilt
// towards the cursor and catch a soft glare on the photo. Tilt and glare are
// mouse-only and are skipped entirely when the visitor prefers reduced motion.
const variants: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { y: { type: "spring", stiffness: 140, damping: 20 }, opacity: { duration: 0.6 } },
  },
  hover: { y: -6, transition: { type: "spring", stiffness: 320, damping: 22 } },
};

const TILT_SPRING = { stiffness: 180, damping: 18, mass: 0.6 };

type Props = {
  as?: "a" | "article";
  className: string;
  href?: string;
  /** Service id the card preselects in the booking card (read by BookingProvider). */
  service?: string;
  /** Maximum tilt in degrees. */
  tilt?: number;
  children: React.ReactNode;
};

export function TiltCard({ as = "a", className, href, service, tilt = 5, children }: Props) {
  const reduce = useReducedMotion();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(py, [0, 1], [tilt, -tilt]), TILT_SPRING);
  const rotateY = useSpring(useTransform(px, [0, 1], [-tilt, tilt]), TILT_SPRING);

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (reduce || e.pointerType !== "mouse") return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
    // The glare is drawn on the photo only (site.css), in the photo's own coordinates,
    // so the card's text is never washed out.
    const media = card.querySelector<HTMLElement>(".card-media, .feature-media");
    if (media) {
      const m = media.getBoundingClientRect();
      card.style.setProperty("--gx", `${Math.round(e.clientX - m.left)}px`);
      card.style.setProperty("--gy", `${Math.round(e.clientY - m.top)}px`);
    }
  };
  const onPointerLeave = () => {
    px.set(0.5);
    py.set(0.5);
  };

  const shared = {
    className,
    variants,
    whileHover: "hover",
    onPointerMove,
    onPointerLeave,
    style: { rotateX, rotateY, transformPerspective: 1000 },
  };

  if (as === "article") {
    return <motion.article {...shared}>{children}</motion.article>;
  }
  return (
    <motion.a {...shared} href={href} data-service={service}>
      {children}
    </motion.a>
  );
}
