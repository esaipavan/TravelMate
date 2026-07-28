import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, PiggyBank } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { rv, CARD_VARIANTS } from '@/lib/motion';
import { formatCurrency } from '@/utils/formatters';
import { useDashboardStats, useCurrentTrip } from '../hooks/useDashboard';

const R = 52;
const CIRC = 2 * Math.PI * R;

interface DonutProps {
  pct: number;
  accent: string;
  reduced: boolean | null;
}

function DonutChart({ pct, accent, reduced }: DonutProps) {
  const clamped = Math.min(Math.max(pct, 0), 1);
  const offset = CIRC * (1 - clamped);

  return (
    <div className="relative h-32 w-32 shrink-0">
      <svg viewBox="0 0 130 130" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle
          cx="65"
          cy="65"
          r={R}
          fill="none"
          stroke="currentColor"
          className="text-muted-foreground/20"
          strokeWidth="10"
        />
        <motion.circle
          cx="65"
          cy="65"
          r={R}
          fill="none"
          stroke={accent}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          initial={{ strokeDashoffset: CIRC }}
          animate={{ strokeDashoffset: offset }}
          transition={
            reduced ? { duration: 0 } : { duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }
          }
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold tabular-nums text-foreground">
          {Math.round(clamped * 100)}%
        </span>
        <span className="text-[10px] text-muted-foreground">spent</span>
      </div>
    </div>
  );
}

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

  if (!stats || stats.totalBudget === 0) {
    return (
      <motion.section
        aria-label="Budget overview"
        className="flex min-h-[160px] flex-col items-center justify-center gap-3 rounded-2xl border border-border/50 bg-card p-5"
        variants={rv(CARD_VARIANTS, reduced)}
        initial="hidden"
        animate="show"
      >
        <PiggyBank className="h-8 w-8 text-muted-foreground/40" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">No budget set yet.</p>
        <Link to="/trips" className="text-xs text-primary hover:underline">
          Set a budget →
        </Link>
      </motion.section>
    );
  }

  const { totalBudget, totalExpenses, homeCurrency } = stats;
  const pct = totalBudget > 0 ? totalExpenses / totalBudget : 0;
  const remaining = totalBudget - totalExpenses;
  const isOver = totalExpenses > totalBudget;
  const accent = isOver ? '#EF4444' : '#6366F1';
  const fmt = (n: number) => formatCurrency(n, homeCurrency);

  let dailyAvg: number | null = null;
  let forecast: number | null = null;
  if (trip) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = parseISO(trip.start_date + 'T00:00:00');
    const end = parseISO(trip.end_date + 'T00:00:00');
    const elapsed = Math.max(1, differenceInDays(today, start) + 1);
    const total = Math.max(1, differenceInDays(end, start) + 1);
    dailyAvg = totalExpenses / elapsed;
    forecast = dailyAvg * total;
  }

  return (
    <motion.section
      aria-label="Budget overview"
      className="rounded-2xl border border-border/50 bg-card p-5"
      variants={rv(CARD_VARIANTS, reduced)}
      initial="hidden"
      animate="show"
    >
      <div className="mb-4 flex items-center gap-2">
        <PiggyBank className="h-4 w-4 text-primary" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-foreground">Budget Overview</h2>
      </div>

      <div className="flex items-center gap-5">
        <DonutChart pct={pct} accent={accent} reduced={reduced} />

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
              className={cn('text-muted-foreground', forecast > totalBudget && 'text-amber-500')}
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
    </motion.section>
  );
}
