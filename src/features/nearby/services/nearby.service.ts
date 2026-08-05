import type { NearbyPlace, NearbyResult, PlaceCategory } from '../types';

const NOMINATIM = 'https://nominatim.openstreetmap.org';
const GEOAPIFY = 'https://api.geoapify.com/v2/places';
const MAX_RESULTS = 200;

// Tried in order; stops at the first radius that returns at least one place.
const RETRY_RADII = [5_000, 10_000, 20_000] as const;

// Valid Geoapify category strings — verified against https://apidocs.geoapify.com/docs/places/#categories
const ALL_CATEGORIES = [
  // Restaurants
  'catering.restaurant',
  'catering.fast_food',
  'catering.cafe',
  'catering.bar',
  'catering.pub',
  // Hotels
  'accommodation.hotel',
  'accommodation.hostel',
  'accommodation.motel',
  'accommodation.guest_house',
  // Hospitals & Pharmacies
  'healthcare.hospital',
  'healthcare.clinic_or_praxis',
  'healthcare.pharmacy',
  // ATMs
  'service.financial.atm',
  'service.financial.bank',
  // Fuel
  'service.vehicle.fuel',
  // Shopping
  'commercial.shopping_mall',
  'commercial.marketplace',
  'commercial.supermarket',
  // Tourist Attractions
  'tourism.attraction',
  'tourism.sights',
  'entertainment.museum',
  'entertainment.zoo',
  'entertainment.theme_park',
  // Parks
  'leisure.park',
].join(',');

// Prefix-ordered: more-specific prefixes before their parents.
const CATEGORY_MAP: Array<{ prefix: string; category: PlaceCategory }> = [
  { prefix: 'healthcare.hospital', category: 'hospitals' },
  { prefix: 'healthcare.clinic_or_praxis', category: 'hospitals' },
  { prefix: 'healthcare.pharmacy', category: 'pharmacies' },
  { prefix: 'service.financial.atm', category: 'atms' },
  { prefix: 'service.financial.bank', category: 'atms' },
  { prefix: 'service.vehicle.fuel', category: 'fuel' },
  { prefix: 'leisure.park', category: 'parks' },
  { prefix: 'commercial', category: 'shopping' },
  { prefix: 'catering', category: 'restaurants' },
  { prefix: 'accommodation', category: 'hotels' },
  { prefix: 'tourism', category: 'attractions' },
  { prefix: 'entertainment', category: 'attractions' },
];

function resolveCategory(categories: string[]): PlaceCategory | null {
  for (const cat of categories) {
    for (const { prefix, category } of CATEGORY_MAP) {
      if (cat.startsWith(prefix)) return category;
    }
  }
  return null;
}

// Dev assertion: every requested category must map to a PlaceCategory.
if (import.meta.env.DEV) {
  const unmapped = ALL_CATEGORIES.split(',').filter((c) => resolveCategory([c]) === null);
  if (unmapped.length > 0) {
    console.warn(
      '[nearby] Categories requested but not in CATEGORY_MAP (results will be silently dropped):',
      unmapped,
    );
  }
}

async function geocode(query: string): Promise<{ lat: number; lon: number; displayName: string }> {
  const params = new URLSearchParams({ q: query, format: 'json', limit: '1' });
  const res = await fetch(`${NOMINATIM}/search?${params.toString()}`, {
    headers: { 'Accept-Language': 'en', 'User-Agent': 'TravelMate/1.0' },
  });
  if (!res.ok) throw new Error('Geocoding request failed');
  const results = (await res.json()) as Array<{
    lat: string;
    lon: string;
    display_name: string;
  }>;
  if (!results.length) throw new Error(`No location found for "${query}"`);
  return {
    lat: parseFloat(results[0].lat),
    lon: parseFloat(results[0].lon),
    displayName: results[0].display_name,
  };
}

interface GeoapifyFeature {
  properties: {
    place_id?: string;
    name?: string;
    address_line1?: string;
    address_line2?: string;
    categories?: string[];
    distance?: number;
    lat?: number;
    lon?: number;
    contact?: {
      phone?: string;
      website?: string;
    };
    opening_hours?: string;
  };
  geometry: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
}

