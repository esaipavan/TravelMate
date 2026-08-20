import { motion, useReducedMotion } from 'framer-motion';
import { MapPin, Calendar, Wallet, Edit2 } from 'lucide-react';
import { parseISO, differenceInDays } from 'date-fns';
import { rv, FADE_VARIANTS, HERO_VARIANTS, LIST_VARIANTS, LIST_ITEM_VARIANTS } from '@/lib/motion';
import { resolveDestinationImageUrl } from '@/utils/destinationTheme';
import { formatCurrency, formatDateRange } from '@/utils/formatters';
import {
  useWizard,
  resolveTotalBudget,
  resolveBudgetBreakdown,
  BUDGET_CATEGORIES,
  TRIP_TYPE_META,
} from '../WizardContext';

/* ── Summary row ─────────────────────────────────────────────────── */

function SummaryRow({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-border/40 py-3 last:border-0">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10">
        <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-semibold text-foreground">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

/* ── Step ────────────────────────────────────────────────────────── */

export function ReviewStep() {
  const reduced = useReducedMotion();
  const { state } = useWizard();

  const { destination, destinationMeta, tripType, startDate, endDate, budget, currency } = state;

  const imageUrl = resolveDestinationImageUrl(destination);
  const total = resolveTotalBudget(budget);
  const breakdown = resolveBudgetBreakdown(budget);
  const breakdownEntries = BUDGET_CATEGORIES.filter((cat) => breakdown[cat.key] !== undefined);
  const tripTypeLabel = tripType ? TRIP_TYPE_META[tripType].label : '—';
  const tripTypeEmoji = tripType ? TRIP_TYPE_META[tripType].emoji : '';

  const duration =
    startDate && endDate
      ? differenceInDays(parseISO(endDate + 'T00:00:00'), parseISO(startDate + 'T00:00:00')) + 1
      : 0;

  const dateRange = startDate && endDate ? formatDateRange(startDate, endDate) : '—';
  const budgetStr =
    total !== null && total > 0
      ? `${formatCurrency(total, currency)} · ${formatCurrency(Math.round(total / Math.max(duration, 1)), currency)} per day`
      : 'Not set';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <motion.p
          className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary"
          variants={rv(FADE_VARIANTS, reduced)}
          initial="hidden"
          animate="show"
        >
          Step 5 of 5
        </motion.p>
        <motion.h1
          className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          variants={rv(FADE_VARIANTS, reduced)}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.05 }}
        >
          Ready to go?
        </motion.h1>
        <motion.p
          className="mt-2 text-base text-muted-foreground"
          variants={rv(FADE_VARIANTS, reduced)}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.1 }}
        >
          Review your trip details before we create it.
        </motion.p>
      </div>

      {/* Hero image */}
      <motion.div
        variants={rv(HERO_VARIANTS, reduced)}
        initial="hidden"
        animate="show"
        className="relative h-56 overflow-hidden rounded-3xl sm:h-72"
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={destination}
            className="h-full w-full object-cover"
            loading="eager"
          />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background:
                'linear-gradient(135deg, rgba(99,102,241,0.75) 0%, rgba(139,92,246,0.55) 100%)',
            }}
            role="img"
            aria-label={destination}
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.08) 55%)',
          }}
          aria-hidden="true"
        />
        <div className="absolute bottom-5 left-5 right-5">
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2">
                {destinationMeta && (
                  <span className="text-2xl leading-none" aria-hidden="true">
                    {destinationMeta.flagEmoji}
                  </span>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-white">{destination}</h2>
                  {destinationMeta && (
                    <p className="text-sm text-white/70">{destinationMeta.country}</p>
                  )}
                </div>
              </div>
            </div>
            {tripType && (
              <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-semibold text-white backdrop-blur-sm">
                {tripTypeEmoji} {tripTypeLabel}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Summary card */}
      <motion.div
        variants={rv(FADE_VARIANTS, reduced)}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.15 }}
        className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm"
      >
        <div className="px-5 py-2">
          <SummaryRow
            icon={MapPin}
            label="Destination"
            value={destination}
            sub={destinationMeta?.country}
          />
          <SummaryRow
            icon={Calendar}
            label="Dates"
            value={dateRange}
            sub={duration > 0 ? `${duration} days` : undefined}
          />
          <SummaryRow icon={Wallet} label="Budget" value={budgetStr} />
        </div>
      </motion.div>

      {/* Budget breakdown preview — only if the user entered one */}
      {breakdownEntries.length > 0 && (
        <motion.div
          variants={rv(FADE_VARIANTS, reduced)}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <p className="text-sm font-semibold text-foreground">Budget breakdown</p>
          <motion.div
            className="grid grid-cols-2 gap-2 sm:grid-cols-3"
            variants={rv(LIST_VARIANTS, reduced)}
            initial="hidden"
            animate="show"
          >
            {breakdownEntries.map((cat) => (
              <motion.div
                key={cat.key}
                variants={rv(LIST_ITEM_VARIANTS, reduced)}
                className="flex items-center gap-2 rounded-2xl border border-border/60 bg-card px-3 py-2.5"
              >
                <span className="text-lg leading-none" aria-hidden="true">
                  {cat.icon}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs text-muted-foreground">{cat.label}</p>
                  <p className="text-sm font-semibold tabular-nums text-foreground">
                    {formatCurrency(breakdown[cat.key]!, currency)}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}

      {/* Create trip hint */}
      <motion.div
        variants={rv(FADE_VARIANTS, reduced)}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.25 }}
        className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-center"
      >
        <div className="flex items-center justify-center gap-2 text-sm font-medium text-primary">
          <Edit2 className="h-4 w-4" aria-hidden="true" />
          Tap <strong>Create Trip</strong> below and your adventure begins. You can edit everything
          later.
        </div>
      </motion.div>
    </div>
  );
}
