import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Wallet, ArrowRight, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/formatters';
import { differenceInDays, parseISO } from 'date-fns';
import { getTripStatus } from '@/utils/tripStatus';
import type { TripRow } from '../types';

/* ── TripBudgetCard ───────────────────────────────────────────── */
interface Props {
  trip: TripRow;
}

export function TripBudgetCard({ trip }: Props) {
  const reduced = useReducedMotion();
  const status = getTripStatus(trip);
  const today = parseISO(new Date().toISOString().split('T')[0] + 'T00:00:00');
  const start = parseISO(trip.start_date + 'T00:00:00');
  const end = parseISO(trip.end_date + 'T00:00:00');
  const total = differenceInDays(end, start) + 1;
  const passed = Math.max(0, differenceInDays(today, start));
  const pct = status === 'active' ? Math.min(100, Math.round((passed / total) * 100)) : 0;

  /* No budget set */
  if (trip.total_budget == null) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/60 bg-muted/10 p-6 text-center"
        initial={reduced ? {} : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50">
          <Wallet className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="space-y-0.5">
          <p className="text-sm font-semibold text-foreground">No budget set</p>
          <p className="text-xs text-muted-foreground">Track spending by setting a budget.</p>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link to={`/trips/${trip.id}/budget`}>
            <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
            Set budget
          </Link>
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="flex flex-col gap-4 rounded-2xl border border-border/40 bg-card p-5 shadow-card"
      initial={reduced ? {} : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.22, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileHover={reduced ? {} : { y: -3, boxShadow: '0 12px 36px -8px rgba(0,0,0,0.10)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
            <Wallet className="h-4 w-4 text-primary" />
          </div>
          <span className="text-sm font-semibold text-foreground">Budget</span>
        </div>
        <Link
          to={`/trips/${trip.id}/budget`}
          className="hover:bg-primary/8 flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-primary transition-colors"
          aria-label="Open budget details"
        >
          Details
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Amount */}
      <div>
        <p className="text-3xl font-bold tabular-nums tracking-tight text-foreground">
          {formatCurrency(trip.total_budget, trip.currency)}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">Total trip budget · {trip.currency}</p>
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
        <div className="bg-primary/6 rounded-xl px-3 py-2 text-xs text-primary/80">
          Budget ready for your upcoming trip.
        </div>
      )}
    </motion.div>
  );
}
