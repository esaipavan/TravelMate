import { motion, useReducedMotion } from 'framer-motion';
import { Plane } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LOADING_DOT } from '@/lib/motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export function LoadingSpinner({
  size = 'md',
  className,
  label = 'Loading...',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-[3px]',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-primary/20 border-t-primary',
          sizeClasses[size],
        )}
        role="status"
        aria-label={label}
      />
      {size === 'lg' && <p className="text-sm text-muted-foreground">{label}</p>}
    </div>
  );
}

/**
 * Branded full-page loading state used while lazy chunks and auth resolve.
 * Replaces the plain spinner with a motion-aware TravelMate identity mark.
 */
export function PageLoader() {
  const reduced = useReducedMotion();

  return (
    <div
      className="flex min-h-[60vh] flex-col items-center justify-center gap-5"
      role="status"
      aria-label="Loading"
    >
      {/* Brand icon */}
      <motion.div
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand shadow-glow"
        animate={reduced ? {} : { y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden="true"
      >
        <Plane className="h-6 w-6 text-white" />
      </motion.div>

      {/* Reduced-motion: plain text; otherwise: pulsing dots */}
      {reduced ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
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

      <span className="sr-only">Loading…</span>
    </div>
  );
}
