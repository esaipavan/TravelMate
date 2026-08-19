import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Compass } from 'lucide-react';
import { rv, FADE_VARIANTS } from '@/lib/motion';
import { useCurrentTrip, useUpcomingTrips } from '../hooks/useDashboard';
import { useTripPreparation } from '@/features/prepare/hooks/useTripPreparation';

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

  const { nextAction, completedCount, totalCount } = preparation;

  return (
    <motion.div variants={rv(FADE_VARIANTS, reduced)} initial="hidden" animate="show">
      <Link
        to={nextAction.href}
        className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-5 py-3.5 transition-colors hover:bg-primary/10"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15">
          <Compass className="h-4 w-4 text-primary" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-primary/70">
            Preparation · {completedCount} of {totalCount} complete
          </p>
          <p className="truncate text-sm font-semibold text-foreground">{nextAction.label}</p>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
      </Link>
    </motion.div>
  );
}
