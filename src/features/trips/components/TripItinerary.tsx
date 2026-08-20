import { motion, useReducedMotion } from 'framer-motion';
import { differenceInDays } from 'date-fns';
import {
  BedDouble,
  TrainFront,
  Bus,
  Plane,
  Car,
  CalendarClock,
  HelpCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDate, parseLocalDate } from '@/utils/formatters';
import { BookingStatusBadge } from '@/components/shared/BookingStatusBadge';
import { useBookings } from '@/features/hotels/hooks/useBookings';
import type { BookingMode, BookingDraft } from '@/features/hotels/types';
import type { TripRow } from '../types';
import { buildItinerary } from '../utils/tripItinerary';
import { detectItineraryIssues } from '../utils/tripItineraryChecks';
import { TripItineraryExport } from './TripItineraryExport';

interface Props {
  trip: TripRow;
}

const MODE_ICON: Record<BookingMode, LucideIcon> = {
  hotel: BedDouble,
  train: TrainFront,
  bus: Bus,
  flight: Plane,
  local: Car,
};

/** Singular label for a single booking row (MODE_LABEL is plural for totals). */
const MODE_SINGULAR: Record<BookingMode, string> = {
  hotel: 'Hotel',
  train: 'Train',
  bus: 'Bus',
  flight: 'Flight',
  local: 'Local',
};

/** Owner (private) entry point — supplies bookings from the user's store. */
export function TripItinerary({ trip }: Props) {
  const { drafts } = useBookings();
  const bookings = drafts.filter((d) => d.tripId === trip.id);
  return <TripItineraryView trip={trip} bookings={bookings} />;
}

interface ViewProps {
  trip: TripRow;
  /** Attached bookings to render — passed in so the public read-only page can
   *  reuse this exact view with server-fetched bookings (no user store). */
  bookings: BookingDraft[];
}

/** Presentational, data-source-agnostic itinerary. Read-only by nature. */
export function TripItineraryView({ trip, bookings }: ViewProps) {
  const reduced = useReducedMotion();
  const days = buildItinerary(bookings);
  const issues = detectItineraryIssues(bookings, trip);

  if (bookings.length === 0) return null; // nothing attached — bookings section shows the empty state

  const tripStart = parseLocalDate(trip.start_date);
  const tripEnd = parseLocalDate(trip.end_date);

  /** "Day N" relative to the trip start — only when the date is inside the trip window. */
  function dayNumber(date: string): number | null {
    const d = parseLocalDate(date);
    if (d < tripStart || d > tripEnd) return null;
    return differenceInDays(d, tripStart) + 1;
  }

  return (
    <motion.section
      aria-label="Trip itinerary"
      className="rounded-2xl border border-border/60 bg-card p-5"
      initial={reduced ? {} : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-48px' }}
      transition={
        reduced ? { duration: 0 } : { duration: 0.5, delay: 0.17, ease: [0.16, 1, 0.3, 1] }
      }
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-primary" aria-hidden />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Itinerary
          </h2>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
            {days.filter((d) => d.date).length}{' '}
            {days.filter((d) => d.date).length === 1 ? 'day' : 'days'}
          </span>
          {issues.length > 0 && (
            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400">
              {issues.length} to check
            </span>
          )}
        </div>
        <TripItineraryExport trip={trip} bookings={bookings} />
      </div>

      {/* Planning checks — inline, calm, derived only from stored data */}
      {issues.length > 0 && (
        <ul className="mb-4 flex flex-col gap-2">
          {issues.map((issue) => {
            const IssueIcon = issue.severity === 'warning' ? AlertTriangle : Info;
            return (
              <li
                key={issue.id}
                className={cn(
                  'flex items-start gap-2 rounded-lg border px-3 py-2 text-xs',
                  issue.severity === 'warning'
                    ? 'border-amber-500/30 bg-amber-500/5'
                    : 'border-border/60 bg-muted/30',
                )}
              >
                <IssueIcon
                  className={cn(
                    'mt-0.5 h-3.5 w-3.5 shrink-0',
                    issue.severity === 'warning'
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-muted-foreground',
                  )}
                  aria-hidden
                />
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{issue.title}</p>
                  <p className="text-muted-foreground">{issue.detail}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex flex-col gap-6">
        {days.map((day) => {
          const dn = day.date ? dayNumber(day.date) : null;
          return (
            <div key={day.date ?? 'undated'} className="flex flex-col gap-3">
              {/* Day header */}
              <div className="flex items-center gap-2">
                {day.date ? (
                  <>
                    <p className="text-sm font-semibold text-foreground">
                      {formatDate(day.date, 'EEE, MMM d')}
                    </p>
                    {dn != null && (
                      <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                        Day {dn}
                      </span>
                    )}
                  </>
                ) : (
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
                    <HelpCircle className="h-3.5 w-3.5" aria-hidden />
                    Dates to be confirmed
                  </p>
                )}
              </div>

              {/* Timeline rows for this day */}
              <div className="relative flex flex-col gap-3 pl-5">
                {/* connector line */}
                <span className="absolute bottom-1 left-[7px] top-1 w-px bg-border" aria-hidden />
                {day.bookings.map((b) => {
                  const Icon = MODE_ICON[b.mode] ?? BedDouble;
                  const cancelled = b.status === 'cancelled';
                  return (
                    <div
                      key={b.id}
                      className={cn('relative flex items-start gap-3', cancelled && 'opacity-60')}
                    >
                      {/* node */}
                      <span
                        className="absolute -left-5 top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-primary/40 bg-background"
                        aria-hidden
                      />
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-4 w-4 text-primary/70" aria-hidden />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {b.startTime ? (
                            <span className="shrink-0 text-xs font-bold tabular-nums text-primary">
                              {b.startTime}
                              {b.endTime && (
                                <span className="font-medium text-muted-foreground">
                                  {' – '}
                                  {b.endTime}
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-muted-foreground/60">
                              All day
                            </span>
                          )}
                          <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
                            {MODE_SINGULAR[b.mode]}
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
                        {b.subtitle && (
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {b.subtitle}
                          </p>
                        )}
                      </div>
                      <p
                        className={cn(
                          'shrink-0 text-sm font-bold tabular-nums',
                          cancelled ? 'text-muted-foreground line-through' : 'text-foreground',
                        )}
                      >
                        {formatCurrency(b.total, b.currency)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-[11px] text-muted-foreground">
        Ordered by time where the booking has one; date-only bookings (e.g. hotel stays) show as
        “all day”.
      </p>
    </motion.section>
  );
}
