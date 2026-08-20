// ── Trip itinerary export serializers ────────────────────────────────────────
// Pure functions that turn a trip's attached bookings into portable formats:
//   • buildItineraryICS  → an RFC 5545 .ics calendar
//   • buildItineraryText → a readable, day-by-day plain-text plan
//
// Honest by construction: they serialize ONLY stored data (dates, persisted
// departure times, hotel nights, status, totals). Cancelled bookings are never
// exported as active travel. Timed legs become timed events; bookings without a
// time become all-day / date-only entries — no invented times or durations.

import { differenceInDays } from 'date-fns';
import { formatCurrency, formatDate, parseLocalDate } from '@/utils/formatters';
import type { BookingDraft, BookingMode } from '@/features/hotels/types';
import type { TripRow } from '../types';
import { buildItinerary } from './tripItinerary';
import { computeTripTotals } from './tripTotals';

const MODE_LABEL: Record<BookingMode, string> = {
  hotel: 'Hotel',
  train: 'Train',
  bus: 'Bus',
  flight: 'Flight',
  local: 'Local',
};

/** Human label for the two exportable statuses (cancelled is never exported). */
function statusLabel(status: BookingDraft['status']): string {
  return status === 'confirmed' ? 'Confirmed' : 'Planned';
}

function activeBookings(bookings: BookingDraft[]): BookingDraft[] {
  return bookings.filter((b) => b.status !== 'cancelled');
}

function nightsOf(b: BookingDraft): number {
  if (b.checkOut && b.checkIn) {
    const n = Math.round(
      (parseLocalDate(b.checkOut).getTime() - parseLocalDate(b.checkIn).getTime()) / 86_400_000,
    );
    return Math.max(1, n);
  }
  return Math.max(1, b.nights || 1);
}

function addDaysISO(dateStr: string, n: number): string {
  const d = parseLocalDate(dateStr);
  d.setDate(d.getDate() + n);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${da}`;
}

export function itineraryFilename(trip: TripRow, ext: string): string {
  const base = (trip.title || trip.destination || 'trip')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return `${base || 'trip'}-itinerary.${ext}`;
}

// ── ICS calendar ─────────────────────────────────────────────────────────────

const icsDate = (dateStr: string) => dateStr.replace(/-/g, ''); // YYYYMMDD
const icsDateTime = (dateStr: string, hhmm: string) =>
  `${dateStr.replace(/-/g, '')}T${hhmm.replace(':', '')}00`; // floating local time

const minutesOf = (hhmm: string): number => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

function escICS(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/** Fold lines to 75 octets per RFC 5545 (continuation lines start with a space). */
function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const parts: string[] = [];
  let rest = line;
  parts.push(rest.slice(0, 75));
  rest = rest.slice(75);
  while (rest.length > 0) {
    parts.push(' ' + rest.slice(0, 74));
    rest = rest.slice(74);
  }
  return parts.join('\r\n');
}

/**
 * Build an .ics calendar for the trip. `stamp` is the DTSTAMP (pass Date.now()
 * from the caller so this stays pure/testable). Cancelled bookings excluded.
 * Undated bookings are skipped (they can't be placed on a calendar).
 */
export function buildItineraryICS(trip: TripRow, bookings: BookingDraft[], stamp: number): string {
  const dtstamp = new Date(stamp)
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
  const active = activeBookings(bookings).filter((b) => b.checkIn);

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TravelMate//Itinerary//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escICS(trip.title || trip.destination)} itinerary`,
  ];

  for (const b of active) {
    const mode = MODE_LABEL[b.mode] ?? 'Booking';
    const label = statusLabel(b.status);
    const summary = escICS(`${b.title} — ${mode} (${label})`);
    const descParts = [b.subtitle, `${label} · ${formatCurrency(b.total, b.currency)}`].filter(
      Boolean,
    );

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${b.id}@travelmate`);
    lines.push(`DTSTAMP:${dtstamp}`);

    if (b.startTime) {
      // Timed leg → event at the stored departure (floating local time).
      lines.push(`DTSTART:${icsDateTime(b.checkIn!, b.startTime)}`);
      if (b.endTime) {
        // Real span when an arrival time exists. If arrival <= departure the
        // leg ends the next day, so advance the end date by one.
        const overnight = minutesOf(b.endTime) <= minutesOf(b.startTime);
        const endDate = overnight ? addDaysISO(b.checkIn!, 1) : b.checkIn!;
        lines.push(`DTEND:${icsDateTime(endDate, b.endTime)}`);
      }
      // No arrival time → point event (DTSTART only), as before — honest.
    } else if (b.mode === 'hotel') {
      // Hotel stay → all-day event spanning the nights (DTEND is exclusive).
      lines.push(`DTSTART;VALUE=DATE:${icsDate(b.checkIn!)}`);
      lines.push(`DTEND;VALUE=DATE:${icsDate(addDaysISO(b.checkIn!, nightsOf(b)))}`);
    } else {
      // Untimed non-hotel → single all-day entry (honest date-only).
      lines.push(`DTSTART;VALUE=DATE:${icsDate(b.checkIn!)}`);
      lines.push(`DTEND;VALUE=DATE:${icsDate(addDaysISO(b.checkIn!, 1))}`);
    }

    lines.push(`SUMMARY:${summary}`);
    if (descParts.length) lines.push(`DESCRIPTION:${escICS(descParts.join(' · '))}`);
    if (b.destination) lines.push(`LOCATION:${escICS(b.destination)}`);
    lines.push(`STATUS:${b.status === 'confirmed' ? 'CONFIRMED' : 'TENTATIVE'}`);
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.map(foldLine).join('\r\n');
}

// ── Plain-text day-by-day plan ───────────────────────────────────────────────

export function buildItineraryText(trip: TripRow, bookings: BookingDraft[]): string {
  const active = activeBookings(bookings);
  const days = buildItinerary(active);
  const tripStart = parseLocalDate(trip.start_date);
  const tripEnd = parseLocalDate(trip.end_date);

  const out: string[] = [];
  out.push(trip.title || 'Trip itinerary');
  out.push(
    `${trip.destination} · ${formatDate(trip.start_date, 'MMM d')} – ${formatDate(trip.end_date, 'MMM d, yyyy')}`,
  );
  out.push('');

  for (const day of days) {
    if (day.date) {
      const d = parseLocalDate(day.date);
      const inRange = d >= tripStart && d <= tripEnd;
      const dn = inRange ? ` (Day ${differenceInDays(d, tripStart) + 1})` : '';
      out.push(`${formatDate(day.date, 'EEE, MMM d')}${dn}`);
    } else {
      out.push('Dates to be confirmed');
    }

    for (const b of day.bookings) {
      const when = b.startTime
        ? b.endTime
          ? `${b.startTime}–${b.endTime}`
          : b.startTime
        : 'All day';
      const mode = MODE_LABEL[b.mode] ?? 'Booking';
      const sub = b.subtitle ? ` — ${b.subtitle}` : '';
      out.push(
        `  ${when}  ${mode} · ${b.title}${sub}  [${statusLabel(b.status)}]  ${formatCurrency(b.total, b.currency)}`,
      );
    }
    out.push('');
  }

  const totals = computeTripTotals(active, trip.currency);
  if (totals.primary) {
    const { total, confirmedTotal, currency } = totals.primary;
    const confirmed =
      confirmedTotal > 0 ? ` (${formatCurrency(confirmedTotal, currency)} confirmed)` : '';
    out.push(`Estimated cost: ${formatCurrency(total, currency)}${confirmed}`);
  }
  out.push('Generated by TravelMate');

  return out.join('\n');
}
