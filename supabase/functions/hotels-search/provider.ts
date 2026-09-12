import { fetchWithTimeout, isAbortError } from './utils.ts';
import type { HotelResult, HotelsSearchRequest } from './types.ts';

// Real hotel data via a RapidAPI-hosted Booking.com-family hotel-search API
// (default host: booking-com.p.rapidapi.com — a different RapidAPI hotel API
// can be substituted by changing HOTELS_API_HOST, as long as it exposes a
// compatible locations + hotel-search pair; see resolveLocation/fetchListings
// below). Chosen over Booking.com's own official Affiliate API (requires
// partner approval and traffic history — a blocker for a new app) and over
// Amadeus's self-service tier (its free "test" environment has real coverage
// gaps outside major markets, a poor fit for this India-wide, small-town
// product).
//
// IMPORTANT — field-mapping confidence: the request/response shapes below
// follow this API family's widely-documented public shape, but I have no
// live key to verify them against a real response. Every field is read
// defensively (optional chaining + fallbacks, never a hard crash on a
// missing/renamed field) specifically so a shape mismatch degrades to a
// missing field (e.g. no photo, no amenities) rather than breaking the whole
// search. If real responses don't match once a key is configured, only this
// file needs adjusting — see the module comment in index.ts.

export class HotelProviderError extends Error {
  readonly reason: 'not_configured' | 'rate_limited' | 'upstream_error';
  constructor(reason: HotelProviderError['reason'], message: string) {
    super(message);
    this.name = 'HotelProviderError';
    this.reason = reason;
  }
}

function apiKey(): string {
  const key = Deno.env.get('HOTELS_API_KEY');
  if (!key) {
    throw new HotelProviderError(
      'not_configured',
      'Hotel search is not configured yet (HOTELS_API_KEY is unset).',
    );
  }
  return key;
}

function apiHost(): string {
  return Deno.env.get('HOTELS_API_HOST') ?? 'booking-com.p.rapidapi.com';
}

function rapidApiHeaders(): HeadersInit {
  return {
    'X-RapidAPI-Key': apiKey(),
    'X-RapidAPI-Host': apiHost(),
  };
}

async function rapidApiGet(path: string, params: Record<string, string>): Promise<unknown> {
  const url = `https://${apiHost()}${path}?${new URLSearchParams(params).toString()}`;
  let res: Response;
  try {
    res = await fetchWithTimeout(url, { headers: rapidApiHeaders() });
  } catch (err) {
    if (isAbortError(err)) {
      throw new HotelProviderError('upstream_error', 'Hotel search request timed out.');
    }
    throw new HotelProviderError('upstream_error', 'Hotel search request failed.');
  }

  if (res.status === 429) {
    throw new HotelProviderError(
      'rate_limited',
      'Hotel search provider is temporarily rate-limited.',
    );
  }
  if (!res.ok) {
    throw new HotelProviderError('upstream_error', `Hotel search provider error ${res.status}.`);
  }
  return res.json();
}

interface LocationMatch {
  destId: string;
  destType: string;
}

// Step 1: resolve the destination NAME (not lat/lon — this API family's
// hotel-search endpoint needs its own internal location id, not raw
// coordinates) to a provider-specific dest_id/dest_type. `destination` is
// the frontend's already-geocoded, India-verified display name — reusing
// geocodeLocation()'s result (rather than re-geocoding here) means this
// function inherits every wrong-place safety fix already built into
// src/lib/geocode.ts without duplicating that logic in Deno.
async function resolveLocation(destination: string): Promise<LocationMatch | null> {
  // First comma-part only — same convention the mock provider already used
  // ("Gachibowli, Hyderabad" → "Gachibowli") so a specific locality doesn't
  // get diluted into a citywide search.
  const query = destination.split(',')[0]?.trim() || destination;

  const data = (await rapidApiGet('/v1/hotels/locations', {
    name: query,
    locale: 'en-gb',
  })) as unknown;

  const matches = Array.isArray(data) ? data : [];
  // Prefer an India match when the provider's own location search returns
  // several same-named places worldwide — this product is India-only (see
  // src/lib/geocode.ts's own India-only scope), so a same-named foreign city
  // must never win over a genuine Indian one just by being first in an
  // unranked list.
  const india =
    matches.find(
      (m) => typeof m === 'object' && m !== null && 'country' in m && m.country === 'India',
    ) ?? matches[0];
  if (!india || typeof india !== 'object') return null;

  const m = india as Record<string, unknown>;
  const destId = m.dest_id ?? m.destId ?? m.id;
  const destType = m.dest_type ?? m.destType ?? 'city';
  if (destId === undefined || destId === null) return null;

  return { destId: String(destId), destType: String(destType) };
}

