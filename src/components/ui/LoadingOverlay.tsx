import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Plane } from 'lucide-react';
import { APP_NAME } from '@/utils/constants';
import { FADE_VARIANTS, REDUCED_VARIANTS, LOADING_DOT } from '@/lib/motion';

interface LoadingOverlayProps {
  /** Controls visibility — AnimatePresence handles the exit animation */
  show: boolean;
  label?: string;
}

/**
 * Full-screen branded loading overlay for auth guards and async boundaries.
 * Wraps `AnimatePresence` internally so callers only need to toggle `show`.
 */
export function LoadingOverlay({ show, label = 'Loading…' }: LoadingOverlayProps) {
  const reduced = useReducedMotion();

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-5 bg-background"
          variants={reduced ? REDUCED_VARIANTS : FADE_VARIANTS}
          initial="hidden"
          animate="show"
          exit="exit"
          role="status"
          aria-label={label}
          aria-live="polite"
        >
          {/* Branded icon */}
          <motion.div
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-brand shadow-glow"
            animate={reduced ? {} : { y: [0, -6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden="true"
          >
            <Plane className="h-7 w-7 text-white" />
          </motion.div>

          {/* Name + label */}
          <div className="flex flex-col items-center gap-1.5 text-center">
            <span className="text-base font-semibold text-foreground">{APP_NAME}</span>
            <span className="text-sm text-muted-foreground">{label}</span>
          </div>

          {/* Animated dots (hidden when reduced) */}
          {reduced ? null : (
            <div className="flex gap-1.5" aria-hidden="true">
              {([0, 0.15, 0.3] as const).map((delay) => (
                <motion.span
                  key={delay}
                  className="h-1.5 w-1.5 rounded-full bg-primary"
                  animate={{
                    ...LOADING_DOT,
                    transition: { ...(LOADING_DOT.transition as object), delay },
                  }}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
