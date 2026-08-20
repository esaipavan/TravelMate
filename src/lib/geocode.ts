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

export interface GeocodeResult {
  lat: number;
  lon: number;
  displayName: string;
  /** OSM class/type (e.g. place/village, place/city) when available — lets
   *  callers tell a real settlement apart from a road or POI match. */
  kind?: string;
}

interface NominatimPlace {
  lat: string;
  lon: string;
  display_name: string;
  class?: string;
  type?: string;
  importance?: number;
  addresstype?: string;
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

  if (!results.length) throw new Error(`No place found in India for "${trimmed}"`);

  const best = pickBest(trimmed, results);
  const kind = best.class && best.type ? `${best.class}/${best.type}` : undefined;

  return {
    lat: parseFloat(best.lat),
    lon: parseFloat(best.lon),
    displayName: best.display_name,
    kind,
  };
}
