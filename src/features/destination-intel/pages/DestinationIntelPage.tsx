import { Link, Navigate, useParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { rv, PAGE_VARIANTS } from '@/lib/motion';
import { Globe2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { useTrip } from '@/features/trips/hooks/useTrips';
import { useWeather } from '@/features/weather/hooks/useWeather';
import { useDestinationData } from '../hooks/useDestinationData';
import { DestinationHero } from '../components/DestinationHero';
import { WeatherSection } from '../components/WeatherSection';
import { DestinationMap } from '../components/DestinationMap';
import { NearbyExplorer } from '../components/NearbyExplorer';
import { SmartRecommendations } from '../components/SmartRecommendations';
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
  const reduced = useReducedMotion();
  const { id: tripId } = useParams<{ id: string }>();

  const {
    data: trip,
    isLoading: tripLoading,
    isError: tripError,
    refetch: refetchTrip,
  } = useTrip(tripId!);
  const { data: intel, isLoading: intelLoading } = useDestinationData(trip?.destination);
  const { data: weatherData, isLoading: weatherLoading } = useWeather(trip?.destination ?? '');

  const isLoading = tripLoading || (!!trip && intelLoading);

  if (tripError)
    return (
      <ErrorState
        title="Couldn't load trip"
        message="We ran into a problem loading this trip's details."
        onRetry={() => void refetchTrip()}
      />
    );
  if (isLoading) return <PageSkeleton />;
  if (!trip) return <Navigate to="/trips" replace />;
  if (!intel)
    return (
      <ErrorState
        title="No destination data"
        message="We couldn't find intelligence data for this destination."
        onRetry={() => void refetchTrip()}
      />
    );

  return (
    <motion.div
      className="space-y-10"
      variants={rv(PAGE_VARIANTS, reduced)}
      initial="hidden"
      animate="show"
    >
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
        weather={weatherData}
        startDate={trip.start_date}
        endDate={trip.end_date}
      />

      {/* Interactive map with nearby markers */}
      <DestinationMap destination={trip.destination} />

      {/* Real weather data */}
      <WeatherSection
        weather={weatherData}
        isLoading={weatherLoading}
        seasonNote={intel.weather.seasonNote}
        travelTips={intel.weather.recommendations}
      />

      {/* AI smart recommendations */}
      <SmartRecommendations trip={trip} overview={intel.overview} />

      {/* Nearby places list (same TanStack Query cache as DestinationMap — no extra API call) */}
      <NearbyExplorer destination={trip.destination} />

      {/* Existing curated sections */}
      <AttractionsSection
        attractions={intel.attractions}
        destination={intel.overview.destination}
      />

      <FoodSection food={intel.food} destination={intel.overview.destination} />

      <TransportSection transport={intel.transport} destination={intel.overview.destination} />

      <SafetySection safety={intel.safety} destination={intel.overview.destination} />

      <CostGuideSection cost={intel.cost} destination={intel.overview.destination} />

      <PackingChecklist checklist={intel.checklist} destination={intel.overview.destination} />
    </motion.div>
  );
}
