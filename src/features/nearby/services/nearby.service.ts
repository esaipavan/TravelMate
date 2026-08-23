import { geocodeLocation } from '@/lib/geocode';
import type { GeocodeScope } from '@/lib/geocode';
import { CATEGORY_PRIORITY } from '../types';
import type { NearbyPlace, NearbyResult, PlaceCategory } from '../types';

const GEOAPIFY = 'https://api.geoapify.com/v2/places';
const MAX_RESULTS = 200;

// Distinguishes the two very different reasons a nearby lookup can fail so the
// UI can tell them apart instead of collapsing both into "location not found":
//   • 'not_found'    — geocoding rejected the destination (invalid / unsupported
//                      / not an Indian place). The place itself is the problem.
//   • 'unavailable'  — geocoding SUCCEEDED but the places provider (Geoapify)
//                      failed (missing key, HTTP error, network). The location is
//                      fine; the service is temporarily unavailable.
// A successful geocode that simply returns zero nearby places is NOT an error —
// it resolves to a NearbyResult with an empty `places` array (a distinct UI
// state), so it is deliberately not represented here.
export type NearbyErrorKind = 'not_found' | 'unavailable';

export class NearbyError extends Error {
  readonly kind: NearbyErrorKind;
  constructor(kind: NearbyErrorKind, message: string) {
    super(message);
    this.name = 'NearbyError';
    this.kind = kind;
  }
}

// Tried smallest-first; widened only to reach genuinely nearby strong
// attractions (see searchPlacesNear / STRONG_ATTRACTION_TARGET).
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

// Priority-ordered mapping from Geoapify category prefixes to our UI category.
// A single Geoapify feature usually carries SEVERAL category strings (e.g. a
// pharmacy comes back as `["commercial", "commercial.chemist",
// "healthcare.pharmacy"]`). `resolveCategory` walks THIS list top-to-bottom and
// returns the first entry any of the feature's categories matches — so the most
// specific / most travel-relevant meaning wins regardless of the order Geoapify
// happened to list them. The broad `commercial` fallback is deliberately LAST,
// which is what stops pharmacies/medical shops from being mislabelled as
// generic "shopping" (the audited "Apollo pharmacy → shopping" bug).
const CATEGORY_MAP: Array<{ prefix: string; category: PlaceCategory }> = [
  { prefix: 'leisure.park', category: 'parks' },
  { prefix: 'tourism', category: 'attractions' },
  { prefix: 'entertainment', category: 'attractions' },
  { prefix: 'accommodation', category: 'hotels' },
  { prefix: 'catering', category: 'restaurants' },
  { prefix: 'healthcare.pharmacy', category: 'pharmacies' },
  { prefix: 'healthcare.hospital', category: 'hospitals' },
  { prefix: 'healthcare.clinic_or_praxis', category: 'hospitals' },
  { prefix: 'service.financial.atm', category: 'atms' },
  { prefix: 'service.financial.bank', category: 'atms' },
  { prefix: 'service.vehicle.fuel', category: 'fuel' },
  { prefix: 'commercial', category: 'shopping' },
];

