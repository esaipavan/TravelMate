import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { rv, HERO_VARIANTS } from '@/lib/motion';
import { getTripStatus } from '@/utils/tripStatus';
import { formatDateRange } from '@/utils/formatters';
import type { TripRow } from '@/features/trips/types';
import type { DestinationData } from '@/features/destination-intel/types';
import type { TripInsight } from '../types';

interface Props {
  trip: TripRow;
  insight: TripInsight;
  intel: DestinationData | null;
}

const STATUS_GRADIENT: Record<string, string> = {
  active: 'from-emerald-500/20 via-teal-500/10 to-transparent',
  upcoming: 'from-blue-500/20 via-indigo-500/10 to-transparent',
  completed: 'from-muted/40 via-muted/20 to-transparent',
  cancelled: 'from-rose-500/10 via-muted/10 to-transparent',
};

function CountdownChip({ insight }: { insight: TripInsight }) {
  if (insight.isCompleted) {
    return (
      <span className="rounded-full border border-muted-foreground/20 bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
        Trip ended
      </span>
    );
  }
  if (insight.isActive) {
    return (
      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
        ✈️ Day {insight.daysIntoTrip + 1} of {insight.daysTotal}
      </span>
    );
  }
  if (insight.daysUntilTrip <= 7) {
    return (
      <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
        🗓️ {insight.daysUntilTrip === 1 ? 'Tomorrow!' : `${insight.daysUntilTrip} days away`}
      </span>
    );
  }
  return (
    <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
      📅 {insight.daysUntilTrip} days away
    </span>
  );
}

export function CompanionHero({ trip, insight, intel }: Props) {
  const reduced = useReducedMotion();
  const status = getTripStatus(trip);
  const gradient = STATUS_GRADIENT[status] ?? STATUS_GRADIENT.upcoming;
  const flag = intel?.overview?.flagEmoji ?? '🌍';

  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br ${gradient} bg-card p-6`}
      variants={rv(HERO_VARIANTS, reduced)}
      initial="hidden"
      animate="show"
      aria-label={`Trip to ${trip.destination}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <span className="text-5xl leading-none" aria-hidden>
              {flag}
            </span>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-foreground">
                {trip.destination}
              </h2>
              {intel?.overview?.country && (
                <p className="text-sm text-muted-foreground">{intel.overview.country}</p>
              )}
            </div>
          </div>
          <p className="text-sm font-medium text-muted-foreground">{trip.title}</p>
          <p className="text-xs text-muted-foreground/70">
            {formatDateRange(trip.start_date, trip.end_date)}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <CountdownChip insight={insight} />
        </div>
      </div>

      {/* AI badge */}
      <div className="mt-4 flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground/60">
        <Sparkles className="h-3 w-3" aria-hidden />
        <span>AI-powered travel insights</span>
      </div>
    </motion.div>
  );
}
