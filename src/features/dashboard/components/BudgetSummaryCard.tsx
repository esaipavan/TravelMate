import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Wallet, TrendingUp, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/formatters';
import { useDashboardStats } from '../hooks/useDashboard';

export function BudgetSummaryCard() {
  const reduced = useReducedMotion();
  const { data: stats, isLoading } = useDashboardStats();

  const budget = stats?.totalBudget ?? 0;
  const spent = stats?.totalExpenses ?? 0;
  const currency = stats?.homeCurrency ?? 'INR';
  const pct = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
  const remaining = Math.max(0, budget - spent);
  const isOver = spent > budget && budget > 0;

  return (
    <motion.div
      className="rounded-2xl border border-border/50 bg-card p-5 shadow-card"
      initial={reduced ? {} : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10">
            <Wallet className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Budget
            </p>
            <p className="text-sm font-semibold text-foreground">Overview</p>
          </div>
        </div>
        <Link
          to="/analytics"
          className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          Details
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-2 w-full rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      ) : (
        <div className="space-y-3">
          {/* Budget figure */}
          <div>
            <p className="text-2xl font-bold tabular-nums text-foreground">
              {formatCurrency(spent, currency)}
            </p>
            <p className="text-xs text-muted-foreground">
              of {formatCurrency(budget, currency)} total budget
            </p>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                className={cn(
                  'h-full rounded-full',
                  isOver
                    ? 'bg-gradient-to-r from-rose-500 to-red-400'
                    : pct > 80
                      ? 'bg-gradient-to-r from-amber-400 to-orange-400'
                      : 'bg-gradient-to-r from-emerald-400 to-teal-400',
                )}
                initial={reduced ? {} : { width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span className={cn(isOver && 'font-semibold text-destructive')}>
                {pct}% {isOver ? 'over budget' : 'used'}
              </span>
              {!isOver && (
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  {formatCurrency(remaining, currency)} left
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
