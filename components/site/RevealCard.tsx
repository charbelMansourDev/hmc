"use client";

import { motion } from "motion/react";
import { useCardReveal } from "./motion/useCardReveal";
import { cardIn } from "./motion/variants";

// A card without tilt (steps, team members): fades up on its own as it scrolls
// into view, staggered by its column, and lifts on hover. Children with their
// own variants (e.g. the step number's "pop") follow its "show".
export function RevealCard({
  as,
  className,
  children,
}: {
  as: "li" | "article";
  className: string;
  children: React.ReactNode;
}) {
  const { ref, ...reveal } = useCardReveal<HTMLElement>();
  const props = { ...reveal, className, variants: cardIn, whileHover: "hover" };

  if (as === "li") {
    return (
      <motion.li ref={ref as React.Ref<HTMLLIElement>} {...props}>
        {children}
      </motion.li>
    );
  }
  return (
    <motion.article ref={ref as React.Ref<HTMLElement>} {...props}>
      {children}
    </motion.article>
  );
}
