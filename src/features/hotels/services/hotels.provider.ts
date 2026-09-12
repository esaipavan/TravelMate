import { supabase } from '@/lib/supabase';
import { geocodeLocation } from '@/lib/geocode';
import type { Hotel, HotelSearchParams } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Real hotels provider — calls the `hotels-search` Supabase Edge Function
// (supabase/functions/hotels-search/), which holds the actual third-party API
// key server-side and returns already-normalized, provider-agnostic results.
// Geocoding stays client-side via the app's own geocodeLocation() — the same
// India-verified, wrong-place-safe resolver every other feature uses (see
// src/lib/geocode.ts) — so the Edge Function is handed a resolved lat/lon
// and canonical name, never a raw, unverified destination string.
//
// No mock fallback: if the Edge Function isn't configured yet (no
// HOTELS_API_KEY secret set) or the upstream provider fails, this throws —
// the existing "Couldn't load hotels for that place" error state in
// HotelsPage.tsx surfaces it honestly. Silently falling back to fabricated
// data would defeat the entire point of this being a real provider.
// ─────────────────────────────────────────────────────────────────────────────

// Mirrors supabase/functions/hotels-search/types.ts — kept as an independent
// copy since Deno and the Vite frontend don't share a module graph (same
// convention as src/services/ai/ai.types.ts vs the ai-chat function's own
// types.ts).
interface HotelResult {
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

interface HotelsSearchResponse {
  hotels: HotelResult[];
  reason?: 'no_results';
}

export async function searchHotels(params: HotelSearchParams): Promise<Hotel[]> {
  const destination = params.destination.trim();
  if (!destination) return [];

  if (!params.checkIn || !params.checkOut) {
    throw new Error('Check-in and check-out dates are required to search hotels.');
  }

  // Real, India-verified anchor — the same resolver Nearby/Weather/every
  // other place-aware feature relies on, including its safety fixes (never
  // silently substitutes a wrong real place for a plausible misspelling).
  const geo = await geocodeLocation(destination);

  const result = await supabase.functions.invoke<HotelsSearchResponse>('hotels-search', {
    body: {
      destination: geo.displayName,
      lat: geo.lat,
      lon: geo.lon,
      checkIn: params.checkIn,
      checkOut: params.checkOut,
      guests: params.guests ?? 2,
      currency: params.currency ?? 'INR',
    },
  });

  if (result.error) {
    const msg = result.error instanceof Error ? result.error.message : 'Hotel search failed';
    throw new Error(msg);
  }
  if (!result.data) throw new Error('No response from hotel search service');

  const currency = params.currency ?? 'INR';
  return result.data.hotels.map((h): Hotel => ({
    id: h.id,
    name: h.name,
    area: h.area || geo.displayName.split(',')[0].trim(),
    destination,
    rating: h.rating,
    reviewCount: h.reviewCount,
    pricePerNight: h.pricePerNight,
    currency: h.currency || currency,
    amenities: h.amenities,
    lat: h.lat,
    lon: h.lon,
    imageUrl: h.imageUrl,
    stars: h.stars,
    source: 'live',
  }));
}
