import { motion, useReducedMotion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { rv, CARD_VARIANTS } from '@/lib/motion';
import { WidgetEmptyState } from './WidgetEmptyState';
import { ErrorState } from './ErrorState';

// The single canonical shell every Dashboard/Trip Detail widget composes
// into — `rounded-2xl border border-border/50 bg-card p-5`, the majority
// pattern already used across both pages before this component existed.
// Consolidates what were previously divergent per-widget choices of border
// radius/opacity, icon-chip size, entrance motion, and empty/error/loading
// treatment into one place, so a future widget can't silently drift from its
// siblings the way TripBriefCard/TripBookingsSection/WelcomeChecklist did.

interface WidgetCardProps {
  icon?: LucideIcon;
  /** Tailwind classes for the icon chip's background + icon color, e.g.
   *  'bg-primary/10 text-primary'. Defaults to the primary accent. */
  iconClassName?: string;
  title?: string;
  /** Optional header-right slot — e.g. an "Add" pill or "View all" link. */
  headerAction?: React.ReactNode;
  loading?: boolean;
  loadingRows?: number;
  error?: string | null;
  onRetry?: () => void;
  empty?: boolean;
  emptyIcon?: LucideIcon;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

function LoadingRows({ rows }: { rows: number }) {
  return (
    <div className="space-y-2.5" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-4 w-full animate-pulse rounded-lg bg-muted" />
      ))}
    </div>
  );
}

export function WidgetCard({
  icon: Icon,
  iconClassName = 'bg-primary/10 text-primary',
  title,
  headerAction,
  loading,
  loadingRows = 3,
  error,
  onRetry,
  empty,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  emptyAction,
  className,
  children,
}: WidgetCardProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      variants={rv(CARD_VARIANTS, reduced)}
      initial="hidden"
      animate="show"
      className={cn('rounded-2xl border border-border/50 bg-card p-5', className)}
    >
      {(Icon || title || headerAction) && (
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            {Icon && (
              <span
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                  iconClassName,
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
            )}
            {title && <h3 className="truncate text-sm font-semibold text-foreground">{title}</h3>}
          </div>
          {headerAction}
        </div>
      )}

      {loading ? (
        <LoadingRows rows={loadingRows} />
      ) : error ? (
        <ErrorState compact message={error} onRetry={onRetry} />
      ) : empty ? (
        <WidgetEmptyState
          icon={emptyIcon}
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
        />
      ) : (
        children
      )}
    </motion.div>
  );
}
