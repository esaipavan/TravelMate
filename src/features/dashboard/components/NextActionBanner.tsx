import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Compass } from 'lucide-react';
import { rv, FADE_VARIANTS } from '@/lib/motion';
import { getTripStatus } from '@/utils/tripStatus';
import { useCurrentTrip, useUpcomingTrips } from '../hooks/useDashboard';
import { useTripPreparation } from '@/features/prepare/hooks/useTripPreparation';
import type { PreparationCategoryKey } from '@/features/prepare/utils/tripPreparation';

// getTripPreparation()'s category labels/nextAction copy ("Set your trip
// budget", "Prepare your packing list") is shared with the Prepare page,
// where it's always correct — you're preparing. On the dashboard the same
// trip can already be active, and re-showing pre-trip phrasing there reads
// as if the trip hasn't started. Fixed here, in the banner's own
// presentation only — getTripPreparation/useTripPreparation stay untouched
// so the Prepare page (and its "preparing" framing) is unaffected.
const ACTIVE_TRIP_LABELS: Partial<Record<PreparationCategoryKey, string>> = {
  budget: 'Add your trip budget',
  packing: 'Finish your packing list',
  documents: 'Add any missing documents',
  itinerary: 'Keep building your itinerary',
  guide: 'Generate your trip guide',
};

/**
 * Honest "what should I do next" banner, plus a plain X-of-Y preparation
 * count — both sourced from the single shared `useTripPreparation` hook
 * (no invented percentage, no separate logic duplicated here). Renders
 * nothing until preparation state has resolved, and nothing at all if
 * there's no upcoming/current trip (TripCommandHero already covers that
 * empty state).
 */
export function NextActionBanner() {
  const reduced = useReducedMotion();
  const { data: currentTrip, isLoading: loadingCurr } = useCurrentTrip();
  const { data: upcomingTrips = [], isLoading: loadingUp } = useUpcomingTrips();
  const displayTrip = currentTrip ?? upcomingTrips[0] ?? null;

  const { preparation, isLoading: loadingPrep } = useTripPreparation(displayTrip);

  if (!displayTrip) return null;
  if (loadingCurr || loadingUp || loadingPrep || !preparation) return null;

  const { nextAction, completedCount, totalCount, categories } = preparation;

  // Only trips useCurrentTrip/useUpcomingTrips can surface here are
  // active or upcoming (the queries already exclude completed/cancelled),
  // so this only ever swaps between those two framings.
  const isActive = getTripStatus(displayTrip) === 'active';
  const firstIncomplete = categories.find((c) => c.status === 'incomplete');
  const action =
    isActive && firstIncomplete
      ? {
          label: ACTIVE_TRIP_LABELS[firstIncomplete.key] ?? nextAction.label,
          href: firstIncomplete.href,
        }
      : nextAction;
  const eyebrow = isActive
    ? `Trip in progress · ${completedCount} of ${totalCount} ready`
    : `Preparation · ${completedCount} of ${totalCount} complete`;

  return (
    <motion.div variants={rv(FADE_VARIANTS, reduced)} initial="hidden" animate="show">
      <Link
        to={action.href}
        className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-5 py-3.5 transition-colors hover:bg-primary/10"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15">
          <Compass className="h-4 w-4 text-primary" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-primary/70">
            {eyebrow}
          </p>
          <p className="truncate text-sm font-semibold text-foreground">{action.label}</p>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
      </Link>
    </motion.div>
  );
}
