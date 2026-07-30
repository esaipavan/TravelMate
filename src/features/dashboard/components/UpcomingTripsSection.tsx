import { memo } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { PlaneTakeoff, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { rv, CARD_VARIANTS, LIST_VARIANTS, LIST_ITEM_VARIANTS } from '@/lib/motion';
import { formatDateRange } from '@/utils/formatters';
import { getTripStatus } from '@/utils/tripStatus';
import { useUpcomingTrips } from '../hooks/useDashboard';
import { useDestinationTheme } from '../hooks/useDestinationTheme';
import { DestinationImage } from './DestinationImage';
import type { UpcomingTrip } from '../types';

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-emerald-500/20 text-emerald-300',
  upcoming: 'bg-blue-500/20 text-blue-200',
  completed: 'bg-white/10 text-white/60',
  cancelled: 'bg-rose-500/20 text-rose-300',
};

interface TripImageCardProps {
  trip: UpcomingTrip;
  reduced: boolean | null;
}

const TripImageCard = memo(function TripImageCard({ trip, reduced }: TripImageCardProps) {
  const theme = useDestinationTheme(trip.destination);
  const status = getTripStatus(trip);

  return (
    <motion.div variants={rv(LIST_ITEM_VARIANTS, reduced)} className="w-64 shrink-0">
      <motion.div
        whileHover={reduced ? {} : { y: -4 }}
        whileTap={reduced ? {} : { scale: 0.98 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      >
        <Link
          to={`/trips/${trip.id}`}
          aria-label={`Open trip: ${trip.title}`}
          className="block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <div className="relative h-44 overflow-hidden rounded-2xl">
            <DestinationImage
              src={trip.cover_image_url ?? theme.imageUrl}
              alt={trip.destination}
              fallbackAccent={theme.accent}
            />

            {/* Gradient overlay */}
            <div
              className="absolute inset-0"
              aria-hidden="true"
              style={{
                background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.10) 60%)',
              }}
            />

            {/* Card content */}
            <div className="absolute inset-x-0 bottom-0 p-3.5">
              <span
                className={cn(
                  'mb-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                  STATUS_BADGE[status] ?? STATUS_BADGE.upcoming,
                )}
              >
                {status}
              </span>
              <p className="truncate text-sm font-bold leading-tight text-white">{trip.title}</p>
              <p className="mt-0.5 truncate text-xs text-white/60">{trip.destination}</p>
              <p className="mt-1 text-[10px] tabular-nums text-white/50">
                {formatDateRange(trip.start_date, trip.end_date)}
              </p>
            </div>
          </div>
        </Link>
      </motion.div>
    </motion.div>
  );
});

export function UpcomingTripsSection() {
  const reduced = useReducedMotion();
  const { data: trips = [], isLoading } = useUpcomingTrips();

  return (
    <section aria-label="Upcoming trips">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Upcoming Trips</h2>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <Link to="/trips">
            View all
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </Button>
      </div>

      {isLoading && (
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-44 w-64 shrink-0 rounded-2xl" />
          ))}
        </div>
      )}

      {!isLoading && trips.length === 0 && (
        <motion.div
          className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border/60 bg-muted/20 py-12 text-center"
          variants={rv(CARD_VARIANTS, reduced)}
          initial="hidden"
          animate="show"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-brand shadow-glow">
            <PlaneTakeoff className="h-6 w-6 text-white" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <p className="font-medium text-foreground">Ready for your next adventure?</p>
            <p className="text-sm text-muted-foreground">
              The world is waiting — start planning your journey.
            </p>
          </div>
          <Button asChild size="sm" className="border-0 bg-gradient-brand text-white shadow-glow">
            <Link to="/trips/new">Plan a trip</Link>
          </Button>
        </motion.div>
      )}

      {!isLoading && trips.length > 0 && (
        <motion.div
          className="-mx-4 px-4 lg:-mx-6 lg:px-6"
          variants={rv(LIST_VARIANTS, reduced)}
          initial="hidden"
          animate="show"
        >
          <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            {trips.map((trip) => (
              <TripImageCard key={trip.id} trip={trip} reduced={reduced} />
            ))}
          </div>
        </motion.div>
      )}
    </section>
  );
}
