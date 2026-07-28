import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { rv, CARD_VARIANTS } from '@/lib/motion';

interface AnalyticsChartCardProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  /** rgb triplet e.g. "99,102,241" for the ambient corner glow */
  accentRgb?: string;
  isEmpty?: boolean;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
}

function EmptyChartState({ message, icon }: { message?: string; icon?: ReactNode }) {
  return (
    <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/50">
      {icon && (
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground">
          {icon}
        </div>
      )}
      <p className="text-sm text-muted-foreground">{message ?? 'No data to display'}</p>
    </div>
  );
}

export function AnalyticsChartCard({
  title,
  subtitle,
  action,
  children,
  className,
  accentRgb,
  isEmpty = false,
  emptyMessage,
  emptyIcon,
}: AnalyticsChartCardProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      variants={rv(CARD_VARIANTS, reduced)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-40px' }}
      className={cn(
        'relative overflow-hidden rounded-2xl border border-border/40 bg-card/60 shadow-card backdrop-blur-sm',
        className,
      )}
    >
      {/* Ambient corner glow */}
      {accentRgb && (
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full blur-3xl"
          style={{ background: `rgba(${accentRgb},0.07)` }}
          aria-hidden="true"
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between px-5 pb-3 pt-5">
        <div className="space-y-0.5">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      {/* Content */}
      <div className="px-5 pb-5">
        {isEmpty ? <EmptyChartState message={emptyMessage} icon={emptyIcon} /> : children}
      </div>
    </motion.div>
  );
}
