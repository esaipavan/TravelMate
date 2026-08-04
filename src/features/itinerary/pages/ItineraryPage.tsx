import { Link, useParams, Navigate } from 'react-router-dom';
import { ArrowLeft, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/shared/PageHeader';
import { useItineraryData } from '../hooks/useItinerary';
import { DaySection } from '../components/DaySection';
import { AIItineraryOptimize } from '../components/AIItineraryOptimize';
import { useTrip } from '@/features/trips/hooks/useTrips';

function ItinerarySkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-48 w-full rounded-lg" />
      ))}
    </div>
  );
}

export default function ItineraryPage() {
  const { id: tripId } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useItineraryData(tripId!);
  const { data: trip } = useTrip(tripId!);

  if (isLoading) return <ItinerarySkeleton />;
  if (isError || !data) return <Navigate to="/trips" replace />;

  const { tripTitle, tripCurrency, days } = data;
  const destination = trip?.destination ?? tripTitle;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" className="mt-0.5 shrink-0" asChild>
          <Link to={`/trips/${tripId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageHeader title="Itinerary" description={tripTitle}>
          {days.length > 0 && (
            <AIItineraryOptimize
              tripId={tripId!}
              destination={destination}
              days={days.map((d) => ({
                id: d.id,
                date: d.date,
                label: d.title ?? null,
                activities: d.items.map((i) => ({
                  title: i.title,
                  start_time: i.start_time ?? null,
                })),
              }))}
            />
          )}
        </PageHeader>
      </div>

      {days.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed py-16 text-center">
          <CalendarDays className="h-10 w-10 text-muted-foreground opacity-40" />
          <div className="space-y-1">
            <p className="font-medium">No itinerary days</p>
            <p className="text-sm text-muted-foreground">
              Add start and end dates to your trip to generate days automatically.
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/trips/${tripId}`}>Edit trip dates</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {days.map((day) => (
            <DaySection key={day.id} day={day} tripId={tripId!} currency={tripCurrency} />
          ))}
        </div>
      )}
    </div>
  );
}