function resolveCategory(categories: string[]): PlaceCategory | null {
  for (const { prefix, category } of CATEGORY_MAP) {
    if (categories.some((c) => c.startsWith(prefix))) return category;
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

// Great-circle distance in metres. Geoapify's /v2/places response does not
// include a `distance` property (verified against the live API) despite the
// field existing on GeoapifyFeature.properties below for other endpoints —
// so distance is computed here from the search origin instead of trusting a
// field that is, in practice, always absent.
function haversineDistanceM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6_371_000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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
    throw new NearbyError(
      'unavailable',
      'Nearby Places service is unavailable. Please try again later.',
    );
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
    throw new NearbyError('unavailable', `Places API error ${res.status}. Please try again.`);
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

// Detects ONLY unambiguous, whole-string always-open schedules, so the "Open now"
// badge can never falsely mark a place open. This is deliberately not a full
// opening-hours parser and does not evaluate the current day/time: it exact-matches
// the two always-open forms and returns undefined (no badge) for everything else.
// A compound schedule that merely CONTAINS a 24h clause (e.g.
// "Mo-Su 10:00-22:00; PH 00:00-24:00") is not always-open and must not read as open.
// Never returns false — an unknown state is shown as "no badge", not "closed".
function parseOpenNow(openingHours: string | undefined): boolean | undefined {
  if (!openingHours) return undefined;
  const hours = openingHours.trim().replace(/\s+/g, ' ');
  if (/^24\/7$/i.test(hours)) return true;
  if (hours === 'Mo-Su 00:00-24:00') return true;
  return undefined;
}

// Radius selection is driven by NEARBY STRONG ATTRACTIONS, not by raw/usable
// count. A "strong attraction" is a genuine discovery place — CATEGORY_PRIORITY
// 0, i.e. an `attractions` or `parks` result. Restaurants, hotels, shopping and
// every utility (hospitals/pharmacies/atms/fuel) are deliberately NOT counted:
// they exist almost everywhere and can't distinguish a rich destination from a
// sparse one. (The old "12 usable OR 6 travel-relevant" rule both under-expanded
// — Goa stopped at 5 km with 1 attraction while 10 km had 17 — and over-expanded
// — Dwaraka Tirumala widened to 20 km of far, mislabelled village POIs.)
function isStrongAttraction(category: PlaceCategory): boolean {
  return CATEGORY_PRIORITY[category] === 0;
}

// A strong attraction only counts toward radius health if it is genuinely
// NEARBY. 8 km is a short local radius: it keeps a destination's own attractions
// (e.g. Goa's heritage sites ~5-6 km from the geocoded centroid) while excluding
// the far, incoherent POIs a wide Geoapify query drags in from neighbouring
// towns (Dwaraka Tirumala's 10-18 km village offices, Borra Caves 17 km from
// Araku). A traveller's "nearby" attraction is a short hop, not a day trip.
const STRONG_ATTRACTION_PROXIMITY_M = 8_000;

// How many nearby strong attractions make a radius good enough to stop widening.
// Reaching it at 5 km keeps dense/heritage destinations on the tight radius;
// falling short lets an attraction-sparse centroid widen to the radius that
// actually surfaces real attractions — but only when those additions are inside
// the proximity cap above (so a wider radius can never help merely by returning
// more distant POIs).
const STRONG_ATTRACTION_TARGET = 4;

function nearbyStrongAttractionCount(places: NearbyPlace[]): number {
  return places.filter(
    (p) => isStrongAttraction(p.category) && p.distance <= STRONG_ATTRACTION_PROXIMITY_M,
  ).length;
}

// Normalise a name for deduplication ONLY (the displayed name is untouched):
// lower-case, drop any parenthetical qualifier ("Vishnu Nivasam (TTD)" →
// "vishnu nivasam"), reduce punctuation to spaces, and collapse whitespace.
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

// Map + filter + dedupe one radius's raw features into displayable places.
// Filters: no name, single-char / non-word-character names (rejects garbage
// like "M"), no resolvable category, no coordinates. Dedup collapses the SAME
// normalised name within the same ~100 m cell (3-decimal coords) — enough to
// merge name-variant duplicates of one place, while genuinely different
// branches (which sit in different cells) are preserved.
function mapFeatures(
  features: GeoapifyFeature[],
  originLat: number,
  originLon: number,
): NearbyPlace[] {
  const seen = new Set<string>();
  const places: NearbyPlace[] = [];

  for (const feature of features) {
    const p = feature.properties;
    const name = p.name?.trim();
    // Name-quality gate: must exist, be more than one character, and contain a
    // real letter/number (any script — keeps Indian-language names). Conservative
    // by design: a legitimate 2-character Indian name still passes.
    if (!name || name.length < 2 || !/[\p{L}\p{N}]/u.test(name)) continue;

    const category = resolveCategory(p.categories ?? []);
    if (!category) continue;

    // Prefer property lat/lon; fall back to GeoJSON geometry (coordinates are [lon, lat]).
    const lat = p.lat ?? feature.geometry.coordinates[1];
    const lon = p.lon ?? feature.geometry.coordinates[0];
    if (!lat || !lon) continue;

    const key = `${normalizeName(name)}|${lat.toFixed(3)}|${lon.toFixed(3)}`;
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
      distance: Math.round(haversineDistanceM(originLat, originLon, lat, lon)),
      source: 'geoapify',
      phone: p.contact?.phone,
      website: p.contact?.website,
      openNow: parseOpenNow(p.opening_hours),
      openingHours: p.opening_hours,
    });
  }

  return places;
}

// Relevance-first ordering. Category priority (discovery > utilities) is the
// PRIMARY key so the first cards are things a traveller wants; distance is a
// meaningful secondary tiebreaker (kept, never hidden); name is a final stable
// tiebreaker so ordering is deterministic run-to-run.
function rankPlaces(places: NearbyPlace[]): NearbyPlace[] {
  return [...places].sort(
    (a, b) =>
      CATEGORY_PRIORITY[a.category] - CATEGORY_PRIORITY[b.category] ||
      a.distance - b.distance ||
      a.name.localeCompare(b.name),
  );
}

