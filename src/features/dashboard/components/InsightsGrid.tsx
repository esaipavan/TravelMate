import { motion, useReducedMotion } from 'framer-motion';
import { Globe2, Wallet, ReceiptText, PiggyBank } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/formatters';
import { useDashboardStats } from '../hooks/useDashboard';
import { useAnimatedCounter } from '../hooks/useAnimatedCounter';

interface CardDef {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  label: string;
  rawValue: number;
  isCurrency: boolean;
  currency: string;
  sub?: string;
  delay: number;
}

function InsightCard({ def, index }: { def: CardDef; index: number }) {
  const reduced = useReducedMotion();
  const counted = useAnimatedCounter(def.rawValue, 1300, def.delay);
  const display = def.isCurrency ? formatCurrency(counted, def.currency) : String(counted);

  return (
    <motion.div
      className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-5 shadow-card"
      initial={reduced ? {} : { opacity: 0, y: 22, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={
        reduced
          ? { duration: 0 }
          : { duration: 0.5, delay: index * 0.08 + 0.1, ease: [0.16, 1, 0.3, 1] }
      }
      whileHover={
        reduced
          ? {}
          : {
              y: -5,
              boxShadow: '0 20px 48px -8px rgba(0,0,0,0.12), 0 4px 12px -4px rgba(0,0,0,0.08)',
            }
      }
    >
      {/* Subtle top-edge gradient */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.4), transparent)',
        }}
      />

      <div className="flex items-start justify-between">
        <motion.div
          className={cn('flex h-10 w-10 items-center justify-center rounded-xl', def.iconBg)}
          whileHover={reduced ? {} : { scale: 1.1, rotate: 5 }}
          transition={{ type: 'spring', damping: 12, stiffness: 250 }}
        >
          <def.icon className={cn('h-5 w-5', def.iconColor)} />
        </motion.div>
      </div>

      <div className="mt-3 space-y-0.5">
        <p className="text-2xl font-bold tabular-nums leading-tight text-foreground">{display}</p>
        <p className="text-sm font-medium text-foreground">{def.label}</p>
        {def.sub && <p className="text-xs text-muted-foreground">{def.sub}</p>}
      </div>
    </motion.div>
  );
}

export function InsightsGrid() {
  const reduced = useReducedMotion();
  const { data: stats, isLoading } = useDashboardStats();

  const currency = stats?.homeCurrency ?? 'INR';
  const budget = stats?.totalBudget ?? 0;
  const spent = stats?.totalExpenses ?? 0;
  const saved = Math.max(0, budget - spent);
  const savingPct = budget > 0 ? Math.round((saved / budget) * 100) : 0;

  if (isLoading) {
    return (
      <section aria-label="Travel insights">
        <h2 className="mb-4 text-base font-semibold text-foreground">Travel Insights</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      </section>
    );
  }

  const cards: CardDef[] = [
    {
      icon: Globe2,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      label: 'Total Trips',
      rawValue: stats?.totalTrips ?? 0,
      isCurrency: false,
      currency,
      sub: 'all time',
      delay: 60,
    },
    {
      icon: Wallet,
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      label: 'Total Budget',
      rawValue: Math.round(budget),
      isCurrency: true,
      currency,
      sub: 'across all trips',
      delay: 130,
    },
    {
      icon: ReceiptText,
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-600 dark:text-amber-400',
      label: 'Total Spent',
      rawValue: Math.round(spent),
      isCurrency: true,
      currency,
      sub: 'all expenses',
      delay: 200,
    },
    {
      icon: PiggyBank,
      iconBg: 'bg-violet-500/10',
      iconColor: 'text-violet-600 dark:text-violet-400',
      label: 'Savings Rate',
      rawValue: savingPct,
      isCurrency: false,
      currency,
      sub:
        budget > 0 ? `${formatCurrency(Math.round(saved), currency)} remaining` : 'no budget set',
      delay: 270,
    },
  ];

  return (
    <motion.section
      aria-label="Travel insights"
      initial={reduced ? {} : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="mb-4 text-base font-semibold text-foreground">Travel Insights</h2>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card, i) => (
          <InsightCard key={card.label} def={card} index={i} />
        ))}
      </div>
    </motion.section>
  );
}
