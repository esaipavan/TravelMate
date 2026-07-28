import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { PAGE_VARIANTS, REDUCED_VARIANTS } from '@/lib/motion';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

/**
 * Lightweight wrapper that applies the standard page enter/exit animation.
 * Respects `prefers-reduced-motion` automatically.
 *
 * Use inside `AnimatePresence` for exit animations, or standalone for
 * simple entrance-only transitions on pages that manage their own layout.
 */
export function PageTransition({ children, className }: PageTransitionProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      variants={reduced ? REDUCED_VARIANTS : PAGE_VARIANTS}
      initial="hidden"
      animate="show"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
}
