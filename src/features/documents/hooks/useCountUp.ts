import { useState, useEffect, useRef } from 'react';

export function useCountUp(
  target: number,
  duration = 1100,
  enabled = true,
  reduced = false,
): number {
  const [value, setValue] = useState(reduced || !enabled ? target : 0);
  const prevRef = useRef(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (reduced) {
      setValue(target);
      prevRef.current = target;
      return;
    }
    if (!enabled) {
      setValue(0);
      return;
    }

    const from = prevRef.current;
    const delta = target - from;
    const start = performance.now();

    function tick(now: number) {
      const p = Math.min((now - start) / duration, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(from + delta * e));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
      else prevRef.current = target;
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration, enabled, reduced]);

  return value;
}
