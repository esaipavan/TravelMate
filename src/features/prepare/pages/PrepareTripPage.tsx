import { useEffect } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateRange } from '@/utils/formatters';
import { useTrip } from '@/features/trips/hooks/useTrips';
import { useTripBrief } from '@/features/dashboard/hooks/useTripBrief';
import { useTripPreparation } from '../hooks/useTripPreparation';
import { PreparationSummary } from '../components/PreparationSummary';
import { PrepareDocumentsSection } from '../components/PrepareDocumentsSection';
import { PreparePackingSection } from '../components/PreparePackingSection';
import { PrepareTripGuideSection } from '../components/PrepareTripGuideSection';

function PrepareSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-24 w-full rounded-2xl" />
      <Skeleton className="h-40 w-full rounded-2xl" />
      <Skeleton className="h-40 w-full rounded-2xl" />
      <Skeleton className="h-40 w-full rounded-2xl" />
    </div>
  );
}

export default function PrepareTripPage() {
  const { id: tripId } = useParams<{ id: string }>();
  const location = useLocation();
  const { data: trip, isLoading, isError } = useTrip(tripId!);
  const { brief, isLoading: briefLoading } = useTripBrief(tripId ?? null);
  const { preparation, isLoading: prepLoading } = useTripPreparation(trip);

  // Deep-link support for `/trips/:id/prepare#documents` etc. — from the
  // dashboard's Next Action banner, the trip's nav grid, AND clicks on the
  // Preparation Summary's own rows while already on this page. Depending on
  // `location.hash` (not just `trip`) is what makes the second case work:
  // a same-page hash-only navigation doesn't reload `trip`, but it does
  // update `location.hash`, which react-router re-renders on.
  useEffect(() => {
    if (!trip) return;
    const hash = location.hash.replace('#', '');
    if (!hash) return;
    const el = document.getElementById(hash);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [trip, location.hash]);

  if (isLoading) return <PrepareSkeleton />;
  if (isError || !trip) return <Navigate to="/trips" replace />;

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="mt-0.5 shrink-0"
          aria-label="Back to trip"
          asChild
        >
          <Link to={`/trips/${trip.id}`}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
            Prepare for your trip
          </p>
          <h1 className="truncate text-xl font-bold text-foreground sm:text-2xl">
            {trip.destination}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" aria-hidden="true" />
              {trip.title}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" aria-hidden="true" />
              {formatDateRange(trip.start_date, trip.end_date)}
            </span>
          </div>
        </div>
      </div>

      {/* What's done, what's left, what's next — single source of truth,
          shared with the dashboard's Next Action banner */}
      {prepLoading || !preparation ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : (
        <PreparationSummary preparation={preparation} />
      )}

      {/* Sections — simple stacked cards, no analytics/percentages */}
      <div className="space-y-4">
        <PrepareDocumentsSection tripId={trip.id} countryCode={trip.country_code} brief={brief} />
        <PreparePackingSection
          tripId={trip.id}
          destination={trip.destination}
          startDate={trip.start_date}
          endDate={trip.end_date}
          brief={brief}
        />
        <PrepareTripGuideSection
          tripId={trip.id}
          countryCode={trip.country_code}
          brief={brief}
          briefLoading={briefLoading}
        />
      </div>
    </div>
  );
}
