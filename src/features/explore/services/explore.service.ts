import { chatWithAI } from '@/services/ai/ai.service';
import type { AIMessage, AIRequestOptions } from '@/services/ai/ai.types';
import { geocodeAdminArea, ExploreGeocodeError } from './exploreGeocode';
import type { ExploreGeocodeResult } from './exploreGeocode';
import { ExploreError } from '../types';
import type { ExplorePlace, ExploreScope, ExploreSearchResult } from '../types';

const GEOAPIFY = 'https://api.geoapify.com/v2/places';

// "Places to visit" categories only — deliberately narrower than Nearby's
// full category list (no hotels/restaurants/utilities), since this widget is
// specifically about discovery, not travel logistics. Verified against the
// live Geoapify API (a bare "historic" category, tried initially, is REJECTED
// with a 400 — Geoapify has no such top-level category; forts/heritage/ruins
// are tagged under tourism.sights.* instead, same as nearby.service.ts's own
// verified ALL_CATEGORIES list already relies on).
const DISCOVERY_CATEGORIES = [
  'tourism.attraction',
  'tourism.sights',
  'entertainment.museum',
  'entertainment.zoo',
  'entertainment.theme_park',
  'leisure.park',
  'natural',
].join(',');

const GEOAPIFY_LIMIT = 60;
const CITY_RADIUS_M = 15_000;
const DISTRICT_RADIUS_M = 30_000;
const AI_RESULT_COUNT = 12;
const FALLBACK_RESULT_COUNT = 12;

interface GeoapifyFeature {
  properties: {
    place_id?: string;
    name?: string;
    categories?: string[];
    city?: string;
    suburb?: string;
    state?: string;
    /** Geoapify's own country name for THIS place — used as a defense-in-depth
     *  filter below, independent of which geometry filter was used to find it. */
    country?: string;
    lat?: number;
    lon?: number;
  };
  geometry: { coordinates: [number, number] };
}

interface GeoapifyResponse {
  features: GeoapifyFeature[];
}

const GEOAPIFY_GEOCODE = 'https://api.geoapify.com/v1/geocode/search';

// For country/state scope, resolves Geoapify's OWN place id for the admin
// area so the Places search can filter by its real polygon boundary
// (`filter=place:<id>`) instead of a rectangular bounding box. Verified live
// this matters, not just theoretically: India's bounding RECTANGLE also
// covers parts of Pakistan and Afghanistan (its shape isn't a rectangle), so
// a plain `rect` filter for "places to visit in India" returned places
// tagged Pakistan/Afghanistan. `filter=place:<id>` uses the actual admin
// polygon and does not have this problem (also verified live). Returns null
// (never throws) on any failure so the caller falls back to the bbox rect —
// degraded, but the post-fetch country check in mapFeaturesToPlaces below is
// still a second line of defense either way.
async function fetchGeoapifyBoundaryPlaceId(
  locationLabel: string,
  scope: 'country' | 'state',
  apiKey: string,
): Promise<string | null> {
  try {
    const params = new URLSearchParams({ text: locationLabel, type: scope, apiKey });
    const res = await fetch(`${GEOAPIFY_GEOCODE}?${params.toString()}`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      features?: Array<{ properties?: { place_id?: string } }>;
    };
    return data.features?.[0]?.properties?.place_id ?? null;
  } catch {
    return null;
  }
}

// city/district scope searches a circle around the geocoded centroid (same
// pattern as nearby.service.ts). state/country scope prefers Geoapify's own
// boundary-polygon `place:` filter (see fetchGeoapifyBoundaryPlaceId above);
// only if that lookup fails does it fall back to a `rect` filter built from
// Nominatim's bounding box, which can leak across borders for an
// irregularly-shaped area.
async function buildFilter(geo: ExploreGeocodeResult, apiKey: string): Promise<string> {
  if (geo.scope === 'country' || geo.scope === 'state') {
    const placeId = await fetchGeoapifyBoundaryPlaceId(geo.displayName, geo.scope, apiKey);
    if (placeId) return `place:${placeId}`;
    const [south, north, west, east] = geo.boundingBox;
    return `rect:${west},${south},${east},${north}`;
  }
  const radiusM = geo.scope === 'district' ? DISTRICT_RADIUS_M : CITY_RADIUS_M;
  return `circle:${geo.lon},${geo.lat},${radiusM}`;
}

