import { motion, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import { rv, FADE_VARIANTS, LIST_VARIANTS } from '@/lib/motion';
import { rg, HOVER, PRESS } from '@/lib/motion';
import { useWizard, TRIP_TYPE_META } from '../WizardContext';
import type { TripType } from '../WizardContext';

const TYPES = Object.entries(TRIP_TYPE_META) as [TripType, (typeof TRIP_TYPE_META)[TripType]][];

/* ── Trip type card ──────────────────────────────────────────────── */

function TypeCard({
  id,
  label,
  emoji,
  description,
  selected,
  onSelect,
}: {
  id: TripType;
  label: string;
  emoji: string;
  description: string;
  selected: boolean;
  onSelect: (id: TripType) => void;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(id)}
      whileHover={rg(HOVER.lift, reduced)}
      whileTap={rg(PRESS.subtle, reduced)}
      aria-pressed={selected}
      className={[
        'relative flex flex-col items-center gap-3 rounded-2xl border-2 p-5 text-center transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        selected
          ? 'border-primary bg-primary/5 shadow-md'
          : 'border-border bg-card hover:border-primary/30 hover:bg-muted/50',
      ].join(' ')}
    >
      {/* Selected check */}
      {selected && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground"
          aria-hidden="true"
        >
          <Check className="h-3 w-3" />
        </motion.span>
      )}

      {/* Emoji */}
      <span
        className={[
          'flex h-14 w-14 items-center justify-center rounded-2xl text-2xl transition-colors duration-200',
          selected ? 'bg-primary/15' : 'bg-muted',
        ].join(' ')}
        aria-hidden="true"
      >
        {emoji}
      </span>

      {/* Text */}
      <div>
        <p
          className={[
            'text-sm font-bold transition-colors',
            selected ? 'text-primary' : 'text-foreground',
          ].join(' ')}
        >
          {label}
        </p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </motion.button>
  );
}

/* ── Step ────────────────────────────────────────────────────────── */

export function TripTypeStep() {
  const reduced = useReducedMotion();
  const { state, dispatch } = useWizard();

  function select(id: TripType) {
    dispatch({ type: 'SET_TRIP_TYPE', tripType: id });
  }

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
          Step 2 of 7
        </motion.p>
        <motion.h1
          className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          variants={rv(FADE_VARIANTS, reduced)}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.05 }}
        >
          What kind of trip is this?
        </motion.h1>
        <motion.p
          className="mt-2 text-base text-muted-foreground"
          variants={rv(FADE_VARIANTS, reduced)}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.1 }}
        >
          Your trip type shapes the itinerary, packing list, and AI recommendations.
        </motion.p>
      </div>

      {/* Cards grid */}
      <motion.div
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
        variants={rv(LIST_VARIANTS, reduced)}
        initial="hidden"
        animate="show"
      >
        {TYPES.map(([id, meta]) => (
          <TypeCard
            key={id}
            id={id}
            label={meta.label}
            emoji={meta.emoji}
            description={meta.description}
            selected={state.tripType === id}
            onSelect={select}
          />
        ))}
      </motion.div>

      {/* Selected hint */}
      {state.tripType && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-foreground"
        >
          <span className="font-semibold text-primary">
            {TRIP_TYPE_META[state.tripType].emoji} {TRIP_TYPE_META[state.tripType].label}
          </span>{' '}
          selected — we'll tailor every recommendation specifically for this travel style.
        </motion.div>
      )}
    </div>
  );
}