// Booking.com's own review score is 0–10; this app's `Hotel.rating` is 0–5
// (see src/features/hotels/types.ts) — halved here, once, at the source, so
// every downstream consumer (HotelCard, BookingReviewDialog, sort-by-rating)
// keeps working unchanged for the 0–5 scale it already assumes.
// Exported purely for unit testing — pure, no Deno/network access (same
// convention as src/features/nearby/services/savedPlaces.service.ts's
// toSavedPlace). searchHotels/resolveLocation/fetchListings stay untested
// here since they need a real key to verify against; see the module comment
// above about field-mapping confidence.
export function normalizeRating(raw: unknown): number {
  const n = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.round((n / 2) * 10) / 10;
}

function firstNumber(...values: unknown[]): number {
  for (const v of values) {
    const n = typeof v === 'number' ? v : Number(v);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return 0;
}

export function mapHotel(
  raw: Record<string, unknown>,
  fallbackCurrency: string,
): HotelResult | null {
  const id = raw.hotel_id ?? raw.id;
  const name = raw.hotel_name ?? raw.name;
  if (id === undefined || id === null || typeof name !== 'string' || !name.trim()) return null;

  const priceBreakdown =
    typeof raw.price_breakdown === 'object' && raw.price_breakdown !== null
      ? (raw.price_breakdown as Record<string, unknown>)
      : undefined;

  return {
    id: String(id),
    name,
    // "area" — Booking.com's search result carries a district/neighbourhood
    // name inconsistently; fall back to the city so the card never shows a
    // blank location line.
    area:
      (typeof raw.district === 'string' && raw.district) ||
      (typeof raw.city === 'string' && raw.city) ||
      '',
    rating: normalizeRating(raw.review_score),
    reviewCount: firstNumber(raw.review_nr, raw.reviewCount),
    pricePerNight: firstNumber(priceBreakdown?.gross_price, raw.min_total_price, raw.price),
    currency:
      (typeof raw.currencycode === 'string' && raw.currencycode) ||
      (typeof raw.currency_code === 'string' && raw.currency_code) ||
      fallbackCurrency,
    // Facility names aren't reliably present on the basic search response
    // (a separate per-hotel details call carries them, which this endpoint
    // deliberately doesn't make — one extra upstream call per HOTEL would
    // multiply request volume against a metered free tier). Better an
    // honestly empty list than guessed amenities.
    amenities: [],
    lat: typeof raw.latitude === 'number' ? raw.latitude : undefined,
    lon: typeof raw.longitude === 'number' ? raw.longitude : undefined,
    imageUrl: typeof raw.main_photo_url === 'string' ? raw.main_photo_url : undefined,
    stars: typeof raw.class === 'number' && raw.class > 0 ? raw.class : undefined,
  };
}

// Step 2: the actual listings for a resolved location + dates + guests.
async function fetchListings(
  location: LocationMatch,
  req: HotelsSearchRequest,
): Promise<HotelResult[]> {
  const currency = req.currency ?? 'INR';
  const data = (await rapidApiGet('/v1/hotels/search', {
    dest_id: location.destId,
    dest_type: location.destType,
    checkin_date: req.checkIn,
    checkout_date: req.checkOut,
    adults_number: String(Math.max(1, req.guests)),
    room_number: '1',
    order_by: 'popularity',
    filter_by_currency: currency,
    locale: 'en-gb',
    units: 'metric',
  })) as unknown;

  const obj = typeof data === 'object' && data !== null ? (data as Record<string, unknown>) : {};
  const rawResults = Array.isArray(obj.result) ? obj.result : [];

  const hotels: HotelResult[] = [];
  for (const entry of rawResults) {
    if (typeof entry !== 'object' || entry === null) continue;
    const mapped = mapHotel(entry as Record<string, unknown>, currency);
    if (mapped) hotels.push(mapped);
  }
  return hotels;
}

/**
 * Real hotel search for one destination/date-range/guest-count. Returns an
 * empty array for a genuine "no listings" result (not an error — the caller
 * distinguishes that from a thrown HotelProviderError). Throws
 * HotelProviderError with a classified `reason` on any failure — never
 * returns fabricated data.
 */
export async function searchHotels(req: HotelsSearchRequest): Promise<HotelResult[]> {
  const location = await resolveLocation(req.destination);
  if (!location) return [];
  return fetchListings(location, req);
}
