import { geocodeLocation } from '@/lib/geocode';
import type { Hotel, HotelSearchParams } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// MOCK hotels provider — explicit and self-contained so it can be swapped for a
// real inventory API later without touching the UI/hooks. It DOES use the real
// discovery geocoder to anchor results to the correct place (coordinates +
// canonical name), so the location context is honest even though the inventory
// is synthetic. Results are deterministic per (destination, currency) so the
// experience is stable and testable.
// ─────────────────────────────────────────────────────────────────────────────

const AREA_POOL = [
  'City Centre',
  'Old Town',
  'Riverside',
  'Beachfront',
  'Business District',
  'Near the Station',
  'Market Quarter',
  'Hillside',
];

const NAME_PATTERNS: Array<(d: string, a: string) => string> = [
  (d, _a) => `The ${d} Grand`,
  (_d, a) => `${a} Boutique Stay`,
  (d, _a) => `${d} Heritage Inn`,
  (_d, a) => `${a} Comfort Suites`,
  (d, _a) => `Hotel ${d} Plaza`,
  (_d, a) => `${a} Riverside Residency`,
  (d, _a) => `${d} Skyline Hotel`,
  (_d, a) => `The ${a} Courtyard`,
];

const AMENITY_POOL = [
  'Free Wi-Fi',
  'Breakfast included',
  'Air conditioning',
  'Swimming pool',
  'Parking',
  'Airport shuttle',
  'Restaurant',
  '24h reception',
  'Gym',
  'Pet friendly',
  'Room service',
  'Spa',
];

/** Deterministic pseudo-random generator seeded from a string. */
function seeded(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rand: () => number, arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

function sample<T>(rand: () => number, arr: T[], count: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  for (let i = 0; i < count && copy.length; i++) {
    out.push(copy.splice(Math.floor(rand() * copy.length), 1)[0]);
  }
  return out;
}

const HOTEL_COUNT = 8;

export async function searchHotels(params: HotelSearchParams): Promise<Hotel[]> {
  const destination = params.destination.trim();
  if (!destination) return [];

  const currency = params.currency ?? 'INR';

  // Anchor to the real place via discovery. Coordinates make the results feel
  // located; if geocoding fails we still return synthetic results (honest —
  // clearly marked source: 'mock') rather than nothing.
  let baseLat: number | undefined;
  let baseLon: number | undefined;
  let placeName = destination.split(',')[0].trim();
  try {
    const geo = await geocodeLocation(destination);
    baseLat = geo.lat;
    baseLon = geo.lon;
    placeName = geo.displayName.split(',')[0].trim() || placeName;
  } catch {
    // Non-fatal — proceed with synthetic-only results.
  }

  const rand = seeded(`${destination.toLowerCase()}|${currency}`);
  // Rough nightly base by currency so numbers read plausibly.
  const baseNight = currency === 'INR' ? 3200 : currency === 'USD' ? 70 : 60;

  return Array.from({ length: HOTEL_COUNT }, (_, i): Hotel => {
    const area = pick(rand, AREA_POOL);
    const namer = NAME_PATTERNS[i % NAME_PATTERNS.length];
    const name = namer(placeName, area);
    const rating = Math.round((3.5 + rand() * 1.4) * 10) / 10; // 3.5–4.9
    const reviewCount = 80 + Math.floor(rand() * 1900);
    const priceMul = 0.6 + rand() * 2.2; // spread of budget → premium
    const pricePerNight = Math.round((baseNight * priceMul) / 10) * 10;
    const amenities = sample(rand, AMENITY_POOL, 3 + Math.floor(rand() * 3));
    const jitter = () => (rand() - 0.5) * 0.06;

    return {
      id: `mock-${i}-${destination.toLowerCase().replace(/\s+/g, '-')}`,
      name,
      area,
      destination,
      rating,
      reviewCount,
      pricePerNight,
      currency,
      amenities,
      lat: baseLat !== undefined ? baseLat + jitter() : undefined,
      lon: baseLon !== undefined ? baseLon + jitter() : undefined,
      source: 'mock',
    };
  });
}