// Shared by both entry points below (geocoded search and "near me").
//
// Attraction-first radius selection: widen ONLY to surface genuinely nearby
// strong attractions, never to inflate the raw count.
//   • Stop at the smallest radius that already has >= STRONG_ATTRACTION_TARGET
//     nearby strong attractions (dense/heritage destinations → one 5 km request).
//   • Otherwise widen — but because a query returns EVERY POI inside its radius,
//     the nearby-strong count cannot grow once the query radius already covers
//     STRONG_ATTRACTION_PROXIMITY_M. So once a radius at/beyond that cap still
//     falls short, a wider radius can only add distant POIs: we stop and keep the
//     tightest radius that had any usable places (an honest small set, never
//     padded with far-away POIs — that under-count naturally shows the existing
//     "resolved but limited nearby data" state rather than a fake full feed).
async function searchPlacesNear(
  originLat: number,
  originLon: number,
  displayName: string,
  scope: GeocodeScope,
): Promise<NearbyResult> {
  let selected: { places: NearbyPlace[]; radiusM: number } | null = null;
  let firstNonEmpty: { places: NearbyPlace[]; radiusM: number } | null = null;

  for (const radiusM of RETRY_RADII) {
    const data = await fetchGeoapifyPlaces(originLat, originLon, radiusM);
    const mapped = mapFeatures(data.features, originLat, originLon);

    // Remember the tightest radius that produced any usable place — the honest
    // fallback when no radius reaches the attraction target.
    if (!firstNonEmpty && mapped.length > 0) firstNonEmpty = { places: mapped, radiusM };

    const nearbyStrong = nearbyStrongAttractionCount(mapped);
    if (nearbyStrong >= STRONG_ATTRACTION_TARGET) {
      selected = { places: mapped, radiusM };
      break;
    }

    // A wider radius cannot add MORE nearby strong attractions than this query
    // already returned (any it holds are beyond the proximity cap). Once we have
    // a usable set at/after the cap, stop rather than drag in far/incoherent POIs.
    if (radiusM >= STRONG_ATTRACTION_PROXIMITY_M && firstNonEmpty) {
      if (import.meta.env.DEV) {
        console.warn(
          `[nearby] ${radiusM / 1000} km: ${nearbyStrong} nearby strong attractions ` +
            `(< ${STRONG_ATTRACTION_TARGET}); wider radius would only add distant POIs — keeping the tight set.`,
        );
      }
      break;
    }

    if (import.meta.env.DEV) {
      console.warn(
        `[nearby] ${radiusM / 1000} km: ${nearbyStrong} nearby strong attractions ` +
          `(< ${STRONG_ATTRACTION_TARGET}) — widening…`,
      );
    }
  }

  const chosen = selected ??
    firstNonEmpty ?? {
      places: [] as NearbyPlace[],
      radiusM: RETRY_RADII[RETRY_RADII.length - 1],
    };

  return {
    location: displayName,
    lat: originLat,
    lon: originLon,
    places: rankPlaces(chosen.places),
    radiusM: chosen.radiusM,
    scope,
  };
}

export async function fetchNearbyPlaces(destination: string): Promise<NearbyResult> {
  let geo;
  try {
    geo = await geocodeLocation(destination);
  } catch (err) {
    // Geocoding rejected the destination → a 'not_found' problem with the place
    // itself (kept distinct from a downstream provider failure below). Preserve
    // geocode's own India-scoped message.
    throw new NearbyError('not_found', err instanceof Error ? err.message : 'Location not found');
  }
  // Beyond this point the location resolved; any failure is a provider problem,
  // surfaced by fetchGeoapifyPlaces as NearbyError('unavailable').
  return searchPlacesNear(geo.lat, geo.lon, geo.displayName, geo.scope);
}

// "Near me" entry point — skips geocoding entirely and searches directly
// from the device's coordinates, per the Phase 1 requirement that Near Me
// "does not require geocoding". Coordinates are a precise point, so this is
// always a point-like ('place') scope, never a whole-state view.
export async function fetchNearbyPlacesAtCoords(lat: number, lon: number): Promise<NearbyResult> {
  return searchPlacesNear(lat, lon, 'Your current location', 'place');
}
