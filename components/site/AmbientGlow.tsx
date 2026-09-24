"use client";

import { motion, type Transition } from "motion/react";

const drift = (duration: number, delay = 0): Transition => ({
  duration,
  delay,
  repeat: Infinity,
  repeatType: "mirror",
  ease: "easeInOut",
});

// The soft glow behind the hero, now slowly drifting. The original static glow
// (.page-glow background) is untouched; the orbs sit on top of it and fade out
// towards the bottom. Motion keeps them still under reduced motion.
export function AmbientGlow() {
  return (
    <div className="page-glow" aria-hidden="true">
      <div className="glow-orbs">
        <motion.span
          className="glow-orb glow-orb--teal"
          animate={{ x: [0, 80, -30], y: [0, 50, 110], scale: [1, 1.12, 0.94] }}
          transition={drift(22)}
        />
        <motion.span
          className="glow-orb glow-orb--blue"
          animate={{ x: [0, -90, 30], y: [0, 70, -10], scale: [1, 0.92, 1.1] }}
          transition={drift(26, 1)}
        />
        <motion.span
          className="glow-orb glow-orb--mint"
          animate={{ x: [0, 60, -70], y: [0, -50, 40], scale: [1, 1.15, 1] }}
          transition={drift(30, 2)}
        />
      </div>
    </div>
  );
}
