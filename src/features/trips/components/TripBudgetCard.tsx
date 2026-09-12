import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Wallet, ArrowRight, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WidgetCard } from '@/components/shared/WidgetCard';
import { formatCurrency } from '@/utils/formatters';
import { getTripStatus, getTripProgress } from '@/utils/tripStatus';
import type { TripRow } from '../types';

/* ── TripBudgetCard ───────────────────────────────────────────── */
interface Props {
  trip: TripRow;
}

export function TripBudgetCard({ trip }: Props) {
  const reduced = useReducedMotion();
  const status = getTripStatus(trip);
  const { percent } = getTripProgress(trip);
  const pct = status === 'active' ? percent : 0;

  /* No budget set */
  if (trip.total_budget == null) {
    return (
      <WidgetCard
        icon={Wallet}
        title="Budget"
        empty
        emptyIcon={Wallet}
        emptyTitle="No budget set"
        emptyDescription="Track spending by setting a budget."
        emptyAction={
          <Button asChild size="sm" variant="outline">
            <Link to={`/trips/${trip.id}/budget`}>
              <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
              Set budget
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <WidgetCard
      icon={Wallet}
      title="Budget"
      headerAction={
        <Link
          to={`/trips/${trip.id}/budget`}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
          aria-label="Open budget details"
        >
          Details
          <ArrowRight className="h-3 w-3" />
        </Link>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Amount */}
        <div>
          <p className="text-3xl font-bold tabular-nums tracking-tight text-foreground">
            {formatCurrency(trip.total_budget, trip.currency)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Total trip budget · {trip.currency}
          </p>
        </div>

        {/* Progress bar — only for active trips */}
        {status === 'active' && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Trip progress</span>
              <span className="font-medium tabular-nums">{pct}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted/50">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary to-violet-500"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: pct / 100 }}
                style={{ transformOrigin: 'left' }}
                transition={
                  reduced ? { duration: 0 } : { duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }
                }
              />
            </div>
          </div>
        )}

        {/* Upcoming: days until trip */}
        {status === 'upcoming' && (
          <div className="rounded-xl bg-primary/5 px-3 py-2 text-xs text-primary/80">
            Budget ready for your upcoming trip.
          </div>
        )}
      </div>
    </WidgetCard>
  );
}
