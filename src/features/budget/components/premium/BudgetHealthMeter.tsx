import { motion, useReducedMotion } from 'framer-motion';
import { differenceInDays, parseISO, isAfter, isBefore } from 'date-fns';
import { Activity, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { rv, CARD_VARIANTS } from '@/lib/motion';
import { formatCurrency } from '@/utils/formatters';
import type { BudgetSummary } from '../../types';

interface Props {
  summary: BudgetSummary;
  tripStartDate: string;
  tripEndDate: string;
}

type Health = 'healthy' | 'warning' | 'danger';

function computeHealth(paceRatio: number, overBudget: boolean): Health {
  if (overBudget) return 'danger';
  if (paceRatio >= 1.25) return 'danger';
  if (paceRatio >= 1.05) return 'warning';
  return 'healthy';
}

const HEALTH_CONFIG = {
  healthy: {
    label: 'On track',
    color: '#10b981',
    barColor: 'bg-emerald-500',
    textColor: 'text-emerald-500',
    Icon: TrendingDown,
  },
  warning: {
    label: 'Spending fast',
    color: '#f59e0b',
    barColor: 'bg-amber-500',
    textColor: 'text-amber-500',
    Icon: TrendingUp,
  },
  danger: {
    label: 'Over pace',
    color: '#f43f5e',
    barColor: 'bg-rose-500',
    textColor: 'text-rose-500',
    Icon: TrendingUp,
  },
};

interface AnimBar {
  pct: number;
  colorClass: string;
  reduced: boolean | null;
}

function AnimatedBar({ pct, colorClass, reduced }: AnimBar) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60">
      <motion.div
        className={cn('h-full rounded-full', colorClass)}
        initial={{ width: '0%' }}
        animate={{ width: `${pct}%` }}
        transition={
          reduced ? { duration: 0 } : { duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }
        }
      />
    </div>
  );
}

export function BudgetHealthMeter({ summary, tripStartDate, tripEndDate }: Props) {
  const reduced = useReducedMotion();

  const budget = summary.tripBudget ?? summary.totalAllocated;
  const fmt = (n: number) => formatCurrency(n, summary.tripCurrency);

  if (!tripStartDate || !tripEndDate || budget <= 0 || summary.totalSpent === 0) return null;

  const today = new Date();
  const start = parseISO(tripStartDate);
  const end = parseISO(tripEndDate);
  const totalDays = Math.max(differenceInDays(end, start) + 1, 1);

  if (isBefore(today, start)) return null;

  const tripEnded = isAfter(today, end);
  const daysElapsed = tripEnded
    ? totalDays
    : Math.min(Math.max(differenceInDays(today, start) + 1, 1), totalDays);
  const tripProgress = daysElapsed / totalDays;
  const expectedSpend = budget * tripProgress;
  const paceRatio = expectedSpend > 0 ? summary.totalSpent / expectedSpend : 0;
  const projected =
    tripProgress > 0 ? Math.round(summary.totalSpent / tripProgress) : summary.totalSpent;
  const overBudget = summary.remaining < 0;

  const health = computeHealth(paceRatio, overBudget);
  const cfg = HEALTH_CONFIG[health];
  const HealthIcon = cfg.Icon;

  const tripPct = Math.round(tripProgress * 100);
  const spendPct = budget > 0 ? Math.min(Math.round((summary.totalSpent / budget) * 100), 100) : 0;

  const insight = overBudget
    ? `Exceeded budget by ${fmt(Math.abs(summary.remaining))}.`
    : !tripEnded && projected > budget
      ? `At this pace you'll overspend by ${fmt(projected - budget)} â€” consider cutting back.`
      : !tripEnded && projected < budget * 0.85
        ? `Great pace â€” you should finish well under budget.`
        : tripEnded
          ? `Trip complete. You ${summary.remaining >= 0 ? 'saved' : 'overspent by'} ${fmt(Math.abs(summary.remaining))}.`
          : `You're spending at about the expected rate. Keep it up!`;

  return (
    <motion.div
      variants={rv(CARD_VARIANTS, reduced)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-20px' }}
      className="relative overflow-hidden rounded-2xl border border-border/40 bg-card/60 p-5 backdrop-blur-sm"
    >
      {/* Corner accent */}
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-3xl"
        style={{ background: `${cfg.color}18` }}
        aria-hidden="true"
      />

      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/60">
            <Activity className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </div>
          <p className="text-sm font-semibold text-foreground">Spending Health</p>
        </div>
        <div className={cn('flex items-center gap-1.5 text-sm font-semibold', cfg.textColor)}>
          <HealthIcon className="h-4 w-4" aria-hidden="true" />
          {cfg.label}
        </div>
      </div>

      {/* Progress bars */}
      <div className="space-y-3">
        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
            <span>Trip progress</span>
            <span className="font-medium tabular-nums">
              Day {daysElapsed} of {totalDays} Â· {tripPct}%
            </span>
          </div>
          <AnimatedBar pct={tripPct} colorClass="bg-blue-500" reduced={reduced} />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
            <span>Budget consumed</span>
            <span className="font-medium tabular-nums">
              {fmt(summary.totalSpent)} / {fmt(budget)} Â· {spendPct}%
            </span>
          </div>
          <AnimatedBar pct={spendPct} colorClass={cfg.barColor} reduced={reduced} />
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border/40 pt-4">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Expected
          </p>
          <p className="mt-1 text-sm font-semibold tabular-nums">
            {fmt(Math.round(expectedSpend))}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Actual
          </p>
          <p
            className={cn(
              'mt-1 text-sm font-semibold tabular-nums',
              summary.totalSpent > expectedSpend * 1.05 ? 'text-amber-500' : '',
            )}
          >
            {fmt(summary.totalSpent)}
          </p>
        </div>
        {!tripEnded && (
          <div>
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Projected
            </p>
            <p
              className={cn(
                'mt-1 text-sm font-semibold tabular-nums',
                projected > budget ? 'text-rose-500' : 'text-emerald-500',
              )}
            >
              {fmt(projected)}
            </p>
          </div>
        )}
      </div>

      {/* Insight */}
      <p className="mt-3 text-xs text-muted-foreground">{insight}</p>
    </motion.div>
  );
}