interface GeoapifyResponse {
  features: GeoapifyFeature[];
}

async function fetchGeoapifyPlaces(
  lat: number,
  lon: number,
  radiusM: number,
): Promise<GeoapifyResponse> {
  const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;
  if (!apiKey) {
    throw new Error('Nearby Places service is unavailable. Please try again later.');
  }

  const params = new URLSearchParams({
    categories: ALL_CATEGORIES,
    filter: `circle:${lon},${lat},${radiusM}`,
    limit: String(MAX_RESULTS),
    apiKey,
  });

  if (import.meta.env.DEV) {
    console.warn(
      `[nearby] Geoapify request (radius ${radiusM / 1000} km):`,
      `${GEOAPIFY}?${params.toString()}`,
    );
  }

  const res = await fetch(`${GEOAPIFY}?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Places API error ${res.status}. Please try again.`);
  }

  const data = (await res.json()) as GeoapifyResponse;

  if (import.meta.env.DEV) {
    console.warn(
      `[nearby] API response (radius ${radiusM / 1000} km): ${data.features.length} features`,
      data,
    );
  }

  return data;
}

// Parse "Mo-Fr 07:00-21:00" style strings to determine if open now.
function parseOpenNow(openingHours: string | undefined): boolean | undefined {
  if (!openingHours) return undefined;
  if (openingHours.toLowerCase().includes('24/7')) return true;
  // Heuristic: presence of "Mo-Su" or "24" suggests always-open
  if (openingHours.includes('Mo-Su') && openingHours.includes('00:00-24:00')) return true;
  return undefined; // Cannot reliably parse complex hour strings
}

export async function fetchNearbyPlaces(destination: string): Promise<NearbyResult> {
  const geo = await geocode(destination);

  // Try each radius in order, stopping at the first one that returns results.
  let rawFeatures: GeoapifyFeature[] = [];
  let usedRadius = RETRY_RADII[RETRY_RADII.length - 1];

  for (const radiusM of RETRY_RADII) {
    const data = await fetchGeoapifyPlaces(geo.lat, geo.lon, radiusM);

    if (data.features.length > 0) {
      rawFeatures = data.features;
      usedRadius = radiusM;
      break;
    }

    if (import.meta.env.DEV) {
      const nextRadius = RETRY_RADII[RETRY_RADII.indexOf(radiusM) + 1];
      if (nextRadius) {
        console.warn(
          `[nearby] No results at ${radiusM / 1000} km — retrying with ${nextRadius / 1000} km…`,
        );
      } else {
        console.warn(`[nearby] No results at ${radiusM / 1000} km — all radii exhausted.`);
      }
    }
  }

  const seen = new Set<string>();
  const places: NearbyPlace[] = [];

  for (const feature of rawFeatures) {
    const p = feature.properties;
    const name = p.name?.trim();
    if (!name) continue;

    const category = resolveCategory(p.categories ?? []);

    if (import.meta.env.DEV) {
      console.warn(
        `[nearby] feature "${name}" | categories:`,
        p.categories,
        '→ resolved:',
        category,
      );
    }

    if (!category) continue;

    // Prefer property lat/lon; fall back to GeoJSON geometry (coordinates are [lon, lat]).
    const lat = p.lat ?? feature.geometry.coordinates[1];
    const lon = p.lon ?? feature.geometry.coordinates[0];
    if (!lat || !lon) continue;

    const key = `${name}|${lat.toFixed(4)}|${lon.toFixed(4)}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const address = [p.address_line1, p.address_line2].filter(Boolean).join(', ');

    places.push({
      id: p.place_id ?? key,
      name,
      address,
      category,
      lat,
      lon,
      distance: Math.round(p.distance ?? 0),
      phone: p.contact?.phone,
      website: p.contact?.website,
      openNow: parseOpenNow(p.opening_hours),
      openingHours: p.opening_hours,
    });
  }

  places.sort((a, b) => a.distance - b.distance);

  return {
    location: geo.displayName,
    lat: geo.lat,
    lon: geo.lon,
    places,
    radiusM: usedRadius,
  };
}
