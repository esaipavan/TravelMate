import { Link } from 'react-router-dom';
import {
  BedDouble,
  TrainFront,
  Bus,
  Plane,
  Car,
  Plus,
  CalendarDays,
  Users,
  Trash2,
  CheckCircle2,
  XCircle,
  RotateCcw,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { BookingStatusBadge } from '@/components/shared/BookingStatusBadge';
import { useBookings } from '@/features/hotels/hooks/useBookings';
import type { BookingMode } from '@/features/hotels/types';
import type { TripRow } from '../types';
import { TripTotalsSummary } from './TripTotalsSummary';

interface Props {
  trip: TripRow;
}

const MODE_META: Record<BookingMode, { icon: LucideIcon; label: string }> = {
  hotel: { icon: BedDouble, label: 'Hotel' },
  train: { icon: TrainFront, label: 'Train' },
  bus: { icon: Bus, label: 'Bus' },
  flight: { icon: Plane, label: 'Flight' },
  local: { icon: Car, label: 'Local' },
};

export function TripBookingsSection({ trip }: Props) {
  const { drafts, removeDraft, setStatus } = useBookings();
  const bookings = drafts.filter((d) => d.tripId === trip.id);

  const dest = encodeURIComponent(trip.destination);
  const hotelsHref = `/hotels?destination=${dest}&tripId=${trip.id}`;
  const trainsHref = `/trains?to=${dest}&tripId=${trip.id}`;
  const busesHref = `/buses?to=${dest}&tripId=${trip.id}`;
  const flightsHref = `/flights?to=${dest}&tripId=${trip.id}`;
  const localHref = `/local?dropoff=${dest}&tripId=${trip.id}`;

  return (
    <section aria-label="Trip bookings" className="rounded-2xl border border-border/60 bg-card p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Bookings
          </h2>
          {bookings.length > 0 && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
              {bookings.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="outline" className="gap-1.5">
            <Link to={hotelsHref}>
              <BedDouble className="h-3.5 w-3.5" aria-hidden />
              Hotels
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="gap-1.5">
            <Link to={trainsHref}>
              <TrainFront className="h-3.5 w-3.5" aria-hidden />
              Trains
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="gap-1.5">
            <Link to={busesHref}>
              <Bus className="h-3.5 w-3.5" aria-hidden />
              Buses
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="gap-1.5">
            <Link to={flightsHref}>
              <Plane className="h-3.5 w-3.5" aria-hidden />
              Flights
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="gap-1.5">
            <Link to={localHref}>
              <Car className="h-3.5 w-3.5" aria-hidden />
              Local
            </Link>
          </Button>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/50 py-8 text-center">
          <Plus className="h-7 w-7 text-muted-foreground/40" aria-hidden />
          <p className="text-sm text-muted-foreground">
            No bookings saved for this trip yet. Search stays or trains for{' '}
            {trip.destination.split(',')[0]}.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          <TripTotalsSummary bookings={bookings} trip={trip} />
          {bookings.map((b) => {
            const meta = MODE_META[b.mode] ?? MODE_META.hotel;
            const Icon = meta.icon;
            const cancelled = b.status === 'cancelled';
            return (
              <div
                key={b.id}
                className={cn(
                  'flex items-center gap-3 rounded-xl border border-border/50 bg-background/40 p-3',
                  cancelled && 'opacity-60',
                )}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary/70" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
                      {meta.label}
                    </span>
                    <p
                      className={cn(
                        'truncate text-sm font-semibold text-foreground',
                        cancelled && 'line-through',
                      )}
                    >
                      {b.title}
                    </p>
                    <BookingStatusBadge status={b.status} />
                  </div>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                    <span className="truncate">{b.subtitle}</span>
                    {b.checkIn && (
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" aria-hidden />
                        {formatDate(b.checkIn, 'MMM d')}
                      </span>
                    )}
                    {b.guests != null && (
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3 w-3" aria-hidden />
                        {b.guests}
                      </span>
                    )}
                  </p>
                </div>
                <p
                  className={cn(
                    'shrink-0 text-sm font-bold tabular-nums',
                    cancelled ? 'text-muted-foreground line-through' : 'text-foreground',
                  )}
                >
                  {formatCurrency(b.total, b.currency)}
                </p>
                <div className="flex shrink-0 items-center">
                  {b.status === 'draft' && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-emerald-600 dark:text-emerald-400"
                      onClick={() => void setStatus(b.id, 'confirmed')}
                      aria-label={`Confirm ${b.title}`}
                      title="Confirm"
                    >
                      <CheckCircle2 className="h-4 w-4" aria-hidden />
                    </Button>
                  )}
                  {b.status === 'confirmed' && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground"
                      onClick={() => void setStatus(b.id, 'draft')}
                      aria-label={`Move ${b.title} back to planned`}
                      title="Mark as planned"
                    >
                      <RotateCcw className="h-4 w-4" aria-hidden />
                    </Button>
                  )}
                  {cancelled ? (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground"
                      onClick={() => void setStatus(b.id, 'draft')}
                      aria-label={`Restore ${b.title}`}
                      title="Restore"
                    >
                      <RotateCcw className="h-4 w-4" aria-hidden />
                    </Button>
                  ) : (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground"
                      onClick={() => void setStatus(b.id, 'cancelled')}
                      aria-label={`Cancel ${b.title}`}
                      title="Cancel"
                    >
                      <XCircle className="h-4 w-4" aria-hidden />
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground"
                    onClick={() => void removeDraft(b.id)}
                    aria-label={`Remove ${b.title}`}
                    title="Remove"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
