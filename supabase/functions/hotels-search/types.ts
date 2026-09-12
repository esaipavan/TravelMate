// Request/response contract for the hotels-search Edge Function. Kept
// independent from src/features/hotels/types.ts (Deno and the Vite frontend
// don't share a module graph — same reasoning as ai-chat/types.ts vs
// src/services/ai/ai.types.ts) but deliberately mirrors the frontend's
// `Hotel` shape field-for-field so hotels.provider.ts can pass the response
// straight through with no per-field remapping.

export interface HotelsSearchRequest {
  /** Canonical display name from the frontend's own geocodeLocation() —
   *  already resolved, India-verified, and safe against the wrong-place
   *  substitution bugs that resolveDestination() guards against. Used for
   *  display/logging only; lat/lon drive the actual provider lookup. */
  destination: string;
  lat: number;
  lon: number;
  /** YYYY-MM-DD. Required — real per-night pricing has no honest meaning
   *  without dates. */
  checkIn: string;
  checkOut: string;
  guests: number;
  currency?: string;
}

export interface HotelResult {
  id: string;
  name: string;
  area: string;
  rating: number;
  reviewCount: number;
  pricePerNight: number;
  currency: string;
  amenities: string[];
  lat?: number;
  lon?: number;
  imageUrl?: string;
  stars?: number;
}

// `reason` distinguishes a genuinely empty result (a real destination with no
// listings for these dates) from nothing at all — the frontend needs this to
// show "no hotels found" rather than silently rendering nothing.
export interface HotelsSearchResponse {
  hotels: HotelResult[];
  reason?: 'no_results';
}

// Mirrors ai-chat's error-response shape: a safe, generic message plus an
// optional machine-readable `reason` so the frontend can tell "not
// configured yet" apart from "provider is rate-limited/down" apart from a
// generic failure — each needs different UI copy, and neither should ever
// read as "this destination has no hotels" (that's a `reason: 'no_results'`
// 200, not an error).
export interface HotelsSearchError {
  error: string;
  reason?: 'not_configured' | 'rate_limited' | 'upstream_error';
}
