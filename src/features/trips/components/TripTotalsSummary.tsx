import { BedDouble, TrainFront, Bus, Plane, Car, Receipt } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import type { BookingDraft, BookingMode } from '@/features/hotels/types';
import type { TripRow } from '../types';
import { computeTripTotals, computeBudgetView, MODE_ORDER, MODE_LABEL } from '../utils/tripTotals';

interface Props {
  /** Attached bookings for THIS trip (already filtered by the caller). */
  bookings: BookingDraft[];
  trip: TripRow;
}

const MODE_ICON: Record<BookingMode, LucideIcon> = {
  hotel: BedDouble,
  train: TrainFront,
  bus: Bus,
  flight: Plane,
  local: Car,
};

/**
 * Live rollup of a trip's attached bookings: total spend, per-mode breakdown,
 * booking count, and — when the trip has a budget in the same currency — a
 * remaining-balance view. All figures are derived from real attached drafts.
 */
export function TripTotalsSummary({ bookings, trip }: Props) {
  const totals = computeTripTotals(bookings, trip.currency);
  const primary = totals.primary;
  if (!primary) return null; // nothing attached — caller shows its empty state

  const budget = computeBudgetView(totals, trip.total_budget, trip.currency);

  return (
    <div className="mb-4 rounded-xl border border-border/50 bg-background/40 p-4">
      {/* Headline: total booked + count */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <Receipt className="h-3.5 w-3.5" aria-hidden />
            Total booked
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-foreground">
            {formatCurrency(primary.total, primary.currency)}
          </p>
          {primary.confirmedTotal > 0 && (
            <p className="mt-0.5 text-xs text-emerald-600 dark:text-emerald-400">
              {formatCurrency(primary.confirmedTotal, primary.currency)} confirmed
              {primary.confirmedTotal < primary.total && (
                <span className="text-muted-foreground">
                  {' · '}
                  {formatCurrency(primary.total - primary.confirmedTotal, primary.currency)} planned
                </span>
              )}
            </p>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{totals.count}</span> active booking
          {totals.count !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Per-mode breakdown — only modes that actually have bookings */}
      <div className="mt-3 flex flex-wrap gap-2">
        {MODE_ORDER.filter((m) => primary.byMode[m]).map((m) => {
          const Icon = MODE_ICON[m];
          const md = primary.byMode[m]!;
          return (
            <span
              key={m}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/50 bg-card px-2.5 py-1 text-xs"
            >
              <Icon className="h-3.5 w-3.5 text-primary/70" aria-hidden />
              <span className="text-muted-foreground">{MODE_LABEL[m]}</span>
              <span className="font-semibold tabular-nums text-foreground">
                {formatCurrency(md.total, primary.currency)}
              </span>
            </span>
          );
        })}
      </div>

      {/* Budget view — only when a budget exists in the same currency */}
      {budget && (
        <div className="mt-4 space-y-1.5 border-t border-border/50 pt-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              Budget {formatCurrency(budget.budget, primary.currency)}
            </span>
            <span
              className={
                budget.overBudget
                  ? 'font-semibold text-destructive'
                  : 'font-semibold text-emerald-600 dark:text-emerald-400'
              }
            >
              {budget.overBudget
                ? `${formatCurrency(Math.abs(budget.remaining), primary.currency)} over`
                : `${formatCurrency(budget.remaining, primary.currency)} left`}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted/50">
            <div
              className={`h-full rounded-full ${
                budget.overBudget ? 'bg-destructive' : 'bg-gradient-to-r from-primary to-violet-500'
              }`}
              style={{ width: `${budget.fraction * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Extra-currency subtotals — kept separate, never merged into the total above */}
      {totals.mixedCurrency && (
        <div className="mt-3 border-t border-border/50 pt-3">
          <p className="text-[11px] text-muted-foreground">
            Also booked in other currencies (shown separately, not converted):
          </p>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {totals.groups.slice(1).map((g) => (
              <span
                key={g.currency}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border/50 bg-card px-2.5 py-1 text-xs"
              >
                <span className="font-semibold tabular-nums text-foreground">
                  {formatCurrency(g.total, g.currency)}
                </span>
                <span className="text-muted-foreground">
                  · {g.count} booking{g.count !== 1 ? 's' : ''}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
