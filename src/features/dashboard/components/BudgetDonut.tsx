import { Link } from 'react-router-dom';
import { useReducedMotion } from 'framer-motion';
import { ArrowRight, PiggyBank } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/formatters';
import { useBudget } from '@/features/budget/hooks/useBudget';
import { WidgetCard } from '@/components/shared/WidgetCard';
import { ProgressRing } from '@/components/shared/ProgressRing';
import { useDashboardStats, useCurrentTrip } from '../hooks/useDashboard';

interface RowProps {
  label: string;
  value: string;
  className?: string;
}

function StatRow({ label, value, className }: RowProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="truncate text-xs text-muted-foreground">{label}</span>
      <span className={cn('shrink-0 text-xs font-semibold tabular-nums', className)}>{value}</span>
    </div>
  );
}

export function BudgetDonut() {
  const reduced = useReducedMotion();
  const { data: stats } = useDashboardStats();
  const { data: trip } = useCurrentTrip();
  // Current-trip-scoped budget/spend for the Daily avg + Forecast rows. Reuses
  // the existing per-trip calculation (getBudgetData) so those metrics reflect
  // only the active trip, not the global all-trips totals in `stats`.
  const { data: budget } = useBudget(trip?.id ?? '');

  if (!stats || stats.totalBudget === 0) {
    return (
      <WidgetCard
        icon={PiggyBank}
        title="Budget Overview"
        empty
        emptyIcon={PiggyBank}
        emptyTitle="No budget set yet"
        emptyAction={
          <Link to="/trips" className="text-xs text-primary hover:underline">
            Set a budget →
          </Link>
        }
      />
    );
  }

  const { totalBudget, totalExpenses, homeCurrency } = stats;
  const pct = totalBudget > 0 ? totalExpenses / totalBudget : 0;
  const remaining = totalBudget - totalExpenses;
  const isOver = totalExpenses > totalBudget;
  // Real theme tokens, not hardcoded hex — follows the app's own destructive
  // (over-budget) / primary (on-track) colors instead of drifting from them.
  const accent = isOver ? 'hsl(var(--destructive))' : 'hsl(var(--primary))';
  const fmt = (n: number) => formatCurrency(n, homeCurrency);

  let dailyAvg: number | null = null;
  let forecast: number | null = null;
  let forecastOverBudget = false;
  // Daily avg / forecast are current-trip metrics: use the active trip's own
  // spend (not the global `totalExpenses`) and compare the forecast against the
  // active trip's own budget (not the global `totalBudget`).
  if (trip && budget) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = parseISO(trip.start_date + 'T00:00:00');
    const end = parseISO(trip.end_date + 'T00:00:00');
    const elapsed = Math.max(1, differenceInDays(today, start) + 1);
    const total = Math.max(1, differenceInDays(end, start) + 1);
    const tripSpent = budget.summary.totalSpent;
    const tripBudget = trip.total_budget;
    dailyAvg = tripSpent / elapsed;
    forecast = dailyAvg * total;
    forecastOverBudget = tripBudget !== null && tripBudget > 0 && forecast > tripBudget;
  }

  return (
    <WidgetCard icon={PiggyBank} title="Budget Overview">
      <div className="flex items-center gap-5">
        <ProgressRing
          progress={pct}
          label="spent"
          accent={accent}
          radius={52}
          strokeWidth={10}
          reduced={reduced}
        />

        <div className="min-w-0 flex-1 space-y-2.5">
          <StatRow label="Total budget" value={fmt(totalBudget)} className="text-foreground" />
          <StatRow
            label="Spent"
            value={fmt(totalExpenses)}
            className={isOver ? 'font-semibold text-rose-500' : 'text-foreground'}
          />
          <StatRow
            label={isOver ? 'Over by' : 'Remaining'}
            value={fmt(Math.abs(remaining))}
            className={isOver ? 'text-rose-500' : 'text-emerald-500'}
          />
          {dailyAvg !== null && (
            <StatRow label="Daily avg" value={fmt(dailyAvg)} className="text-muted-foreground" />
          )}
          {forecast !== null && (
            <StatRow
              label="Forecast"
              value={fmt(forecast)}
              className={cn('text-muted-foreground', forecastOverBudget && 'text-amber-500')}
            />
          )}
        </div>
      </div>

      <div className="mt-4 border-t border-border/50 pt-3">
        <Link
          to="/analytics"
          className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary"
        >
          View full analytics
          <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </div>
    </WidgetCard>
  );
}
