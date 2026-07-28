import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EASE, SPRING } from '@/lib/motion';

type FeedbackType = 'success' | 'error' | 'warning' | 'info';

interface MotionFeedbackProps {
  type: FeedbackType;
  /** Toggling false triggers the exit animation via AnimatePresence */
  visible?: boolean;
  message?: string;
  className?: string;
}

const FEEDBACK_CONFIG = {
  success: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  error: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
  warning: { icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  info: { icon: Info, color: 'text-primary', bg: 'bg-primary/10' },
} as const;

/**
 * Animated inline feedback banner with enter/exit transitions.
 * Wraps `AnimatePresence` so toggling `visible={false}` plays the exit animation.
 */
export function MotionFeedback({ type, visible = true, message, className }: MotionFeedbackProps) {
  const reduced = useReducedMotion();
  const { icon: Icon, color, bg } = FEEDBACK_CONFIG[type];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={cn(
            'flex items-center gap-2.5 rounded-xl border border-border/40 px-4 py-3 text-sm',
            bg,
            className,
          )}
          initial={reduced ? {} : { opacity: 0, y: -8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduced ? {} : { opacity: 0, y: 4, scale: 0.97 }}
          transition={reduced ? { duration: 0 } : { ...SPRING.snappy }}
          role="alert"
          aria-live="polite"
        >
          <motion.div
            initial={reduced ? {} : { scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={
              reduced
                ? { duration: 0 }
                : { type: 'spring', damping: 16, stiffness: 380, delay: 0.06 }
            }
            aria-hidden="true"
          >
            <Icon className={cn('h-4 w-4 shrink-0', color)} />
          </motion.div>

          {message && <span className="text-foreground">{message}</span>}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Animated success checkmark ring ────────────────────────────── */

interface SuccessRingProps {
  size?: number;
}

/**
 * SVG checkmark with a circular stroke animation.
 * Use after completing a significant action (e.g. trip saved, export done).
 */
export function SuccessRing({ size = 48 }: SuccessRingProps) {
  const reduced = useReducedMotion();
  const circumference = 2 * Math.PI * 20; // r=20

  return (
    <div className="relative" style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 48 48" className="absolute inset-0 h-full w-full -rotate-90">
        {/* Circle stroke */}
        <motion.circle
          cx="24"
          cy="24"
          r="20"
          fill="none"
          strokeWidth="2.5"
          className="stroke-emerald-500"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: reduced ? 0 : circumference, opacity: 0 }}
          animate={{ strokeDashoffset: 0, opacity: 1 }}
          transition={reduced ? { duration: 0 } : { duration: 0.5, ease: EASE.out, delay: 0.1 }}
        />
      </svg>

      {/* Checkmark drawn separately (needs normal rotation) */}
      <svg viewBox="0 0 48 48" className="absolute inset-0 h-full w-full">
        <motion.path
          d="M15 24l6.5 6.5L33 18"
          fill="none"
          strokeWidth="2.5"
          className="stroke-emerald-500"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="22"
          initial={{ strokeDashoffset: reduced ? 0 : 22, opacity: 0 }}
          animate={{ strokeDashoffset: 0, opacity: 1 }}
          transition={reduced ? { duration: 0 } : { duration: 0.32, ease: EASE.out, delay: 0.48 }}
        />
      </svg>
    </div>
  );
}
