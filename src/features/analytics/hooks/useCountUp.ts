import { useState, useEffect, useRef } from 'react';

/**
 * Animates a numeric value from its previous settled value to `target`.
 * Uses a cubic ease-out RAF loop for a premium counter feel.
 *
 * @param target   - The value to animate toward
 * @param duration - Animation length in ms (default: 1100)
 * @param enabled  - Set false during loading to hold at 0
 * @param reduced  - Pass `useReducedMotion()` — jumps to target instantly when true
 */
export function useCountUp(
  target: number,
  duration = 1100,
  enabled = true,
  reduced = false,
): number {
  const [displayed, setDisplayed] = useState(0);
  const prevRef = useRef(0);

  useEffect(() => {
    if (!enabled) {
      setDisplayed(0);
      return;
    }
    if (reduced || target === 0) {
      setDisplayed(target);
      prevRef.current = target;
      return;
    }

    const from = prevRef.current;
    prevRef.current = target;

    let startTs: number | null = null;
    let rafId = 0;

    function tick(ts: number) {
      if (startTs === null) startTs = ts;
      const elapsed = ts - startTs;
      const p = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - p) ** 3; // cubic ease-out
      setDisplayed(Math.round(from + (target - from) * eased));
      if (p < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        setDisplayed(target);
      }
    }

    rafId = requestAnimationFrame(tick);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [target, duration, enabled, reduced]);

  return displayed;
}
