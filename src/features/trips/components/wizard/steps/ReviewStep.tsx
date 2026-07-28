import { motion, useReducedMotion } from 'framer-motion';
import { MapPin, Calendar, Wallet, Users, Sparkles, Edit2 } from 'lucide-react';
import { parseISO, differenceInDays } from 'date-fns';
import { rv, FADE_VARIANTS, HERO_VARIANTS, LIST_VARIANTS, LIST_ITEM_VARIANTS } from '@/lib/motion';
import { resolveDestinationImageUrl } from '@/utils/destinationTheme';
import { formatCurrency, formatDateRange } from '@/utils/formatters';
import { getCurrencyMeta } from '../destinationData';
import { useWizard, totalBudget, TRIP_TYPE_META } from '../WizardContext';

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

  const {
    destination,
    destinationMeta,
    tripType,
    startDate,
    endDate,
    budget,
    currency,
    inviteEmails,
    generatedSections,
  } = state;

  const imageUrl = resolveDestinationImageUrl(destination);
  const meta = getCurrencyMeta(currency);
  const total = totalBudget(budget);
  const enabledSecs = generatedSections.filter((s) => s.enabled);
  const tripTypeLabel = tripType ? TRIP_TYPE_META[tripType].label : '—';
  const tripTypeEmoji = tripType ? TRIP_TYPE_META[tripType].emoji : '';

  const duration =
    startDate && endDate
      ? differenceInDays(parseISO(endDate + 'T00:00:00'), parseISO(startDate + 'T00:00:00')) + 1
      : 0;

  const dateRange = startDate && endDate ? formatDateRange(startDate, endDate) : '—';
  const budgetStr =
    total > 0
      ? `${formatCurrency(total, currency)} · ${meta.symbol}${Math.round(total / Math.max(duration, 1)).toLocaleString()} per day`
      : 'Not set';

  const travelersStr =
    inviteEmails.length > 0
      ? `You + ${inviteEmails.length} traveler${inviteEmails.length !== 1 ? 's' : ''}`
      : 'Just you';

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
          Step 7 of 7
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
        <img
          src={imageUrl}
          alt={destination}
          className="h-full w-full object-cover"
          loading="eager"
        />
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
          <SummaryRow icon={Users} label="Travelers" value={travelersStr} />
        </div>
      </motion.div>

      {/* AI sections preview */}
      {enabledSecs.length > 0 && (
        <motion.div
          variants={rv(FADE_VARIANTS, reduced)}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
            <p className="text-sm font-semibold text-foreground">
              AI Travel Guide — {enabledSecs.length} section{enabledSecs.length !== 1 ? 's' : ''}
            </p>
          </div>
          <motion.div
            className="grid grid-cols-3 gap-2 sm:grid-cols-4"
            variants={rv(LIST_VARIANTS, reduced)}
            initial="hidden"
            animate="show"
          >
            {enabledSecs.slice(0, 8).map((s) => (
              <motion.div
                key={s.id}
                variants={rv(LIST_ITEM_VARIANTS, reduced)}
                className="flex flex-col items-center gap-1.5 rounded-2xl border border-border/60 bg-card py-3 text-center"
              >
                <span className="text-xl leading-none" aria-hidden="true">
                  {s.icon}
                </span>
                <p className="text-[10px] font-semibold leading-tight text-muted-foreground">
                  {s.title}
                </p>
              </motion.div>
            ))}
            {enabledSecs.length > 8 && (
              <div className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed border-border/60 py-3 text-center">
                <p className="text-sm font-bold text-muted-foreground">+{enabledSecs.length - 8}</p>
                <p className="text-[10px] text-muted-foreground">more</p>
              </div>
            )}
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
