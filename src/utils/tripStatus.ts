import { differenceInDays } from 'date-fns';
import { parseLocalDate, tripDuration } from './formatters';
import type { TripStatus } from '@/features/trips/types';

export type ComputedTripStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';

type TripLike = {
  start_date: string;
  end_date: string;
  status: TripStatus;
};

// Local (not UTC) calendar date as 'YYYY-MM-DD', matching the DB's date-only
// string format for trips.start_date/end_date so `today` can be compared
// lexicographically the same way those columns already are. Deriving "today"
// from toISOString() instead would use UTC, which silently flips a trip's
// status up to 5.5 hours early/late for India (UTC+5:30) around local
// midnight — e.g. at 00:30 IST, toISOString() still reports the previous day.
function localDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Today at local midnight, as a Date — the same "local, not UTC" correction
// as above, exposed for callers that need to diff against it with date-fns
// (e.g. countdown/"days ago" text) instead of just comparing date strings.
// Exported so those callers reuse this one derivation rather than each
// re-deriving "today" from toISOString() themselves.
export function todayLocal(now: Date = new Date()): Date {
  return parseLocalDate(localDateString(now));
}

// Today's local calendar date as 'YYYY-MM-DD' — for comparing directly
// against DB date-only columns (e.g. `.gte('start_date', todayLocalDate())`)
// without a round-trip through a Date object. Same "local, not UTC"
// correction as todayLocal()/getTripStatus() above; exported so server-query
// callers (e.g. dashboard.service.ts) reuse this instead of re-deriving
// "today" from toISOString() themselves.
export function todayLocalDate(now: Date = new Date()): string {
  return localDateString(now);
}

// Single source of truth for classifying a trip. Uses dates (not the DB
// status field, which can lag) except for the 'cancelled' sentinel. `now`
// defaults to the real clock, so every existing single-argument call site is
// unaffected; tests pass a fixed Date to make the result deterministic
// instead of depending on the system clock.
export function getTripStatus(trip: TripLike, now: Date = new Date()): ComputedTripStatus {
  if (trip.status === 'cancelled') return 'cancelled';
  const today = localDateString(now);
  if (trip.start_date > today) return 'upcoming';
  if (trip.end_date >= today) return 'active';
  return 'completed';
}

export interface TripProgress {
  /** Inclusive day count from start_date to end_date. */
  totalDays: number;
  /** 1-based day number "today" falls on. Clamped to [1, totalDays] even
   *  before the trip starts or after it ends, so callers can render
   *  "Day N of totalDays" unconditionally without a separate branch. */
  dayNumber: number;
  /** Days remaining from today through end_date, floored at 0. */
  daysLeft: number;
  /** 0–100. 0 before the trip starts, 100 from its last day onward — unlike
   *  naive 0-based elapsed-day math (daysPassed / totalDays), this reaches
   *  100 ON the final day instead of stalling one day short of it. */
  percent: number;
}

// Single consistent trip-progress calculation — previously duplicated with
// the same off-by-one (and the same UTC-vs-local "today" bug as
// getTripStatus above) across CurrentTripCard, PremiumTripCard,
// TripBudgetCard and TripStatsRow. `now` defaults to the real clock for
// production callers; tests pass a fixed Date for determinism.
export function getTripProgress(
  trip: { start_date: string; end_date: string },
  now: Date = new Date(),
): TripProgress {
  const today = todayLocal(now);
  const start = parseLocalDate(trip.start_date);
  const end = parseLocalDate(trip.end_date);
  const totalDays = tripDuration(trip.start_date, trip.end_date);

  const dayNumber = Math.min(totalDays, Math.max(1, differenceInDays(today, start) + 1));
  const daysLeft = Math.max(0, differenceInDays(end, today));
  const percent =
    today < start
      ? 0
      : today > end
        ? 100
        : Math.min(100, Math.round((dayNumber / totalDays) * 100));

  return { totalDays, dayNumber, daysLeft, percent };
}
