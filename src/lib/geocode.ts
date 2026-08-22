import { hasForeignContext } from '@/utils/destinationTheme';

// Shared Nominatim (OpenStreetMap) geocoding client. Both `nearby` and
// `weather` used to duplicate this request independently — this is the
// single source of truth so a fix (headers, error handling) only needs to
// happen once. No API key required; Nominatim's usage policy asks for an
// identifying User-Agent, which every request here sends.
//
// Coverage & accuracy: Nominatim indexes the full OSM place hierarchy —
// cities, towns, villages, hamlets, suburbs, and localities — so small/offbeat
// places are discoverable without any curated list. We fetch a handful of
// candidates (not just the top one) and rank them so a village whose name
// collides with a bigger place still resolves to the intended settlement.
//
// India-only scope: this is an India-only travel product, so every geocode is
// constrained to India (`countrycodes=in`). This both keeps foreign places from
// resolving as valid trip targets AND sharpens small-place discovery — a tiny
// Indian village named "X" is no longer outranked by a more "important" foreign
// namesake, because only Indian candidates are returned.

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';

/**
 * Coarse geographic scope of a resolved destination.
 *   • 'state' — the query resolved to a whole Indian state (Nominatim
 *     `addresstype === 'state'` / `place_rank === 8`). Its coordinates are the
 *     state polygon's centroid, so "nearby" is a whole-state view, not a tight
 *     local one. Callers can reframe the results accordingly.
 *   • 'place' — everything else: a city, town, village, suburb, district, or
 *     other point-like destination whose centre is a genuine local search origin.
 * This is a presentation hint ONLY; it never changes which candidate is picked
 * or the returned coordinates.
 */
export type GeocodeScope = 'state' | 'place';

export interface GeocodeResult {
  lat: number;
  lon: number;
  displayName: string;
  /** OSM class/type (e.g. place/village, place/city) when available — lets
   *  callers tell a real settlement apart from a road or POI match. */
  kind?: string;
  /** Whether the resolved destination is a whole state vs a point-like place.
   *  Derived from the selected candidate's Nominatim classification; does not
   *  affect coordinate selection. */
  scope: GeocodeScope;
}

interface NominatimPlace {
  lat: string;
  lon: string;
  display_name: string;
  class?: string;
  type?: string;
  importance?: number;
  addresstype?: string;
  /** Nominatim address rank. A whole state is rank 8; districts 10; cities 16+.
   *  Used only to classify the result's scope, never to rank/select it. */
  place_rank?: number;
}

// OSM `type` values that represent a real place/settlement, best first. A
// query that resolves to one of these is a genuine location; a match that is
// only a road/POI ranks below any settlement match so "search returns the
// correct real location first" holds even for small places.
const SETTLEMENT_TYPES = [
  'city',
  'town',
  'village',
  'hamlet',
  'suburb',
  'neighbourhood',
  'locality',
  'municipality',
  'county',
  'state',
  'administrative',
];

function settlementRank(place: NominatimPlace): number {
  const idx = SETTLEMENT_TYPES.indexOf(place.type ?? '');
  // Lower is better; non-settlement matches (roads, POIs) sort last.
  return idx === -1 ? SETTLEMENT_TYPES.length : idx;
}

// OSM `class` values that represent a genuine destination — a settlement, an
// administrative area, a natural feature, or a tourist/heritage site. A result
// whose class is outside this set (a shop, a road, an ATM, a building) is an
// incidental POI that merely shares the query's name; accepting it is how a
// foreign search like "Paris" resolved to a tailor shop in Mumbai, or "London"
// to a road in Pune. This is a denylist-by-omission of infrastructure/commercial
// POIs — NOT an allowlist of Indian places, so arbitrary Indian settlements
// (villages, hamlets, offbeat localities) all still resolve.
const DESTINATION_CLASSES = new Set([
  'place', // city / town / village / hamlet / suburb / locality / neighbourhood
  'boundary', // administrative areas (districts, mandals, cities-as-admin)
  'natural', // peaks, beaches, capes, islands
  'tourism', // attractions, viewpoints, museums, zoos
  'historic', // forts, monuments, ruins (Hampi, Golconda…)
  'leisure', // parks, nature reserves, wildlife sanctuaries
  'waterway', // rivers travelled to as destinations
  'water', // lakes / reservoirs
]);

// Business/lodging OSM `type`s that live INSIDE an allowed class (chiefly
// `tourism`) but are NOT a destination: a hotel/hostel named "Paris" is a
// business that merely shares the query name, not the city. Excluding these by
// type is what makes rejection deterministic instead of depending on which
// namesake Nominatim happens to rank first — e.g. a Kerala hotel literally
// named "paris" (class `tourism`) must never become the destination for a
// "Paris" search. Genuine tourist/heritage destinations (attraction, viewpoint,
// museum, fort, monument, park, beach…) are untouched.
const NON_DESTINATION_TYPES = new Set([
  'hotel',
  'guest_house',
  'hostel',
  'motel',
  'apartment',
  'chalet',
  'love_hotel',
  'bed_and_breakfast',
  'caravan_site',
  'information',
  'artwork',
]);

