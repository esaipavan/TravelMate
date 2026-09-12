import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { EASE } from '@/lib/motion';

// Single ring/donut primitive, replacing two independent hand-built SVGs
// that had drifted to different proportions for the same idea:
// TripCommandHero's countdown ring (r=42, strokeWidth=6, white/60 label on a
// photo) and BudgetDonut's spend donut (r=52, strokeWidth=10, foreground
// label on a card). `variant` picks the on-photo vs on-card text/track
// treatment; `accent` is a real CSS color (e.g. `hsl(var(--primary))`) for
// the progress stroke — never a hardcoded hex, so it follows the app's own
// theme tokens instead of drifting from them the way BudgetDonut's
// `#EF4444`/`#6366F1` had.

interface ProgressRingProps {
  /** 0–1 */
  progress: number;
  radius?: number;
  strokeWidth?: number;
  accent: string;
  label?: string;
  variant?: 'light' | 'dark';
  reduced: boolean | null;
  delay?: number;
  duration?: number;
  className?: string;
}

export function ProgressRing({
  progress,
  radius = 48,
  strokeWidth = 8,
  accent,
  label,
  variant = 'light',
  reduced,
  delay = 0.3,
  duration = 1.2,
  className,
}: ProgressRingProps) {
  const clamped = Math.min(Math.max(progress, 0), 1);
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped);
  const viewBoxSize = (radius + strokeWidth) * 2;
  const center = viewBoxSize / 2;
  const diameterPx = viewBoxSize;

  const isDark = variant === 'dark';

  return (
    <div
      className={cn('relative shrink-0', className)}
      style={{ height: diameterPx, width: diameterPx }}
      aria-label={
        label ? `${label}: ${Math.round(clamped * 100)}%` : `${Math.round(clamped * 100)}%`
      }
    >
      <svg
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        className="h-full w-full -rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={isDark ? 'rgba(255,255,255,0.15)' : 'currentColor'}
          className={isDark ? undefined : 'text-muted-foreground/20'}
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={accent}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={reduced ? { duration: 0 } : { duration, ease: EASE.out, delay }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span
          className={cn(
            'font-bold tabular-nums leading-none',
            isDark ? 'text-lg text-white' : 'text-xl text-foreground',
          )}
        >
          {Math.round(clamped * 100)}%
        </span>
        {label && (
          <span
            className={cn(
              'mt-0.5 leading-none',
              isDark ? 'text-[9px] text-white/60' : 'text-[10px] text-muted-foreground',
            )}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
