import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles, Bot, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { rv, SECTION_VARIANTS, FADE_VARIANTS } from '@/lib/motion';
import { getTripStatus } from '@/utils/tripStatus';
import { useDestinationData } from '@/features/destination-intel/hooks/useDestinationData';
import { useTripList, useCompanion } from '../hooks/useCompanion';
import { TripSelector } from '../components/TripSelector';
import { CompanionDashboard } from '../components/CompanionDashboard';
import type { TripRow } from '@/features/trips/types';

function pickDefaultTrip(trips: TripRow[]): string | null {
  const active = trips.find((t) => getTripStatus(t) === 'active');
  if (active) return active.id;
  const upcoming = [...trips]
    .filter((t) => getTripStatus(t) === 'upcoming')
    .sort((a, b) => a.start_date.localeCompare(b.start_date));
  if (upcoming.length > 0) return upcoming[0].id;
  const completed = [...trips]
    .filter((t) => getTripStatus(t) === 'completed')
    .sort((a, b) => b.end_date.localeCompare(a.end_date));
  if (completed.length > 0) return completed[0].id;
  return null;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading AI companion">
      <Skeleton className="h-36 w-full rounded-2xl" />
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

function EmptyTrips() {
  return (
    <motion.div
      className="flex flex-col items-center gap-4 py-20 text-center"
      variants={FADE_VARIANTS}
      initial="hidden"
      animate="show"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
        <Bot className="h-8 w-8 text-primary" aria-hidden />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-foreground">No trips yet</h3>
        <p className="max-w-xs text-sm text-muted-foreground">
          Create your first trip to unlock AI-powered travel insights, budget coaching, and
          personalised recommendations.
        </p>
      </div>
      <Button asChild>
        <Link to="/trips/new" className="gap-2">
          <PlusCircle className="h-4 w-4" aria-hidden />
          Create a trip
        </Link>
      </Button>
    </motion.div>
  );
}

function CompanionContent({ tripId, trip }: { tripId: string; trip: TripRow }) {
  const { data: companion, isLoading, isError } = useCompanion(tripId);
  const { data: intel } = useDestinationData(trip.destination);

  if (isLoading) return <DashboardSkeleton />;
  if (isError || !companion) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center">
        <p className="text-sm font-medium text-destructive">Failed to load AI recommendations.</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Check your connection and try refreshing the page.
        </p>
      </div>
    );
  }

  return <CompanionDashboard companion={companion} trip={trip} intel={intel ?? null} />;
}

export default function AssistantPage() {
  const reduced = useReducedMotion();
  const { data: trips, isLoading: tripsLoading } = useTripList();

  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (trips && trips.length > 0 && !selectedId) {
      setSelectedId(pickDefaultTrip(trips));
    }
  }, [trips, selectedId]);

  const selectedTrip = trips?.find((t) => t.id === selectedId) ?? null;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <motion.div
        className="space-y-1"
        variants={rv(SECTION_VARIANTS, reduced)}
        initial="hidden"
        animate="show"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            AI Travel Companion
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Contextual travel intelligence — weather, budget, packing, and local insights tailored to
          your trip.
        </p>
      </motion.div>

      {/* Trip selector */}
      {tripsLoading ? (
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-44 shrink-0 rounded-2xl" />
          ))}
        </div>
      ) : !trips || trips.length === 0 ? (
        <EmptyTrips />
      ) : (
        <>
          <TripSelector trips={trips} selectedTripId={selectedId} onSelect={setSelectedId} />

          {/* Companion dashboard */}
          {selectedTrip ? (
            <CompanionContent tripId={selectedTrip.id} trip={selectedTrip} />
          ) : (
            <motion.div
              className="py-12 text-center"
              variants={rv(FADE_VARIANTS, reduced)}
              initial="hidden"
              animate="show"
            >
              <p className="text-sm text-muted-foreground">
                Select a trip above to see your AI companion.
              </p>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
