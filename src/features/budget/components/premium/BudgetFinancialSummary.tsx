import { motion, useReducedMotion } from 'framer-motion';
import { Wallet, PiggyBank, TrendingUp, TrendingDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { rv, rg, HOVER, REDUCED_VARIANTS } from '@/lib/motion';
import { formatCurrency } from '@/utils/formatters';
import { useCountUp } from '../../hooks/useCountUp';
import type { BudgetSummary } from '../../types';

interface Props {
  summary: BudgetSummary;
  isLoaded: boolean;
}

interface CardDef {
  label: string;
  sub: (s: BudgetSummary) => string;
  value: (s: BudgetSummary) => number;
  icon: LucideIcon;
  rgb: string;
  gradient: string;
  alert?: (s: BudgetSummary) => boolean;
  signed?: boolean;
}

const CARDS: CardDef[] = [
  {
    label: 'Trip Budget',
    sub: (s) => (s.tripBudget != null ? 'Total trip allowance' : 'No budget set'),
    value: (s) => s.tripBudget ?? 0,
    icon: Wallet,
    rgb: '99,102,241',
    gradient: 'from-indigo-500 to-violet-500',
  },
  {
    label: 'Allocated',
    sub: (s) =>
      s.tripBudget != null
        ? `${formatCurrency(s.unallocated, s.tripCurrency)} unallocated`
        : 'Across categories',
    value: (s) => s.totalAllocated,
    icon: PiggyBank,
    rgb: '6,182,212',
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    label: 'Total Spent',
    sub: (s) => {
      const base = s.tripBudget ?? s.totalAllocated;
      if (base <= 0) return 'No budget to compare';
      const pct = Math.round((s.totalSpent / base) * 100);
      return `${pct}% of ${s.tripBudget != null ? 'budget' : 'allocated'}`;
    },
    value: (s) => s.totalSpent,
    icon: TrendingUp,
    rgb: '245,158,11',
    gradient: 'from-amber-500 to-orange-400',
  },
  {
    label: 'Remaining',
    sub: (s) => (s.remaining < 0 ? 'Over budget' : 'Left to spend'),
    value: (s) => Math.abs(s.remaining),
    icon: TrendingDown,
    rgb: '16,185,129',
    gradient: 'from-emerald-500 to-teal-500',
    alert: (s) => s.remaining < 0,
    signed: true,
  },
];

const GRID_VARIANTS = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const CARD_VARIANTS = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, damping: 22, stiffness: 160 },
  },
};

interface KPICardProps {
  def: CardDef;
  summary: BudgetSummary;
  isLoaded: boolean;
  reduced: boolean | null;
}

function KPICard({ def, summary, isLoaded, reduced }: KPICardProps) {
  const rawValue = def.value(summary);
  const count = useCountUp(rawValue, 1100, isLoaded, reduced ?? false);
  const isAlert = def.alert?.(summary) ?? false;

  return (
    <motion.div
      variants={rv(CARD_VARIANTS, reduced)}
      whileHover={rg(HOVER.lift, reduced)}
      className={cn(
        'relative overflow-hidden rounded-2xl border p-5 backdrop-blur-sm',
        isAlert ? 'border-rose-500/30 bg-rose-500/5' : 'border-border/40 bg-card/60',
      )}
    >
      {/* Corner glow */}
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl"
        style={{ background: `rgba(${isAlert ? '244,63,94' : def.rgb},0.12)` }}
        aria-hidden="true"
      />

      {/* Icon */}
      <div
        className={cn(
          'mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm',
          isAlert ? 'from-rose-500 to-pink-500' : def.gradient,
        )}
      >
        <def.icon className="h-[18px] w-[18px]" aria-hidden="true" />
      </div>

      {/* Value */}
      <p
        className={cn(
          'text-xl font-bold tabular-nums leading-none tracking-tight',
          isAlert ? 'text-rose-500' : 'text-foreground',
        )}
        aria-live="polite"
      >
        {def.signed && summary.remaining < 0 ? '-' : ''}
        {formatCurrency(count, summary.tripCurrency)}
      </p>

      {/* Labels */}
      <p className="mt-1.5 text-xs font-medium text-muted-foreground">{def.label}</p>
      <p className="text-[10px] text-muted-foreground/60">{def.sub(summary)}</p>
    </motion.div>
  );
}

export function BudgetFinancialSummary({ summary, isLoaded }: Props) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      variants={reduced ? REDUCED_VARIANTS : GRID_VARIANTS}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      role="list"
      aria-label="Budget summary"
    >
      {CARDS.map((def) => (
        <div key={def.label} role="listitem">
          <KPICard def={def} summary={summary} isLoaded={isLoaded} reduced={reduced} />
        </div>
      ))}
    </motion.div>
  );
}
