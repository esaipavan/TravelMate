import { useEffect, useRef, useState } from 'react';

/**
 * Animates a number from 0 (or previous value) to `target` using
 * a cubic ease-out curve driven by requestAnimationFrame.
 *
 * @param target   - The number to count up to
 * @param duration - Animation duration in ms (default 1100)
 * @param enabled  - Start the animation when true (false holds at 0)
 * @param reduced  - When true, returns target instantly (prefers-reduced-motion)
 */
export function useCountUp(
  target: number,
  duration = 1100,
  enabled = true,
  reduced = false,
): number {
  const [count, setCount] = useState(reduced ? target : 0);
  const prevRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      setCount(0);
      return;
    }
    if (reduced) {
      setCount(target);
      prevRef.current = target;
      return;
    }

    const from = prevRef.current;
    const range = target - from;
    const start = performance.now();

    function tick(now: number) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // cubic ease-out
      const current = Math.round(from + range * eased);
      setCount(current);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        prevRef.current = target;
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, enabled, reduced]);

  return count;
}
