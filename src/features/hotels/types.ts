// ── Hotels feature types ────────────────────────────────────────────────────
// Kept deliberately generic where possible so trains / buses / flights / local
// transport can follow the same booking-draft pattern later.

export interface HotelSearchParams {
  /** Destination or discovered-place name — the location context from discovery. */
  destination: string;
  checkIn?: string; // YYYY-MM-DD
  checkOut?: string; // YYYY-MM-DD
  guests?: number;
  currency?: string;
}

export interface Hotel {
  id: string;
  name: string;
  /** Neighbourhood / area within the destination. */
  area: string;
  destination: string;
  rating: number; // 0–5
  reviewCount: number;
  pricePerNight: number;
  currency: string;
  amenities: string[];
  lat?: number;
  lon?: number;
  /** Where this result came from. `mock` today — an explicit marker so a real
   *  provider adapter can be told apart in the UI when one is added. */
  source: 'mock';
}

// ── Booking drafts (mode-agnostic) ──────────────────────────────────────────
// A booking draft lives inside the app (persisted locally) until a real
// booking backend exists. `mode` lets the same store hold future transport
// bookings without a schema change here.

export type BookingMode = 'hotel' | 'train' | 'bus' | 'flight' | 'local';

// Lifecycle: a booking starts as a planned `draft`, can be `confirmed` (committed
// travel), or `cancelled` (inactive — kept for reference but excluded from trip
// totals). No payment/real reservation exists yet; these are honest planning states.
export type BookingStatus = 'draft' | 'confirmed' | 'cancelled';

export interface BookingDraft {
  id: string;
  mode: BookingMode;
  /** Primary label — e.g. the hotel name. */
  title: string;
  /** Secondary label — e.g. area · dates. */
  subtitle: string;
  destination: string;
  checkIn?: string;
  checkOut?: string;
  /** Local 'HH:mm' start time when the source result provides one (train/bus/
   *  flight departure, local pickup). Omitted for date-only bookings (hotels).
   *  Used by the itinerary to sort within a day; never fabricated. */
  startTime?: string;
  /** Local 'HH:mm' arrival/end time when the source provides one (train/bus/
   *  flight arrival, local estimated ride end). If it is <= startTime the leg
   *  ends the next day. Omitted when no honest end time exists (e.g. hotels use
   *  the checkOut date instead). Lets export emit real spans and conflict
   *  detection reason about connection windows; never fabricated. */
  endTime?: string;
  guests?: number;
  nights: number;
  unitPrice: number; // per night for hotels
  total: number;
  currency: string;
  tripId?: string | null;
  createdAt: number;
  status: BookingStatus;
}