async function fetchDiscoveryPlaces(geo: ExploreGeocodeResult): Promise<GeoapifyFeature[]> {
  const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;
  if (!apiKey) {
    throw new ExploreError('unavailable', 'Places search is unavailable right now.');
  }

  const params = new URLSearchParams({
    categories: DISCOVERY_CATEGORIES,
    filter: await buildFilter(geo, apiKey),
    limit: String(GEOAPIFY_LIMIT),
    apiKey,
  });

  let res: Response;
  try {
    res = await fetch(`${GEOAPIFY}?${params.toString()}`, { signal: AbortSignal.timeout(10_000) });
  } catch {
    throw new ExploreError('unavailable', 'Places search is unavailable right now.');
  }
  if (!res.ok) throw new ExploreError('unavailable', `Places API error ${res.status}.`);

  const data = (await res.json()) as GeoapifyResponse;
  return data.features;
}

// Most-specific-first category label, mirroring the same pattern (and several
// of the same verified tag prefixes) as nearby.service.ts's HIGHLIGHT_MAP.
const CATEGORY_LABELS: Array<{ prefix: string; label: string }> = [
  { prefix: 'tourism.sights.fort', label: 'Fort' },
  { prefix: 'tourism.sights.castle', label: 'Heritage' },
  { prefix: 'tourism.sights.memorial', label: 'Heritage' },
  { prefix: 'tourism.sights.ruins', label: 'Heritage' },
  { prefix: 'tourism.sights', label: 'Heritage' },
  { prefix: 'tourism.attraction.viewpoint', label: 'Viewpoint' },
  { prefix: 'tourism.attraction', label: 'Attraction' },
  { prefix: 'entertainment.museum', label: 'Museum' },
  { prefix: 'entertainment.zoo', label: 'Zoo' },
  { prefix: 'entertainment.theme_park', label: 'Theme Park' },
  { prefix: 'leisure.park', label: 'Park' },
  { prefix: 'historic', label: 'Heritage' },
  { prefix: 'natural', label: 'Nature' },
];

/** Pure — exported for unit testing. */
export function deriveCategoryLabel(categories: string[] | undefined): string {
  if (!categories) return 'Attraction';
  for (const { prefix, label } of CATEGORY_LABELS) {
    if (categories.some((c) => c.startsWith(prefix))) return label;
  }
  return 'Attraction';
}

function mapFeaturesToPlaces(features: GeoapifyFeature[]): ExplorePlace[] {
  const seen = new Set<string>();
  const places: ExplorePlace[] = [];

  for (const feature of features) {
    const p = feature.properties;

    // Defense in depth: never show a place Geoapify itself tags as being in
    // a different country, regardless of which geometry filter found it —
    // the bbox-rect fallback in buildFilter can leak across a border for an
    // irregularly-shaped area (verified live for India/Pakistan), and this
    // is the last line of defense against that. Lenient when the field is
    // simply absent (Geoapify doesn't always tag it) — only an EXPLICIT
    // non-India country is grounds to drop a result.
    if (p.country && p.country !== 'India') continue;

    const name = p.name?.trim();
    if (!name || name.length < 2 || !/[\p{L}\p{N}]/u.test(name)) continue;

    const lat = p.lat ?? feature.geometry.coordinates[1];
    const lon = p.lon ?? feature.geometry.coordinates[0];
    if (!lat || !lon) continue;

    const id = p.place_id ?? `${name}|${lat.toFixed(3)}|${lon.toFixed(3)}`;
    if (seen.has(id)) continue;
    seen.add(id);

    places.push({
      id,
      name,
      category: deriveCategoryLabel(p.categories),
      locality: p.suburb || p.city || undefined,
      state: p.state || undefined,
      lat,
      lon,
      aiRanked: false,
    });
  }

  return places;
}

interface AIRankedPlace {
  id: string;
  blurb: string;
}

function buildRankingPrompt(query: string, scope: ExploreScope, places: ExplorePlace[]): string {
  const list = places.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    locality: p.locality,
    state: p.state,
  }));
  const diversityNote =
    scope === 'country' || scope === 'state'
      ? 'The list spans a large region — prefer places spread across DIFFERENT cities/areas rather than clustering in one place, when the list allows it.'
      : '';

  return [
    `A traveller searched: "${query}".`,
    `From ONLY the following real, verified places (JSON list), pick up to ${AI_RESULT_COUNT} of the most notable/worth-visiting ones, best first.`,
    diversityNote,
    'You MUST NOT invent any place that is not in this list. Every "id" you return must be copied exactly from the list.',
    'Write a single short (max 20 words), factual, non-hyperbolic one-line description for each you pick.',
    `Places: ${JSON.stringify(list)}`,
    'Respond with ONLY a valid JSON array (no markdown, no explanation), in this exact shape:',
    '[{"id": "string (copied exactly from the list)", "blurb": "string"}]',
  ]
    .filter(Boolean)
    .join('\n');
}

