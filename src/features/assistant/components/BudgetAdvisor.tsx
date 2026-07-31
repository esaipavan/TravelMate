import { motion, useReducedMotion } from 'framer-motion';
import { Wallet, TrendingUp, TrendingDown, Loader2, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { rv, LIST_VARIANTS, LIST_ITEM_VARIANTS, FADE_VARIANTS } from '@/lib/motion';
import { formatCurrency } from '@/utils/formatters';
import { useBudgetAdvisor } from '../hooks/useBudgetAdvisor';
import type { TripRow } from '@/features/trips/types';
import type { BudgetTip } from '../hooks/useBudgetAdvisor';

const STATUS_META = {
  'on-track': {
    label: 'On Track',
    bar: 'bg-emerald-500',
    badge: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
  'near-limit': {
    label: 'Near Limit',
    bar: 'bg-amber-500',
    badge: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400',
    text: 'text-amber-600 dark:text-amber-400',
  },
  'over-budget': {
    label: 'Over Budget',
    bar: 'bg-rose-500',
    badge: 'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400',
    text: 'text-rose-600 dark:text-rose-400',
  },
};

const TIP_SEVERITY: Record<BudgetTip['severity'], string> = {
  info: 'border-blue-500/20 bg-blue-500/5',
  warning: 'border-amber-500/20 bg-amber-500/5',
  critical: 'border-rose-500/20 bg-rose-500/5',
};

const EXPENSE_CATEGORY_EMOJI: Record<string, string> = {
  accommodation: '🏨',
  food: '🍽️',
  transport: '🚌',
  activities: '🎯',
  shopping: '🛍️',
  health: '💊',
  communication: '📱',
  visa: '📋',
  insurance: '🛡️',
  other: '📦',
};

interface Props {
  trip: TripRow;
}

export function BudgetAdvisor({ trip }: Props) {
  const reduced = useReducedMotion();
  const { budgetAnalysis, categoryBreakdown, tips, isLoading, isAILoading } =
    useBudgetAdvisor(trip);

  if (isLoading) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Loading budget advisor">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    );
  }

  if (!budgetAnalysis) {
    return (
      <motion.div
        className="flex flex-col items-center gap-4 py-16 text-center"
        variants={rv(FADE_VARIANTS, reduced)}
        initial="hidden"
        animate="show"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
          <Wallet className="h-7 w-7 text-muted-foreground" aria-hidden />
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-foreground">No budget set</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Add a total budget to your trip to unlock AI-powered spending analysis and coaching.
          </p>
        </div>
      </motion.div>
    );
  }

  const meta = STATUS_META[budgetAnalysis.status];
  const fmt = (n: number) => formatCurrency(Math.abs(n), budgetAnalysis.currency);

  return (
    <motion.div
      className="space-y-5"
      variants={rv(LIST_VARIANTS, reduced)}
      initial="hidden"
      animate="show"
    >
      {/* Overview card */}
      <motion.div
        variants={rv(LIST_ITEM_VARIANTS, reduced)}
        className="rounded-2xl border border-border/50 bg-card p-5"
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-muted-foreground" aria-hidden />
            <h3 className="text-sm font-bold text-foreground">Budget Overview</h3>
          </div>
          <span
            className={cn(
              'rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
              meta.badge,
            )}
          >
            {meta.label}
          </span>
        </div>

        {/* Budget bar */}
        <div className="mb-2 space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{fmt(budgetAnalysis.totalSpent)} spent</span>
            <span>{Math.round(budgetAnalysis.percentUsed)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn('h-full rounded-full transition-all duration-700', meta.bar)}
              style={{ width: `${Math.min(100, budgetAnalysis.percentUsed)}%` }}
              role="progressbar"
              aria-valuenow={Math.round(budgetAnalysis.percentUsed)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Budget used"
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0</span>
            <span>{fmt(budgetAnalysis.totalBudget)} total</span>
          </div>
        </div>

        {/* Key stats */}
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: 'Remaining', value: fmt(budgetAnalysis.remaining), accent: meta.text },
            { label: 'Days left', value: `${budgetAnalysis.daysRemaining}d`, accent: '' },
            { label: 'Daily plan', value: fmt(budgetAnalysis.dailyAllowance), accent: '' },
            {
              label: 'Daily actual',
              value: fmt(budgetAnalysis.dailyActual),
              accent:
                budgetAnalysis.dailyActual > budgetAnalysis.dailyAllowance
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-emerald-600 dark:text-emerald-400',
            },
          ].map(({ label, value, accent }) => (
            <div key={label} className="rounded-xl bg-muted/40 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {label}
              </p>
              <p
                className={cn('mt-0.5 text-sm font-bold tabular-nums', accent || 'text-foreground')}
              >
                {value}
              </p>
            </div>
          ))}
        </div>

        {budgetAnalysis.status !== 'on-track' && (
          <div className="mt-3 flex items-center justify-between rounded-xl border border-border/40 px-3 py-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {budgetAnalysis.projectedTotal > budgetAnalysis.totalBudget ? (
                <TrendingUp className="h-3.5 w-3.5" aria-hidden />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" aria-hidden />
              )}
              Projected total
            </div>
            <span className={cn('text-sm font-bold tabular-nums', meta.text)}>
              {fmt(budgetAnalysis.projectedTotal)}
            </span>
          </div>
        )}
      </motion.div>

      {/* Category breakdown */}
      {categoryBreakdown.length > 0 && (
        <motion.div variants={rv(LIST_ITEM_VARIANTS, reduced)} className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Spending by Category
          </p>
          <div className="space-y-2">
            {categoryBreakdown.map(({ category, amount, percentage }) => (
              <div key={category} className="flex items-center gap-3">
                <span className="w-5 shrink-0 text-center text-sm" aria-hidden>
                  {EXPENSE_CATEGORY_EMOJI[category] ?? '📦'}
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium capitalize text-foreground">{category}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {fmt(amount)} · {percentage}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary/60"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* AI Tips */}
      <motion.div variants={rv(LIST_ITEM_VARIANTS, reduced)} className="space-y-3">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            AI Budget Tips
          </p>
        </div>
        {isAILoading ? (
          <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-card p-4 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
            <span>Analysing your spending patterns…</span>
          </div>
        ) : tips.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/50 py-6 text-center text-sm text-muted-foreground">
            No AI tips available — check your connection.
          </div>
        ) : (
          <div className="space-y-2">
            {tips.map((tip, i) => (
              <div
                key={i}
                className={cn('rounded-xl border px-4 py-3', TIP_SEVERITY[tip.severity])}
              >
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0 text-base" aria-hidden>
                    {tip.emoji}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-foreground">{tip.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{tip.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
