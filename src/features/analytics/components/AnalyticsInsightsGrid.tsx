import { motion, useReducedMotion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  MapPin,
  Clock,
  Star,
  FileWarning,
  Bell,
  PiggyBank,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { rv, rg, HOVER, REDUCED_VARIANTS } from '@/lib/motion';
import { formatCurrency } from '@/utils/formatters';
import type { useAnalyticsData } from '../hooks/useAnalytics';

type Insights = ReturnType<typeof useAnalyticsData>['insights'];

interface Props {
  insights: Insights;
  currency: string;
}

interface InsightCardConfig {
  id: string;
  icon: LucideIcon;
  rgb: string;
  gradient: string;
  title: string;
  render: (
    insights: Insights,
    currency: string,
  ) => {
    value: string;
    sub: string;
    extra?: React.ReactNode;
  };
}

const CONFIGS: InsightCardConfig[] = [
  {
    id: 'highest',
    icon: TrendingUp,
    rgb: '244,63,94',
    gradient: 'from-rose-500 to-pink-500',
    title: 'Highest Spending Trip',
    render: (d, c) => ({
      value: d.highestSpendingTrip ? formatCurrency(d.highestSpendingTrip.amount, c) : '—',
      sub: d.highestSpendingTrip?.title ?? 'No trips yet',
    }),
  },
  {
    id: 'lowest',
    icon: TrendingDown,
    rgb: '16,185,129',
    gradient: 'from-emerald-500 to-teal-500',
    title: 'Lowest Spending Trip',
    render: (d, c) => ({
      value: d.lowestSpendingTrip ? formatCurrency(d.lowestSpendingTrip.amount, c) : '—',
      sub: d.lowestSpendingTrip?.title ?? 'No trips yet',
    }),
  },
  {
    id: 'most-visited',
    icon: MapPin,
    rgb: '6,182,212',
    gradient: 'from-cyan-500 to-blue-500',
    title: 'Most Visited Destination',
    render: (d) => ({
      value: d.mostVisitedDest !== '—' ? d.mostVisitedDest : '—',
      sub: d.mostVisitedDest !== '—' ? 'Most frequent stop' : 'No destination data',
    }),
  },
  {
    id: 'avg-duration',
    icon: Clock,
    rgb: '139,92,246',
    gradient: 'from-violet-500 to-purple-500',
    title: 'Avg Trip Duration',
    render: (d) => ({
      value: d.avgTripDuration > 0 ? `${d.avgTripDuration}d` : '—',
      sub:
        d.avgTripDuration > 0
          ? `${d.avgTripDuration} day${d.avgTripDuration === 1 ? '' : 's'} average`
          : 'No trip data',
    }),
  },
  {
    id: 'avg-rating',
    icon: Star,
    rgb: '245,158,11',
    gradient: 'from-amber-500 to-orange-400',
    title: 'Avg Journal Rating',
    render: (d) => ({
      value: d.avgJournalRating > 0 ? `${d.avgJournalRating.toFixed(1)} / 5` : '—',
      sub: d.avgJournalRating > 0 ? 'Journal satisfaction' : 'No entries yet',
    }),
  },
  {
    id: 'docs-expiring',
    icon: FileWarning,
    rgb: '244,63,94',
    gradient: 'from-rose-500 to-orange-400',
    title: 'Docs Expiring Soon',
    render: (d) => ({
      value: String(d.docsExpiringSoon),
      sub:
        d.docsExpiringSoon === 0
          ? 'All documents valid'
          : `${d.docsExpiringSoon} document${d.docsExpiringSoon === 1 ? '' : 's'} need attention`,
    }),
  },
  {
    id: 'reminders',
    icon: Bell,
    rgb: '99,102,241',
    gradient: 'from-indigo-500 to-violet-500',
    title: 'Upcoming Reminders',
    render: (d) => ({
      value: String(d.upcomingRemindersCount),
      sub:
        d.upcomingRemindersCount === 0
          ? 'No upcoming reminders'
          : `${d.upcomingRemindersCount} pending`,
    }),
  },
  {
    id: 'budget-utilization',
    icon: PiggyBank,
    rgb: '16,185,129',
    gradient: 'from-emerald-500 to-cyan-500',
    title: 'Budget Utilization',
    render: (d) => {
      const pct = Math.min(d.budgetUtilization, 100);
      const isOver = d.budgetUtilization > 100;
      const color = isOver ? '#f43f5e' : pct > 80 ? '#f59e0b' : '#10b981';
      return {
        value: d.budgetUtilization > 0 ? `${d.budgetUtilization.toFixed(0)}%` : '—',
        sub: isOver ? 'Over budget' : pct > 80 ? 'Near budget limit' : 'Within budget',
        extra:
          d.budgetUtilization > 0 ? (
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
              <motion.div
                className="h-full rounded-full"
                style={{ background: color }}
                initial={{ width: '0%' }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          ) : undefined,
      };
    },
  },
];

const GRID_VARIANTS = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

const CARD_VARIANTS = {
  hidden: { opacity: 0, y: 14, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, damping: 22, stiffness: 160 },
  },
};

export function AnalyticsInsightsGrid({ insights, currency }: Props) {
  const reduced = useReducedMotion();

  return (
    <section aria-labelledby="insights-heading">
      <h2
        id="insights-heading"
        className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground"
      >
        Travel Insights
      </h2>

      <motion.div
        variants={reduced ? REDUCED_VARIANTS : GRID_VARIANTS}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-20px' }}
        className="grid grid-cols-2 gap-4 md:grid-cols-4"
        role="list"
        aria-label="Travel insights"
      >
        {CONFIGS.map((config) => {
          const { value, sub, extra } = config.render(insights, currency);
          const isAlert =
            (config.id === 'docs-expiring' && insights.docsExpiringSoon > 0) ||
            (config.id === 'budget-utilization' && insights.budgetUtilization > 100);

          return (
            <motion.div
              key={config.id}
              variants={rv(CARD_VARIANTS, reduced)}
              whileHover={rg(HOVER.lift, reduced)}
              role="listitem"
              className={cn(
                'relative overflow-hidden rounded-2xl border p-5 backdrop-blur-sm',
                isAlert ? 'border-rose-500/30 bg-rose-500/5' : 'border-border/40 bg-card/60',
              )}
            >
              <div
                className="pointer-events-none absolute -right-5 -top-5 h-16 w-16 rounded-full blur-2xl"
                style={{ background: `rgba(${isAlert ? '244,63,94' : config.rgb},0.10)` }}
                aria-hidden="true"
              />

              <div
                className={cn(
                  'mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm',
                  config.gradient,
                )}
              >
                <config.icon className="h-[16px] w-[16px]" aria-hidden="true" />
              </div>

              <p className="text-xs font-medium text-muted-foreground">{config.title}</p>
              <p
                className={cn(
                  'mt-1 line-clamp-1 text-lg font-bold leading-tight tracking-tight',
                  isAlert ? 'text-rose-500' : 'text-foreground',
                )}
              >
                {value}
              </p>
              <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground/70">{sub}</p>

              {extra}
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
