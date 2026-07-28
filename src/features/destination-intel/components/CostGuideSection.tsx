import { motion, useReducedMotion } from 'framer-motion';
import { DollarSign, CreditCard, ShoppingCart, Info } from 'lucide-react';
import {
  rv,
  CARD_VARIANTS,
  SECTION_VARIANTS,
  LIST_VARIANTS,
  LIST_ITEM_VARIANTS,
} from '@/lib/motion';
import type { CostGuide } from '../types';

interface Props {
  cost: CostGuide;
  destination: string;
}

const TIERS = [
  {
    key: 'budget' as const,
    label: 'Budget',
    subtitle: 'Hostels, street food, public transit',
    emoji: '🎒',
    totalKey: 'dailyTotalBudget' as const,
    valueKey: 'budgetUSD' as const,
    gradient: 'from-emerald-500/10 to-emerald-500/5',
    border: 'border-emerald-500/20',
    accent: 'text-emerald-600 dark:text-emerald-400',
    badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    bar: 'bg-emerald-500',
    shadow: 'rgba(16,185,129,0.08)',
    ring: 'rgba(16,185,129,0.2)',
  },
  {
    key: 'standard' as const,
    label: 'Standard',
    subtitle: 'Mid-range hotels, restaurants, taxis',
    emoji: '🏨',
    totalKey: 'dailyTotalMidrange' as const,
    valueKey: 'midrangeUSD' as const,
    gradient: 'from-blue-500/10 to-blue-500/5',
    border: 'border-blue-500/20',
    accent: 'text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
    bar: 'bg-blue-500',
    shadow: 'rgba(59,130,246,0.08)',
    ring: 'rgba(59,130,246,0.2)',
  },
  {
    key: 'luxury' as const,
    label: 'Luxury',
    subtitle: '5-star hotels, fine dining, private transfers',
    emoji: '💎',
    totalKey: 'dailyTotalLuxury' as const,
    valueKey: 'luxuryUSD' as const,
    gradient: 'from-amber-500/10 to-amber-500/5',
    border: 'border-amber-500/20',
    accent: 'text-amber-600 dark:text-amber-500',
    badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
    bar: 'bg-amber-500',
    shadow: 'rgba(245,158,11,0.08)',
    ring: 'rgba(245,158,11,0.2)',
  },
] as const;

function TierCard({
  tier,
  cost,
  maxTotal,
}: {
  tier: (typeof TIERS)[number];
  cost: CostGuide;
  maxTotal: number;
}) {
  const reduced = useReducedMotion();
  const total = cost[tier.totalKey];
  const barWidth = maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0;

  return (
    <motion.div
      className={`relative flex flex-col overflow-hidden rounded-2xl border bg-gradient-to-b ${tier.gradient} ${tier.border}`}
      style={{ boxShadow: `0 4px 24px -6px ${tier.shadow}` }}
      variants={rv(CARD_VARIANTS, reduced)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-40px' }}
    >
      {/* Card header */}
      <div className="px-5 pb-4 pt-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-2xl leading-none" aria-hidden>
              {tier.emoji}
            </span>
            <h3 className={`mt-2 text-base font-bold ${tier.accent}`}>{tier.label}</h3>
            <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{tier.subtitle}</p>
          </div>
          <div className="text-right">
            <p className={`text-3xl font-black tabular-nums ${tier.accent}`}>${total}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              per day
            </p>
          </div>
        </div>

        {/* Relative bar */}
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-black/5 dark:bg-white/5">
          <motion.div
            className={`h-full rounded-full ${tier.bar}`}
            initial={{ width: 0 }}
            whileInView={{ width: `${barWidth}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            aria-hidden
          />
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-border/50" />

      {/* Category breakdown */}
      <div className="flex flex-col gap-0 px-5 py-4">
        {cost.items.map((item) => (
          <div key={item.category} className="flex items-center justify-between py-1.5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="text-sm leading-none" aria-hidden>
                {item.emoji}
              </span>
              <span>{item.category}</span>
            </div>
            <span className={`text-xs font-semibold tabular-nums ${tier.accent}`}>
              ${item[tier.valueKey]}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export function CostGuideSection({ cost, destination }: Props) {
  const reduced = useReducedMotion();
  const maxTotal = Math.max(cost.dailyTotalBudget, cost.dailyTotalMidrange, cost.dailyTotalLuxury);

  if (cost.items.length === 0 && maxTotal === 0) return null;

  const notes = [
    { icon: CreditCard, label: 'Tipping', body: cost.tippingNote },
    { icon: ShoppingCart, label: 'Bargaining', body: cost.bargainingNote },
    { icon: DollarSign, label: 'ATMs', body: cost.atmNote },
  ].filter((n) => n.body);

  return (
    <section id="cost" aria-label={`Daily cost guide for ${destination}`} className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Cost Guide</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Estimated daily spend in {destination} · all prices in USD
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-border/50 bg-card px-3 py-1.5">
          <span className="text-xs font-medium text-muted-foreground">1 USD</span>
          <span className="text-xs text-muted-foreground/60">≈</span>
          <span className="text-xs font-bold text-foreground">
            {cost.usdToLocalRate < 10
              ? cost.usdToLocalRate.toFixed(2)
              : Math.round(cost.usdToLocalRate).toLocaleString()}{' '}
            {cost.localCurrencyCode}
          </span>
        </div>
      </div>

      {/* Tier cards */}
      <motion.div
        className="grid gap-4 sm:grid-cols-3"
        variants={rv(LIST_VARIANTS, reduced)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-30px' }}
      >
        {TIERS.map((tier) => (
          <TierCard key={tier.key} tier={tier} cost={cost} maxTotal={maxTotal} />
        ))}
      </motion.div>

      {/* Notes */}
      {notes.length > 0 && (
        <motion.div
          className="grid gap-3 sm:grid-cols-3"
          variants={rv(LIST_VARIANTS, reduced)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-20px' }}
        >
          {notes.map(({ icon: Icon, label, body }) => (
            <motion.div
              key={label}
              className="rounded-xl border border-border/40 bg-card p-4"
              variants={rv(LIST_ITEM_VARIANTS, reduced)}
            >
              <div className="mb-2 flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                  {label}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">{body}</p>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Disclaimer */}
      <motion.div
        className="flex items-start gap-2.5 rounded-xl border border-border/30 bg-muted/30 px-4 py-3"
        variants={rv(SECTION_VARIANTS, reduced)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/60" aria-hidden />
        <p className="text-[11px] leading-relaxed text-muted-foreground/70">
          Daily estimates are indicative and based on typical spending patterns. Actual costs vary
          by season, neighbourhood, and personal habits. Luxury estimates assume premium
          experiences.
        </p>
      </motion.div>
    </section>
  );
}