function parseAIRankedPlaces(raw: unknown): AIRankedPlace[] {
  if (!Array.isArray(raw)) throw new Error('AI_INVALID_JSON');
  const result: AIRankedPlace[] = [];
  for (const entry of raw) {
    if (
      typeof entry === 'object' &&
      entry !== null &&
      typeof (entry as Record<string, unknown>).id === 'string' &&
      typeof (entry as Record<string, unknown>).blurb === 'string'
    ) {
      const e = entry as { id: string; blurb: string };
      result.push({ id: e.id, blurb: e.blurb });
    }
  }
  return result;
}

// Cross-checks every AI-returned id against the real Geoapify result set and
// silently drops anything that doesn't match — the guardrail that makes this
// feature safe despite the sibling AI feature
// (destination-intel/services/ai-destination.provider.ts) having been fully
// disabled after it invented attractions that didn't exist. The AI may
// select and describe; it can never add. Exported for unit testing.
export function applyAIGuardrail(
  ranked: AIRankedPlace[],
  validIds: ReadonlySet<string>,
): Map<string, string> {
  const blurbs = new Map<string, string>();
  for (const r of ranked) {
    if (validIds.has(r.id) && !blurbs.has(r.id)) blurbs.set(r.id, r.blurb);
  }
  return blurbs;
}

async function rankWithAI(
  query: string,
  scope: ExploreScope,
  places: ExplorePlace[],
): Promise<Map<string, string>> {
  const messages: AIMessage[] = [
    { role: 'user', content: buildRankingPrompt(query, scope, places) },
  ];
  const options: AIRequestOptions = {
    systemPrompt:
      'You are a travel-listing curator. You only select and describe items from the exact list you are given — ' +
      'you never invent new places. Respond ONLY with valid JSON — no markdown fences, no explanation.',
  };

  const response = await chatWithAI(messages, options);
  const cleaned = response.content
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error('AI_INVALID_JSON');
  }

  const ranked = parseAIRankedPlaces(parsed);
  const validIds = new Set(places.map((p) => p.id));
  return applyAIGuardrail(ranked, validIds);
}

export async function searchPlaces(query: string): Promise<ExploreSearchResult> {
  const trimmed = query.trim();
  if (!trimmed) {
    throw new ExploreError(
      'not_found',
      'Enter a place to search, e.g. "places to visit in Telangana".',
    );
  }

  let geo: ExploreGeocodeResult;
  try {
    geo = await geocodeAdminArea(trimmed);
  } catch (err) {
    if (err instanceof ExploreGeocodeError) throw new ExploreError(err.kind, err.message);
    throw new ExploreError('not_found', err instanceof Error ? err.message : 'Location not found');
  }

  const features = await fetchDiscoveryPlaces(geo);
  const places = mapFeaturesToPlaces(features);

  if (places.length === 0) {
    throw new ExploreError(
      'empty',
      `We couldn't find any places to visit for "${geo.displayName}" yet.`,
    );
  }

  let finalPlaces = places;
  let isAICurated = false;

  try {
    const blurbs = await rankWithAI(trimmed, geo.scope, places);
    if (blurbs.size > 0) {
      const byId = new Map(places.map((p) => [p.id, p]));
      const curated: ExplorePlace[] = [];
      for (const [id, blurb] of blurbs) {
        const p = byId.get(id);
        if (p) curated.push({ ...p, blurb, aiRanked: true });
      }
      finalPlaces = curated;
      isAICurated = true;
    }
  } catch {
    // Honest degrade: AI unavailable/invalid — fall back to the real, unranked
    // places below rather than showing an error, since the underlying data
    // (Geoapify's real POIs) is still valid even without AI curation.
  }

  if (!isAICurated) {
    finalPlaces = [...places]
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, FALLBACK_RESULT_COUNT);
  }

  return {
    query: trimmed,
    scope: geo.scope,
    locationLabel: geo.displayName,
    places: finalPlaces,
    isAICurated,
  };
}
