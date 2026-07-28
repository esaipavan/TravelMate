import { useCallback } from 'react';
import { useMotionValue, useSpring, useTransform } from 'framer-motion';
import type { MotionStyle } from 'framer-motion';

interface Use3DTiltOptions {
  /** Max rotation in degrees. Default: 6 */
  maxRot?: number;
  /** Spring damping. Default: 20 */
  damping?: number;
  /** Spring stiffness. Default: 200 */
  stiffness?: number;
}

interface Use3DTiltReturn {
  /** Apply to the motion element's `style` prop */
  style: MotionStyle;
  handleMouseMove: (e: React.MouseEvent<HTMLElement>) => void;
  handleMouseLeave: () => void;
}

/**
 * Reusable 3D tilt effect driven by mouse position.
 * Pass `style` to the motion element and wire up the two event handlers.
 * Skip calling this hook when `useReducedMotion()` is true and omit style/handlers.
 */
export function use3DTilt({
  maxRot = 6,
  damping = 20,
  stiffness = 200,
}: Use3DTiltOptions = {}): Use3DTiltReturn {
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);

  const rotY = useSpring(useTransform(mx, [0, 1], [-maxRot, maxRot]), { damping, stiffness });
  const rotX = useSpring(useTransform(my, [0, 1], [maxRot, -maxRot]), { damping, stiffness });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      mx.set((e.clientX - rect.left) / rect.width);
      my.set((e.clientY - rect.top) / rect.height);
    },
    [mx, my],
  );

  const handleMouseLeave = useCallback(() => {
    mx.set(0.5);
    my.set(0.5);
  }, [mx, my]);

  return {
    style: { rotateY: rotY, rotateX: rotX, transformStyle: 'preserve-3d' },
    handleMouseMove,
    handleMouseLeave,
  };
}
