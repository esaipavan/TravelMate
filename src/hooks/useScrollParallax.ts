import { useScroll, useTransform } from 'framer-motion';
import type { MotionValue } from 'framer-motion';

interface UseScrollParallaxOptions {
  /** Scroll range [start, end] in pixels. Default: [0, 500] */
  inputRange?: [number, number];
  /** Translate output range [from, to] in pixels. Default: [0, 80] */
  outputRange?: [number, number];
}

/**
 * Returns a MotionValue<number> that maps vertical scroll position to a
 * pixel translation — useful for hero parallax images.
 *
 * @example
 * const imgY = useScrollParallax({ inputRange: [0, 500], outputRange: [0, 120] });
 * <motion.img style={{ y: imgY }} />
 */
export function useScrollParallax({
  inputRange = [0, 500],
  outputRange = [0, 80],
}: UseScrollParallaxOptions = {}): MotionValue<number> {
  const { scrollY } = useScroll();
  return useTransform(scrollY, inputRange, outputRange);
}
