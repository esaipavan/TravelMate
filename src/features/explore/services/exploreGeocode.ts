import { hasForeignContext } from '@/utils/destinationTheme';
import type { ExploreScope } from '../types';

// A deliberately separate, small Nominatim client for AREA-level queries
// ("places to visit in Telangana", "places to visit in India") — NOT a
// modification of `src/lib/geocode.ts`, which is a mature, heavily-tuned
// resolver for single-point destinations (forts, temples, exact places) with
// a lot of hard-won disambiguation logic, and is depended on by Nearby,
// Weather, Hotels, and Local. A whole-country/whole-state discovery query is
// a different problem (broad-area lookup, not point disambiguation), so it
// gets its own small module rather than risking a regression in that one.
// What IS reused: the same Nominatim host/params shape, and the exported
// `hasForeignContext` veto (so "places to visit in Nepal" is honestly
// rejected, not silently mismatched to an Indian namesake).

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';

const INDIA_ONLY_MESSAGE = 'TravelMate currently supports destinations in India.';
const NOT_FOUND_MESSAGE = "We couldn't find that place in India. Check the spelling and try again.";

export type ExploreGeocodeErrorKind = 'not_found' | 'unavailable';

export class ExploreGeocodeError extends Error {
  readonly kind: ExploreGeocodeErrorKind;
  constructor(kind: ExploreGeocodeErrorKind, message: string) {
    super(message);
    this.name = 'ExploreGeocodeError';
    this.kind = kind;
  }
}

export interface ExploreGeocodeResult {
  lat: number;
  lon: number;
  displayName: string;
  scope: ExploreScope;
  /** [south, north, west, east], parsed from Nominatim's `boundingbox`. */
  boundingBox: [number, number, number, number];
}

interface NominatimAdminPlace {
  lat: string;
  lon: string;
  display_name: string;
  class?: string;
  type?: string;
  addresstype?: string;
  /** Verified live against Nominatim: country=4, state=8, state_district=10,
   *  city=16 (see PR discussion / exploreGeocode.test.ts for the live probe). */
  place_rank?: number;
  boundingbox?: [string, string, string, string];
}

/** Pure — no network. Exported for unit testing. */
export function classifyScope(
  addresstype: string | undefined,
  placeRank: number | undefined,
): ExploreScope {
  if (addresstype === 'country' || placeRank === 4) return 'country';
  if (addresstype === 'state' || placeRank === 8) return 'state';
  if (addresstype === 'state_district' || addresstype === 'county' || placeRank === 10) {
    return 'district';
  }
  return 'city';
}

// Strips a leading "places to visit in / things to do in / top places in"
// style phrase down to the location itself. Falls back to the whole trimmed
// query when no such phrase is present, so a bare "Telangana" or "Hyderabad"
// search still works. Pure — exported for unit testing.
const LOCATION_PHRASE_RE =
  /^(?:top\s+|best\s+|popular\s+)?(?:places?|things?|spots?|attractions?)\s+(?:to\s+(?:visit|see|do|explore)\s+)?(?:in|at|near|around)\s+(.+)$/i;

export function extractLocationQuery(query: string): string {
  const trimmed = query.trim();
  const match = LOCATION_PHRASE_RE.exec(trimmed);
  return (match?.[1] ?? trimmed).trim();
}

export async function geocodeAdminArea(rawQuery: string): Promise<ExploreGeocodeResult> {
  const location = extractLocationQuery(rawQuery);
  if (!location) throw new ExploreGeocodeError('not_found', 'Enter a place to search');

  // Same foreign-place veto `geocodeLocation` uses — `countrycodes=in` only
  // guarantees the RESULT is in India, not that a foreign query couldn't
  // match an unrelated Indian namesake first.
  if (hasForeignContext(location.toLowerCase())) {
    throw new ExploreGeocodeError('not_found', INDIA_ONLY_MESSAGE);
  }

  const params = new URLSearchParams({
    q: location,
    format: 'json',
    limit: '5',
    addressdetails: '1',
    countrycodes: 'in',
  });

  let res: Response;
  try {
    res = await fetch(`${NOMINATIM_URL}/search?${params.toString()}`, {
      headers: { 'Accept-Language': 'en', 'User-Agent': 'TravelMate/1.0' },
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    throw new ExploreGeocodeError('unavailable', 'Geocoding request failed');
  }

  if (!res.ok) throw new ExploreGeocodeError('unavailable', 'Geocoding request failed');

  const results = (await res.json()) as NominatimAdminPlace[];
  if (!results.length) throw new ExploreGeocodeError('not_found', NOT_FOUND_MESSAGE);

  // Prefer a genuine administrative/place record over an incidental POI
  // (shop, road) that might otherwise rank first for the same query text.
  const best = results.find((p) => p.class === 'boundary' || p.class === 'place') ?? results[0];

  const bbox = best.boundingbox;
  if (!bbox) throw new ExploreGeocodeError('not_found', NOT_FOUND_MESSAGE);

  return {
    lat: parseFloat(best.lat),
    lon: parseFloat(best.lon),
    displayName: best.display_name,
    scope: classifyScope(best.addresstype, best.place_rank),
    boundingBox: [
      parseFloat(bbox[0]),
      parseFloat(bbox[1]),
      parseFloat(bbox[2]),
      parseFloat(bbox[3]),
    ],
  };
}
