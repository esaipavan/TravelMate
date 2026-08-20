// ── Itinerary conflict / gap detection ───────────────────────────────────────
// Pure, reusable analysis of a trip's attached bookings. Honest by construction:
// it reasons ONLY from data that is actually stored — check-in dates, hotel
// nights, persisted departure times (startTime), destinations, and the trip's
// own date range. It deliberately does NOT infer arrival times or travel
// durations (those aren't stored), so it flags planning risks a human can act on
// rather than pretending to be a routing engine. Cancelled bookings are ignored.

import { formatDate, parseLocalDate } from '@/utils/formatters';
import type { BookingDraft } from '@/features/hotels/types';
import type { TripRow } from '../types';

export type IssueSeverity = 'warning' | 'info';

export interface ItineraryIssue {
  id: string;
  severity: IssueSeverity;
  title: string;
  detail: string;
}

const DAY = 86_400_000;
/** Fallback (no arrival time): departures closer than this are flagged as tight. */
const TIGHT_MIN = 60;
/** With a real arrival time: less than this to connect to the next leg is tight. */
const CONNECTION_BUFFER_MIN = 45;

const cityKey = (s: string) => s.split(',')[0].trim().toLowerCase();

const minutesOf = (hhmm: string): number => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

function nightsOf(b: BookingDraft): number {
  if (b.checkOut && b.checkIn) {
    const n = Math.round(
      (parseLocalDate(b.checkOut).getTime() - parseLocalDate(b.checkIn).getTime()) / DAY,
    );
    return Math.max(1, n);
  }
  return Math.max(1, b.nights || 1);
}

/**
 * Detect planning issues in a trip's attached bookings. Returns a de-duplicated,
 * severity-ordered list (warnings first). Empty when nothing is flagged.
 */
export function detectItineraryIssues(bookings: BookingDraft[], trip: TripRow): ItineraryIssue[] {
  // Cancelled bookings are inactive — never analyzed. Draft + confirmed both are.
  const active = bookings.filter((b) => b.status !== 'cancelled');
  const issues: ItineraryIssue[] = [];

  const hotels = active.filter((b) => b.mode === 'hotel' && b.checkIn);

  // ── A) Overlapping hotel nights (dates only — strong signal) ──────────────
  for (let i = 0; i < hotels.length; i++) {
    for (let j = i + 1; j < hotels.length; j++) {
      const a = hotels[i];
      const b = hotels[j];
      const aStart = parseLocalDate(a.checkIn!).getTime();
      const bStart = parseLocalDate(b.checkIn!).getTime();
      const aEnd = aStart + nightsOf(a) * DAY;
      const bEnd = bStart + nightsOf(b) * DAY;
      if (aStart < bEnd && bStart < aEnd) {
        issues.push({
          id: `hotel-overlap-${a.id}-${b.id}`,
          severity: 'warning',
          title: 'Overlapping hotel stays',
          detail: `“${a.title}” and “${b.title}” cover the same night — you may be booked into two stays at once.`,
        });
      }
    }
  }

  // ── B) Same-time departures / C) tight connections (persisted times) ──────
  const timed = active.filter((b) => b.startTime && b.checkIn);
  const byDay = new Map<string, BookingDraft[]>();
  for (const b of timed) {
    const list = byDay.get(b.checkIn!) ?? [];
    list.push(b);
    byDay.set(b.checkIn!, list);
  }
  for (const list of byDay.values()) {
    const sorted = [...list].sort((x, y) => minutesOf(x.startTime!) - minutesOf(y.startTime!));
    for (let k = 1; k < sorted.length; k++) {
      const prev = sorted[k - 1];
      const cur = sorted[k];
      const prevStart = minutesOf(prev.startTime!);
      const curStart = minutesOf(cur.startTime!);
      const on = formatDate(cur.checkIn!, 'MMM d');

      if (curStart === prevStart) {
        issues.push({
          id: `same-time-${prev.id}-${cur.id}`,
          severity: 'warning',
          title: 'Two bookings at the same time',
          detail: `“${prev.title}” and “${cur.title}” both start at ${cur.startTime} on ${on} — you can’t be on both.`,
        });
        continue;
      }

      if (prev.endTime) {
        // Real connection window: previous leg's arrival → next leg's departure.
        // If arrival <= its own start, the leg ends the next day.
        let prevEnd = minutesOf(prev.endTime);
        if (prevEnd <= prevStart) prevEnd += 1440;
        const connect = curStart - prevEnd;

        if (connect < 0) {
          issues.push({
            id: `overlap-${prev.id}-${cur.id}`,
            severity: 'warning',
            title: 'Overlapping bookings',
            detail: `“${prev.title}” runs until ${prev.endTime} but “${cur.title}” departs ${cur.startTime} on ${on} — they overlap.`,
          });
        } else if (connect < CONNECTION_BUFFER_MIN) {
          issues.push({
            id: `tight-${prev.id}-${cur.id}`,
            severity: 'info',
            title: 'Tight connection',
            detail: `Only ${connect} min between “${prev.title}” arriving (${prev.endTime}) and “${cur.title}” departing (${cur.startTime}) on ${on} — leave buffer for the transfer.`,
          });
        }
      } else if (curStart - prevStart < TIGHT_MIN) {
        // No arrival time on the earlier leg — fall back to departure spacing.
        issues.push({
          id: `tight-${prev.id}-${cur.id}`,
          severity: 'info',
          title: 'Tight connection',
          detail: `“${prev.title}” (${prev.startTime}) and “${cur.title}” (${cur.startTime}) are only ${curStart - prevStart} min apart on ${on} — leave buffer for the transfer.`,
        });
      }
    }
  }

  // ── D) Bookings dated outside the trip window (dates only) ────────────────
  for (const b of active) {
    if (!b.checkIn) continue;
    if (b.checkIn < trip.start_date || b.checkIn > trip.end_date) {
      issues.push({
        id: `outside-${b.id}`,
        severity: 'info',
        title: 'Outside trip dates',
        detail: `“${b.title}” is dated ${formatDate(b.checkIn, 'MMM d')}, outside your trip (${formatDate(trip.start_date, 'MMM d')} – ${formatDate(trip.end_date, 'MMM d')}).`,
      });
    }
  }

  // ── E) Hotel stay with no transport arriving into its city (gap) ──────────
  const arrivals = active.filter((b) => b.mode !== 'hotel' && b.checkIn);
  for (const h of hotels) {
    const hk = cityKey(h.destination);
    const hasArrival = arrivals.some(
      (t) => cityKey(t.destination) === hk && t.checkIn! <= h.checkIn!,
    );
    if (!hasArrival) {
      issues.push({
        id: `no-arrival-${h.id}`,
        severity: 'info',
        title: 'No arrival booked',
        detail: `No transport arrives in ${h.destination.split(',')[0]} on or before your ${formatDate(h.checkIn!, 'MMM d')} check-in — add a leg if you still need to get there.`,
      });
    }
  }

  // Warnings first, otherwise keep detection order (stable, deterministic).
  return issues
    .map((issue, index) => ({ issue, index }))
    .sort((a, b) => {
      const sev =
        (a.issue.severity === 'warning' ? 0 : 1) - (b.issue.severity === 'warning' ? 0 : 1);
      return sev !== 0 ? sev : a.index - b.index;
    })
    .map(({ issue }) => issue);
}
