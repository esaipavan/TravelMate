import { motion, useReducedMotion } from 'framer-motion';
import {
  Plane,
  Globe,
  CalendarDays,
  CheckCircle2,
  Wallet,
  Receipt,
  TrendingDown,
  Calculator,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { rv, rg, HOVER, REDUCED_VARIANTS } from '@/lib/motion';
import { formatCurrency } from '@/utils/formatters';
import { useCountUp } from '../hooks/useCountUp';

interface KPIs {
  totalTrips: number;
  upcomingTrips: number;
  completedTrips: number;
  countriesVisited: number;
  totalBudget: number;
  totalExpenses: number;
  budgetRemaining: number;
  avgTripCost: number;
}

interface AnalyticsKPIGridProps {
  kpis: KPIs;
  currency: string;
  isLoaded: boolean;
}

interface KPIConfig {
  key: keyof KPIs;
  label: string;
  sub: string;
  icon: LucideIcon;
  format: 'count' | 'currency';
  rgb: string;
  gradient: string;
  /** when true the negative sign is prepended for negative values */
  signed?: boolean;
}

const CONFIGS: KPIConfig[] = [
  {
    key: 'totalTrips',
    label: 'Total Trips',
    sub: 'All time',
    icon: Plane,
    format: 'count',
    rgb: '99,102,241',
    gradient: 'from-indigo-500 to-violet-500',
  },
  {
    key: 'countriesVisited',
    label: 'Countries',
    sub: 'Destinations',
    icon: Globe,
    format: 'count',
    rgb: '6,182,212',
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    key: 'upcomingTrips',
    label: 'Upcoming',
    sub: 'Planned ahead',
    icon: CalendarDays,
    format: 'count',
    rgb: '139,92,246',
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    key: 'completedTrips',
    label: 'Completed',
    sub: 'Trips finished',
    icon: CheckCircle2,
    format: 'count',
    rgb: '16,185,129',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    key: 'totalBudget',
    label: 'Total Budget',
    sub: 'Planned spend',
    icon: Wallet,
    format: 'currency',
    rgb: '245,158,11',
    gradient: 'from-amber-500 to-orange-400',
  },
  {
    key: 'totalExpenses',
    label: 'Total Spent',
    sub: 'Actual expenses',
    icon: Receipt,
    format: 'currency',
    rgb: '244,63,94',
    gradient: 'from-rose-500 to-pink-500',
  },
  {
    key: 'budgetRemaining',
    label: 'Remaining',
    sub: 'Budget balance',
    icon: TrendingDown,
    format: 'currency',
    rgb: '16,185,129',
    gradient: 'from-emerald-500 to-teal-500',
    signed: true,
  },
  {
    key: 'avgTripCost',
    label: 'Avg Trip Cost',
    sub: 'Per trip average',
    icon: Calculator,
    format: 'currency',
    rgb: '99,102,241',
    gradient: 'from-indigo-500 to-blue-500',
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

/* ── Individual KPI card ──────────────────────────────────────── */
interface CardProps {
  config: KPIConfig;
  rawValue: number;
  currency: string;
  isLoaded: boolean;
  reduced: boolean | null;
}

function KPICard({ config, rawValue, currency, isLoaded, reduced }: CardProps) {
  const absValue = Math.abs(rawValue);
  const count = useCountUp(absValue, 1100, isLoaded, reduced ?? false);

  const isNegative = config.signed && rawValue < 0;
  const isOverBudget = config.key === 'budgetRemaining' && rawValue < 0;

  const displayValue =
    config.format === 'currency'
      ? `${isNegative ? '-' : ''}${formatCurrency(count, currency)}`
      : count.toLocaleString();

  return (
    <motion.div
      variants={rv(CARD_VARIANTS, reduced)}
      whileHover={rg(HOVER.lift, reduced)}
      className={cn(
        'relative overflow-hidden rounded-2xl border p-5 backdrop-blur-sm transition-shadow duration-200',
        isOverBudget ? 'border-rose-500/30 bg-rose-500/5' : 'border-border/40 bg-card/60',
      )}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Corner glow */}
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl"
        style={{ background: `rgba(${isOverBudget ? '244,63,94' : config.rgb},0.12)` }}
        aria-hidden="true"
      />

      {/* Icon */}
      <div
        className={cn(
          'mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm',
          config.gradient,
        )}
      >
        <config.icon className="h-4.5 h-[18px] w-4.5 w-[18px]" aria-hidden="true" />
      </div>

      {/* Counter */}
      <p
        className={cn(
          'text-xl font-bold tabular-nums leading-none tracking-tight',
          isOverBudget ? 'text-rose-500' : 'text-foreground',
        )}
        aria-live="polite"
      >
        {displayValue}
      </p>

      {/* Label */}
      <p className="mt-1.5 text-xs font-medium text-muted-foreground">{config.label}</p>
      <p className="text-[10px] text-muted-foreground/60">{config.sub}</p>
    </motion.div>
  );
}

/* ── Grid ─────────────────────────────────────────────────────── */
export function AnalyticsKPIGrid({ kpis, currency, isLoaded }: AnalyticsKPIGridProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      variants={reduced ? REDUCED_VARIANTS : GRID_VARIANTS}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-20px' }}
      className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      role="list"
      aria-label="Key performance indicators"
    >
      {CONFIGS.map((config) => (
        <div key={config.key} role="listitem">
          <KPICard
            config={config}
            rawValue={kpis[config.key]}
            currency={currency}
            isLoaded={isLoaded}
            reduced={reduced}
          />
        </div>
      ))}
    </motion.div>
  );
}
