import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plane, MapPin, CalendarRange, Lock, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateRange } from '@/utils/formatters';
import { resolveTripCoverImage } from '@/utils/destinationTheme';
import { useShareMeta } from '@/hooks/useShareMeta';
import type { ShareMeta } from '@/hooks/useShareMeta';
import { usePublicTrip } from '../hooks/usePublicTrip';
import { TripItineraryView } from '../components/TripItinerary';
import { TripTotalsSummary } from '../components/TripTotalsSummary';

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      {/* Public top bar — clearly not the app chrome */}
      <header className="sticky top-0 z-10 border-b border-border/60 bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Plane className="h-3.5 w-3.5" aria-hidden />
            </div>
            <span className="font-semibold tracking-tight">TravelMate</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              <Eye className="h-3 w-3" aria-hidden />
              Read-only
            </span>
            <Button asChild size="sm" variant="outline">
              <Link to="/">Open TravelMate</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
    </div>
  );
}

export default function PublicTripPage() {
  const { id } = useParams<{ id: string }>();
  const { trip, bookings, isLoading, notFound, isError } = usePublicTrip(id);

  // Link-preview metadata — only ever built from a resolved PUBLIC trip, so a
  // private / not-found page never emits trip data (it keeps the site defaults).
  const shareMeta = useMemo<ShareMeta | null>(() => {
    if (!trip) return null;
    const activeCount = bookings.filter((b) => b.status !== 'cancelled').length;
    const parts = [formatDateRange(trip.start_date, trip.end_date)];
    if (activeCount > 0) parts.push(`${activeCount} booking${activeCount !== 1 ? 's' : ''}`);
    return {
      title: `${trip.title} · Shared itinerary`,
      description: `${trip.destination} · ${parts.join(' · ')} — a read-only itinerary shared from TravelMate.`,
      url: `${window.location.origin}/p/${trip.id}`,
      // Reconcile like the rest of the app so a stale legacy cover is never
      // shown/emitted — re-derives auto-generated covers, keeps real ones.
      image: resolveTripCoverImage(trip.destination, trip.cover_image_url),
      type: 'article',
    };
  }, [trip, bookings]);
  useShareMeta(shareMeta);

  if (isLoading) {
    return (
      <Shell>
        <div className="space-y-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </Shell>
    );
  }

  if (notFound || isError || !trip) {
    return (
      <Shell>
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Lock className="h-8 w-8 text-muted-foreground" aria-hidden />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold">This itinerary isn’t available</h1>
            <p className="text-sm text-muted-foreground">
              The trip may be private or the link may be incorrect. Only trips the owner has shared
              publicly can be viewed here.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/">Go to TravelMate</Link>
          </Button>
        </div>
      </Shell>
    );
  }

  const activeCount = bookings.filter((b) => b.status !== 'cancelled').length;
  // Same render-time honesty reconciliation used everywhere covers show: a
  // legacy/guessed cover for an unrecognised place resolves to null → gradient.
  const cover = resolveTripCoverImage(trip.destination, trip.cover_image_url);

  return (
    <Shell>
      <div className="flex flex-col gap-4">
        {/* Trip header */}
        <section className="overflow-hidden rounded-2xl border border-border/60 bg-card">
          {cover ? (
            <div
              className="h-32 w-full bg-cover bg-center sm:h-40"
              style={{ backgroundImage: `url(${cover})` }}
              role="img"
              aria-label={`${trip.destination} cover image`}
            />
          ) : (
            <div className="h-24 w-full bg-gradient-to-br from-primary/20 via-primary/10 to-violet-500/10" />
          )}
          <div className="p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Shared itinerary
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">{trip.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" aria-hidden />
                {trip.destination}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarRange className="h-3.5 w-3.5" aria-hidden />
                {formatDateRange(trip.start_date, trip.end_date)}
              </span>
            </div>
          </div>
        </section>

        {activeCount === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 py-16 text-center">
            <p className="text-sm text-muted-foreground">
              No bookings have been shared for this trip yet.
            </p>
          </div>
        ) : (
          <>
            <section className="rounded-2xl border border-border/60 bg-card p-5">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Trip cost
              </h2>
              <TripTotalsSummary bookings={bookings} trip={trip} />
            </section>

            <TripItineraryView trip={trip} bookings={bookings} />
          </>
        )}

        <p className="py-2 text-center text-[11px] text-muted-foreground">
          Read-only itinerary shared from TravelMate.
        </p>
      </div>
    </Shell>
  );
}
