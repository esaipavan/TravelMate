// ── Trip itinerary builder ───────────────────────────────────────────────────
// Pure, reusable grouping of a trip's attached booking drafts into a day-by-day
// schedule. Honest by construction: it only orders the drafts it is handed (the
// caller passes bookings already filtered to the current trip) and never invents
// a time. Bookings persist a check-in DATE only (no clock time), so days are the
// finest real granularity; within a day we fall back to a sensible travel order,
// not a fabricated timestamp. Bookings with no date are surfaced as undated.

import type { BookingDraft, BookingMode } from '@/features/hotels/types';

// Rough order of a travel day: you arrive (intercity), get around (local),
// then settle in (hotel). Used only to order same-day bookings deterministically
// when no real time exists — never presented as an actual schedule time.
const WITHIN_DAY_ORDER: Record<BookingMode, number> = {
  flight: 0,
  train: 1,
  bus: 2,
  local: 3,
  hotel: 4,
};

export interface ItineraryDay {
  /** YYYY-MM-DD, or null for bookings with no date. */
  date: string | null;
  bookings: BookingDraft[];
}

function sortWithinDay(list: BookingDraft[]): BookingDraft[] {
  // Bookings with a real time lead the day, in time order. Bookings without a
  // time keep the previous travel-order heuristic and trail after the timed
  // ones — honest fallback, never a fabricated time.
  const timed = list
    .filter((b) => b.startTime)
    .sort((a, b) => {
      if (a.startTime! < b.startTime!) return -1;
      if (a.startTime! > b.startTime!) return 1;
      return a.createdAt - b.createdAt;
    });

  const untimed = list
    .filter((b) => !b.startTime)
    .sort((a, b) => {
      const mo = WITHIN_DAY_ORDER[a.mode] - WITHIN_DAY_ORDER[b.mode];
      if (mo !== 0) return mo;
      return a.createdAt - b.createdAt;
    });

  return [...timed, ...untimed];
}

/**
 * Group attached bookings into ordered days. Dated days come first in
 * chronological order; any undated bookings are collected into a trailing
 * `date: null` group.
 */
export function buildItinerary(bookings: BookingDraft[]): ItineraryDay[] {
  const byDate = new Map<string, BookingDraft[]>();
  const undated: BookingDraft[] = [];

  for (const b of bookings) {
    if (b.checkIn) {
      const list = byDate.get(b.checkIn) ?? [];
      list.push(b);
      byDate.set(b.checkIn, list);
    } else {
      undated.push(b);
    }
  }

  const days: ItineraryDay[] = [...byDate.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([date, list]) => ({ date, bookings: sortWithinDay(list) }));

  if (undated.length > 0) {
    days.push({ date: null, bookings: sortWithinDay(undated) });
  }

  return days;
}
