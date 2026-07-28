import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles, TrendingDown, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { rv, CARD_VARIANTS } from '@/lib/motion';
import { formatCurrency } from '@/utils/formatters';
import type { BudgetSummary, CategoryBudgetItem } from '../../types';

interface Props {
  summary: BudgetSummary;
  items: CategoryBudgetItem[];
  onOpenAI: () => void;
  hasTrip: boolean;
}

interface Recommendation {
  type: 'success' | 'warning' | 'info';
  title: string;
  body: string;
}

function buildRecommendations(
  summary: BudgetSummary,
  items: CategoryBudgetItem[],
): Recommendation[] {
  const recs: Recommendation[] = [];
  const fmt = (n: number) => formatCurrency(n, summary.tripCurrency);

  const budget = summary.tripBudget ?? summary.totalAllocated;

  // Overall budget health
  if (summary.remaining < 0) {
    recs.push({
      type: 'warning',
      title: 'Over budget',
      body: `You've exceeded your budget by ${fmt(Math.abs(summary.remaining))}. Review your highest-spending categories.`,
    });
  } else if (budget > 0 && summary.totalSpent / budget < 0.5) {
    recs.push({
      type: 'success',
      title: 'On track',
      body: `You've used ${Math.round((summary.totalSpent / budget) * 100)}% of your budget. Great financial discipline!`,
    });
  }

  // Unallocated budget
  if (summary.tripBudget != null && summary.unallocated > 0) {
    recs.push({
      type: 'info',
      title: 'Unallocated funds',
      body: `${fmt(summary.unallocated)} is unallocated. Consider distributing it across categories for better tracking.`,
    });
  }

  // Most over-budget category
  const overItems = items
    .filter((i) => i.allocated > 0 && i.spent > i.allocated)
    .sort((a, b) => b.spent - b.allocated - (a.spent - a.allocated));

  if (overItems.length > 0) {
    const top = overItems[0];
    recs.push({
      type: 'warning',
      title: `${top.emoji} ${top.label} over limit`,
      body: `${top.label} exceeded by ${fmt(top.spent - top.allocated)}. Consider adjusting the allocation or reducing spending.`,
    });
  }

  // Highest spending category
  const highestSpent = [...items].sort((a, b) => b.spent - a.spent).find((i) => i.spent > 0);
  if (highestSpent && overItems[0]?.category !== highestSpent.category) {
    recs.push({
      type: 'info',
      title: `${highestSpent.emoji} Top expense`,
      body: `${highestSpent.label} is your highest spend at ${fmt(highestSpent.spent)}. This is ${
        highestSpent.allocated > 0
          ? `${Math.round((highestSpent.spent / highestSpent.allocated) * 100)}% of its allocation.`
          : 'unbudgeted â€” set a limit to track it.'
      }`,
    });
  }

  // Savings tip
  if (summary.remaining > 0 && budget > 0) {
    recs.push({
      type: 'success',
      title: 'Potential savings',
      body: `${fmt(summary.remaining)} remaining. Any unspent amount at trip end is your savings!`,
    });
  }

  return recs.slice(0, 3);
}

const ICON_MAP = {
  success: { Icon: CheckCircle2, color: '#10b981', bg: 'bg-emerald-500/10' },
  warning: { Icon: AlertTriangle, color: '#f59e0b', bg: 'bg-amber-500/10' },
  info: { Icon: TrendingDown, color: '#6366f1', bg: 'bg-indigo-500/10' },
};

export function BudgetAIPanel({ summary, items, onOpenAI, hasTrip }: Props) {
  const reduced = useReducedMotion();
  const recs = buildRecommendations(summary, items);

  return (
    <motion.div
      variants={rv(CARD_VARIANTS, reduced)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-20px' }}
      className="relative overflow-hidden rounded-2xl border border-border/40 bg-card/60 p-5 backdrop-blur-sm"
    >
      {/* Glow */}
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-3xl"
        style={{ background: 'rgba(139,92,246,0.12)' }}
        aria-hidden="true"
      />

      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 text-white">
            <Sparkles className="h-[15px] w-[15px]" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">AI Recommendations</p>
            <p className="text-[11px] text-muted-foreground">Based on your spending</p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {recs.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/60 py-6 text-center">
          <Sparkles className="h-6 w-6 text-muted-foreground/40" />
          <p className="text-xs text-muted-foreground">Add expenses to get personalised insights</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recs.map((rec, i) => {
            const { Icon, color, bg } = ICON_MAP[rec.type];
            return (
              <div key={i} className="flex gap-3">
                <div
                  className={cn(
                    'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg',
                    bg,
                  )}
                >
                  <Icon className="h-3.5 w-3.5" style={{ color }} aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground">{rec.title}</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                    {rec.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* AI Estimate trigger */}
      <button
        onClick={onOpenAI}
        disabled={!hasTrip}
        className={cn(
          'mt-4 flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-semibold transition-all duration-200',
          hasTrip
            ? 'border-violet-500/40 bg-violet-500/5 text-violet-600 hover:bg-violet-500/10 dark:text-violet-400'
            : 'cursor-not-allowed border-border/40 text-muted-foreground opacity-50',
        )}
      >
        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
        Generate AI Budget Estimate
      </button>
    </motion.div>
  );
}
