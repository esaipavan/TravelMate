import { motion, useReducedMotion } from 'framer-motion';
import { Globe2, Calendar, Wallet, TrendingDown, PiggyBank, Plane } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { rv, CARD_VARIANTS, LIST_VARIANTS, LIST_ITEM_VARIANTS } from '@/lib/motion';
import { formatCurrency } from '@/utils/formatters';
import { useDashboardStats } from '../hooks/useDashboard';
import { useAnimatedCounter } from '../hooks/useAnimatedCounter';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  iconColor: string;
  iconBg: string;
  delay: number;
  reduced: boolean | null;
}

function StatCard({ icon: Icon, label, value, iconColor, iconBg, delay, reduced }: StatCardProps) {
  return (
    <motion.div
      className="rounded-2xl border border-border/50 bg-card p-5"
      variants={rv(LIST_ITEM_VARIANTS, reduced)}
      whileHover={reduced ? {} : { y: -2 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
    >
      <div
        className={cn('mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl', iconBg)}
      >
        <Icon
          className={cn('h-4.5 w-4.5', iconColor)}
          style={{ width: 18, height: 18 }}
          aria-hidden="true"
        />
      </div>
      <motion.div
        className="text-2xl font-bold tabular-nums text-foreground"
        initial={reduced ? {} : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay, duration: 0.4 }}
      >
        {value}
      </motion.div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </motion.div>
  );
}

export function TravelStats() {
  const reduced = useReducedMotion();
  const { data: stats, isLoading } = useDashboardStats();

  const trips = useAnimatedCounter(stats?.totalTrips ?? 0, 1000, 100);
  const days = useAnimatedCounter(stats?.travelDays ?? 0, 1000, 200);
  const budget = stats?.totalBudget ?? 0;
  const spent = stats?.totalExpenses ?? 0;
  const saved = Math.max(0, budget - spent);
  const isOver = spent > budget && budget > 0;

  if (isLoading) {
    return (
      <section aria-label="Travel statistics" aria-busy="true">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      </section>
    );
  }

  const currency = stats?.homeCurrency ?? 'INR';

  const statCards: Omit<StatCardProps, 'delay' | 'reduced'>[] = [
    {
      icon: Plane,
      label: 'Total Trips',
      value: String(trips),
      iconColor: 'text-violet-500',
      iconBg: 'bg-violet-500/10',
    },
    {
      icon: Calendar,
      label: 'Travel Days',
      value: String(days),
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-500/10',
    },
    {
      icon: Wallet,
      label: 'Total Budget',
      value: formatCurrency(budget, currency),
      iconColor: 'text-emerald-500',
      iconBg: 'bg-emerald-500/10',
    },
    {
      icon: Globe2,
      label: 'Total Spent',
      value: formatCurrency(spent, currency),
      iconColor: 'text-amber-500',
      iconBg: 'bg-amber-500/10',
    },
    {
      icon: isOver ? TrendingDown : PiggyBank,
      label: isOver ? 'Over Budget' : 'Budget Remaining',
      value: formatCurrency(isOver ? spent - budget : saved, currency),
      iconColor: isOver ? 'text-rose-500' : 'text-teal-500',
      iconBg: isOver ? 'bg-rose-500/10' : 'bg-teal-500/10',
    },
  ];

  return (
    <section aria-label="Travel statistics">
      <motion.div
        className="mb-3 flex items-center gap-2"
        variants={rv(CARD_VARIANTS, reduced)}
        initial="hidden"
        animate="show"
      >
        <h2 className="text-sm font-semibold text-foreground">Travel Statistics</h2>
      </motion.div>

      <motion.div
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
        variants={rv(LIST_VARIANTS, reduced)}
        initial="hidden"
        animate="show"
      >
        {statCards.map((card, i) => (
          <StatCard key={card.label} {...card} delay={0.1 + i * 0.08} reduced={reduced} />
        ))}
      </motion.div>
    </section>
  );
}
