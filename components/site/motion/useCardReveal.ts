"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { VIEWPORT } from "./variants";

/** Seconds between neighbouring cards in the same row. */
const STEP = 0.07;
/** Cap, so the last card of a wide row never waits too long. */
const MAX_COLUMNS = 5;

/**
 * Per-card scroll reveal. Spread the result onto a motion element that uses the
 * `cardIn` variants: the card animates "hidden" -> "show" when it enters the
 * viewport, delayed by its column within its grid row, so rows still cascade
 * left to right however many columns the breakpoint has.
 *
 * Once revealed the delay is dropped, so returning from the hover lift is
 * instant rather than waiting for the reveal stagger again.
 */
export function useCardReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [delay, setDelay] = useState(0);

  // Measured before the first paint; offsetTop ignores the card's transform.
  useLayoutEffect(() => {
    const el = ref.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;
    let column = 0;
    for (const sibling of Array.from(parent.children) as HTMLElement[]) {
      if (sibling === el) break;
      if (sibling.offsetTop === el.offsetTop) column++;
    }
    setDelay(Math.min(column, MAX_COLUMNS) * STEP);
  }, []);

  const onAnimationComplete = useCallback((definition: unknown) => {
    if (definition === "show") setDelay(0);
  }, []);

  return {
    ref,
    initial: "hidden",
    whileInView: "show",
    viewport: VIEWPORT,
    custom: delay,
    onAnimationComplete,
  } as const;
}
