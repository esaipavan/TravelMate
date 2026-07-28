import { Link, Navigate, useParams } from 'react-router-dom';
import { Globe2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useTrip } from '@/features/trips/hooks/useTrips';
import { useDestinationData } from '../hooks/useDestinationData';
import { DestinationHero } from '../components/DestinationHero';
import { MapPreview } from '../components/MapPreview';
import { WeatherSection } from '../components/WeatherSection';
import { AttractionsSection } from '../components/AttractionsSection';
import { FoodSection } from '../components/FoodSection';
import { TransportSection } from '../components/TransportSection';
import { SafetySection } from '../components/SafetySection';
import { CostGuideSection } from '../components/CostGuideSection';
import { PackingChecklist } from '../components/PackingChecklist';

function PageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading destination intelligence">
      <Skeleton className="h-[55vh] w-full rounded-2xl" />
      <Skeleton className="h-24 w-full rounded-2xl" />
      <div className="space-y-3">
        <Skeleton className="h-6 w-40 rounded" />
        <Skeleton className="h-44 w-full rounded-2xl" />
        <div className="flex gap-2.5">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-32 min-w-[88px] flex-shrink-0 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function DestinationIntelPage() {
  const { id: tripId } = useParams<{ id: string }>();

  const { data: trip, isLoading: tripLoading, isError: tripError } = useTrip(tripId!);
  const { data: intel, isLoading: intelLoading } = useDestinationData(trip?.destination);

  const isLoading = tripLoading || (!!trip && intelLoading);

  if (tripError) return <Navigate to="/trips" replace />;
  if (isLoading) return <PageSkeleton />;
  if (!trip || !intel) return <PageSkeleton />;

  return (
    <div className="space-y-8">
      {/* Back + breadcrumb */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="shrink-0" aria-label="Back to trip" asChild>
          <Link to={`/trips/${tripId}`}>
            <ArrowLeft className="h-4 w-4" aria-hidden />
          </Link>
        </Button>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <Globe2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Destination Intelligence
            </span>
          </div>
          <p className="truncate text-sm font-medium">{trip.title}</p>
        </div>
      </div>

      {/* Hero */}
      <DestinationHero
        overview={intel.overview}
        weather={intel.weather}
        startDate={trip.start_date}
        endDate={trip.end_date}
      />

      {/* Map placeholder */}
      <MapPreview overview={intel.overview} />

      {/* Weather */}
      <WeatherSection weather={intel.weather} />

      {/* Attractions */}
      <AttractionsSection
        attractions={intel.attractions}
        destination={intel.overview.destination}
      />

      {/* Food & Drink */}
      <FoodSection food={intel.food} destination={intel.overview.destination} />

      {/* Local Transport */}
      <TransportSection transport={intel.transport} destination={intel.overview.destination} />

      {/* Safety */}
      <SafetySection safety={intel.safety} destination={intel.overview.destination} />

      {/* Cost Guide */}
      <CostGuideSection cost={intel.cost} destination={intel.overview.destination} />

      {/* Packing Checklist */}
      <PackingChecklist checklist={intel.checklist} destination={intel.overview.destination} />
    </div>
  );
}