// A candidate is a genuine trip destination only when its class is an accepted
// destination class AND its type is not a business/lodging fixture. Applied as a
// filter across ALL candidates (not just the top-ranked one), so an incidental
// POI can never win merely by ranking first, and a query with no genuine place
// behind it is rejected deterministically.
function isGenuineDestination(place: NominatimPlace): boolean {
  return (
    !!place.class &&
    DESTINATION_CLASSES.has(place.class) &&
    !NON_DESTINATION_TYPES.has(place.type ?? '')
  );
}

// Shown to the user when a search is not a valid Indian destination. Deliberately
// generic and India-scoped — never the raw Nominatim/HTTP error text.
const INDIA_ONLY_MESSAGE = 'TravelMate currently supports destinations in India.';
const NOT_FOUND_MESSAGE =
  "We couldn't find that place in India. Check the spelling, or try a nearby town or city.";

// Picks the best candidate: prefer an exact name match, then a real
// settlement over a road/POI, then Nominatim's own importance score.
function pickBest(query: string, places: NominatimPlace[]): NominatimPlace {
  const wanted = query.trim().toLowerCase();

  const scored = places
    .map((p) => {
      const primaryName = (p.display_name.split(',')[0] ?? '').trim().toLowerCase();
      return {
        place: p,
        exact: primaryName === wanted ? 0 : 1,
        rank: settlementRank(p),
        importance: p.importance ?? 0,
      };
    })
    .sort((a, b) => a.exact - b.exact || a.rank - b.rank || b.importance - a.importance);

  return scored[0].place;
}

export async function geocodeLocation(query: string): Promise<GeocodeResult> {
  const trimmed = query.trim();
  if (!trimmed) throw new Error('Enter a place to search');

  // Foreign-place veto. `countrycodes=in` only guarantees the *result* is in
  // India — it does NOT stop a foreign query ("Dubai", "Singapore") from
  // matching an unrelated Indian namesake or POI. Reject a query that names a
  // foreign country/place up front (reusing the image resolver's veto) so a
  // foreign search is never silently converted into an unrelated Indian place.
  if (hasForeignContext(trimmed.toLowerCase())) {
    throw new Error(INDIA_ONLY_MESSAGE);
  }

  // `limit=5` + ranking (instead of the old blind `limit=1`) so a small place
  // isn't lost behind a more "important" namesake. `addressdetails` surfaces
  // the settlement type used for ranking.
  const params = new URLSearchParams({
    q: trimmed,
    format: 'json',
    limit: '8',
    addressdetails: '1',
    // India-only product scope — only Indian settlements are valid trip targets.
    countrycodes: 'in',
  });

  const res = await fetch(`${NOMINATIM_URL}/search?${params.toString()}`, {
    headers: { 'Accept-Language': 'en', 'User-Agent': 'TravelMate/1.0' },
  });

  if (!res.ok) throw new Error('Geocoding request failed');

  const results = (await res.json()) as NominatimPlace[];

  if (!results.length) throw new Error(NOT_FOUND_MESSAGE);

  const wanted = trimmed.toLowerCase();

  // Deterministic legitimacy gate. If the query EXACTLY names one or more OSM
  // records but NONE of those exact-named records is a genuine destination, the
  // query names a business / road / foreign namesake — a shop or hotel literally
  // called "Paris", a road called "London" — so reject it. Crucially this is
  // set-based (does any exact-named record qualify?), not "what ranked first",
  // so the outcome never depends on Nominatim's incidental ordering. It also
  // stops the query drifting to an unrelated Indian place that merely CONTAINS
  // the word (e.g. "Paris" → "Park Paris Town"), while still allowing a genuine
  // fuzzy/misspelled Indian query to resolve (e.g. "Tirupathi" → "Dwaraka
  // Tirumala", whose name is not an exact match, so this gate does not trigger).
  const exactNamed = results.filter(
    (p) => (p.display_name.split(',')[0] ?? '').trim().toLowerCase() === wanted,
  );
  if (exactNamed.length > 0 && !exactNamed.some(isGenuineDestination)) {
    throw new Error(NOT_FOUND_MESSAGE);
  }

  // Rank only genuine destinations, so an incidental POI (shop, road, hotel)
  // can never be selected even if Nominatim ranks it first.
  const genuine = results.filter(isGenuineDestination);
  if (!genuine.length) throw new Error(NOT_FOUND_MESSAGE);

  const best = pickBest(trimmed, genuine);

  const kind = best.class && best.type ? `${best.class}/${best.type}` : undefined;

  // Scope is a presentation hint derived from the ALREADY-selected candidate —
  // it is computed here purely to label the result, and deliberately does NOT
  // feed back into pickBest, isGenuineDestination, or the coordinates. A whole
  // Indian state (Goa, Kerala…) is Nominatim `addresstype === 'state'`, i.e.
  // `place_rank === 8`; every point-like place (city/town/village/suburb) and
  // even a district (rank 10) or a city-as-admin (Hyderabad, rank 16) is 'place'.
  const scope: GeocodeScope =
    best.addresstype === 'state' || best.place_rank === 8 ? 'state' : 'place';

  return {
    lat: parseFloat(best.lat),
    lon: parseFloat(best.lon),
    displayName: best.display_name,
    kind,
    scope,
  };
}
