"use client";

import { MotionConfig } from "motion/react";

/**
 * Honours the visitor's "reduce motion" setting for every Motion animation on
 * the page: movement (transforms, layout) is dropped, gentle fades remain.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
