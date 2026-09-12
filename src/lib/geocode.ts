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

/**
 * Structured place identity, derived from Nominatim's `addressdetails=1`
 * response (already requested for ranking — this just stops discarding it).
 * `locality` is the most specific settlement name available (village / town /
 * city / municipality / suburb, in that preference order) — deliberately NOT
 * the same as `displayName`'s first comma-part, which can be a landmark or
 * road name rather than the settlement itself.
 */
export interface LocationHierarchy {
  locality?: string;
  district?: string;
  state?: string;
  country?: string;
  countryCode?: string;
}

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
  /** Structured locality/district/state/country, when Nominatim's address
   *  breakdown resolved one. Present for the vast majority of results (any
   *  point-like place); absent only if Nominatim omits `address` entirely. */
  location?: LocationHierarchy;
}

/**
 * A UI-safe representation of one candidate place when `geocodeLocation`
 * cannot confidently pick between several (see `GeocodeError` below).
 * Deliberately excludes anything internal to the resolution algorithm —
 * no raw OSM class/type, no importance score, no match tier — only what a
 * candidate-selection UI actually needs to show and to hand off to the
 * existing coordinate-based Nearby search path once chosen.
 */
export interface PlaceCandidate {
  name: string;
  locality?: string;
  district?: string;
  state?: string;
  country?: string;
  lat: number;
  lon: number;
}

/**
 * Distinguishes WHY `geocodeLocation` failed so callers/UI can respond
 * honestly instead of collapsing every failure into "not found" (Phase 9):
 *   • 'not_found'  — no genuine Indian destination matches the query at all
 *                    (unrecognised place, foreign query, business/road
 *                    namesake with no genuine destination behind it).
 *   • 'ambiguous'  — multiple genuinely different places plausibly match and
 *                    the evidence doesn't support confidently picking one
 *                    (see resolveDestination's CORE PRINCIPLE: WRONG PLACE >
 *                    NO PLACE). `candidates` on the error carries the
 *                    UI-safe options.
 *   • 'unavailable' — the query itself may well be fine, but the geocoding
 *                    service failed (network, timeout, non-2xx response).
 *                    Must never be presented as "place not found".
 */
export type GeocodeErrorKind = 'not_found' | 'ambiguous' | 'unavailable';

export class GeocodeError extends Error {
  readonly kind: GeocodeErrorKind;
  readonly candidates?: PlaceCandidate[];
  constructor(kind: GeocodeErrorKind, message: string, candidates?: PlaceCandidate[]) {
    super(message);
    this.name = 'GeocodeError';
    this.kind = kind;
    this.candidates = candidates;
  }
}

interface NominatimAddress {
  village?: string;
  town?: string;
  city?: string;
  municipality?: string;
  suburb?: string;
  county?: string;
  state_district?: string;
  state?: string;
  country?: string;
  country_code?: string;
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
  /** Present because every request sets `addressdetails=1`. */
  address?: NominatimAddress;
}

/** Builds the structured hierarchy from Nominatim's address breakdown. Picks
 *  the most specific settlement name available for `locality` so a village or
 *  suburb keeps its own name instead of collapsing into its parent district —
 *  this is the piece that lets "Mangalagiri" display as itself rather than
 *  silently reading as "Vijayawada" or the district name. */
function buildLocationHierarchy(
  address: NominatimAddress | undefined,
): LocationHierarchy | undefined {
  if (!address) return undefined;
  // Bug fix (Phase 9, found while testing "Kondapur"): `suburb` must be
  // checked BEFORE `city` — a suburb is more local/specific than its
  // containing city, but the old order picked `city` first whenever both
  // were present (real Nominatim address breakdowns for a suburb always
  // include the parent city too), so a Kondapur search's structured
  // `location.locality` silently resolved to "Hyderabad". The display name
  // shown elsewhere (DestinationOverview) happened to read the raw
  // display_name string instead and so wasn't affected, but any caller
  // trusting this structured field directly would have been.
  const locality =
    address.village || address.town || address.suburb || address.city || address.municipality;
  const district = address.state_district || address.county;
  const hierarchy: LocationHierarchy = {
    locality: locality || undefined,
    district: district || undefined,
    state: address.state || undefined,
    country: address.country || undefined,
    countryCode: address.country_code ? address.country_code.toUpperCase() : undefined,
  };
  // Every field is optional/undefined when Nominatim's address had nothing —
  // callers must not render "undefined" or empty separators from this.
  return hierarchy;
}

/** Joins the parts of a LocationHierarchy that are actually present into a
 *  single display string (e.g. "Guntur District · Andhra Pradesh"), never
 *  emitting "undefined" or a duplicate of the locality name itself. */
export function formatLocationHierarchy(
  location: LocationHierarchy | undefined,
  opts: { includeLocality?: boolean; includeCountry?: boolean } = {},
): string {
  if (!location) return '';
  const { includeLocality = false, includeCountry = false } = opts;
  const parts: string[] = [];
  if (includeLocality && location.locality) parts.push(location.locality);
  if (location.district && location.district !== location.locality) {
    parts.push(
      /district$/i.test(location.district) ? location.district : `${location.district} District`,
    );
  }
  if (location.state && location.state !== location.district) parts.push(location.state);
  if (includeCountry && location.country) parts.push(location.country);
  return parts.join(' · ');
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

// Bug fix (Phase 7, live-verified against Nominatim): a place of worship is a
// genuine, commonly-searched Indian destination — Birla Mandir, Meenakshi
// Temple, Jama Masjid, Ramappa Temple, Sri Ranganathaswamy Temple, the
// Basilica of Bom Jesus — but OSM tags these `amenity=place_of_worship` or
// `building=temple`/`church`/`mosque`/`cathedral`/`shrine`, neither of which
// is in DESTINATION_CLASSES ('amenity' and 'building' are both far too broad
// to allow wholesale — most amenities/buildings genuinely aren't
// destinations). Before this fix, searching any of the places above returned
// "Location not found" outright. This is a narrow, explicit (class, type)
// allowlist, not a broadening of DESTINATION_CLASSES itself, so it can't
// reopen the "Paris → tailor shop" problem those classes were built to keep
// out — a shop/restaurant/bank tagged `amenity=*` is still rejected.
const DESTINATION_CLASS_TYPE_PAIRS = new Set([
  'amenity/place_of_worship',
  'building/temple',
  'building/church',
  'building/mosque',
  'building/cathedral',
  'building/shrine',
]);

// A candidate is a genuine trip destination when its class is an accepted
// destination class (and its type is not a business/lodging fixture), OR its
// exact (class, type) pair is an explicitly allowed heritage/religious
// building above. Applied as a filter across ALL candidates (not just the
// top-ranked one), so an incidental POI can never win merely by ranking
// first, and a query with no genuine place behind it is rejected
// deterministically.
// Exported purely for unit testing — no network involved.
export function isGenuineDestination(place: NominatimPlace): boolean {
  if (
    !!place.class &&
    DESTINATION_CLASSES.has(place.class) &&
    !NON_DESTINATION_TYPES.has(place.type ?? '')
  ) {
    return true;
  }
  return DESTINATION_CLASS_TYPE_PAIRS.has(`${place.class ?? ''}/${place.type ?? ''}`);
}

// Shown to the user when a search is not a valid Indian destination. Deliberately
// generic and India-scoped — never the raw Nominatim/HTTP error text.
const INDIA_ONLY_MESSAGE = 'TravelMate currently supports destinations in India.';
const NOT_FOUND_MESSAGE =
  "We couldn't find that place in India. Check the spelling, or try a nearby town or city.";

// Picks the best candidate: prefer an exact name match, then Nominatim's own
// importance score, then settlement-type as a final tiebreak.
//
// Bug fix (Phase 7, live-verified against Nominatim): importance must be
// checked BEFORE settlementRank, not after. With rank checked first, a
// well-known urban suburb like Hyderabad's "Kondapur" (place/suburb,
// importance 0.1467) lost to an obscure rural village of the identical name
// in a different district (place/village, importance 0.1467 — nearly
// identical baseline importance) purely because "village" ranks above
// "suburb" in SETTLEMENT_TYPES — even though the suburb was Nominatim's own
// #1 result and had the HIGHER importance of the two. Importance is
// Nominatim's actual real-world-prominence signal and is what should decide
// between several places that share an exact name; settlementRank is kept
// only as a last-resort tiebreak for the rare case importance ties exactly.
// Exported purely for unit testing (regression coverage for the bug fix
// documented above) — no network involved.
export function pickBest(query: string, places: NominatimPlace[]): NominatimPlace {
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
    .sort((a, b) => a.exact - b.exact || b.importance - a.importance || a.rank - b.rank);

  return scored[0].place;
}

// ── Name matching (Phase 8) ─────────────────────────────────────────────────
//
// Phase 7 fixed two class/ranking bugs but exposed a deeper problem: a single
// boolean "exact match" cannot tell "Sri Meenakshi Amman Temple" (Madurai's
// actual, overwhelmingly famous temple) apart from an unrelated Bengaluru
// place that happens to be named exactly "Meenakshi Temple" — the honorific
// ("Sri") and an extra word ("Amman") make the real temple's name literally
// not equal to the query, so it never even competed. Likewise, two genuine
// same-named temples (Ramappa Temple, Palampet vs Hanumakonda) can both be
// exact matches with no reliable signal to prefer one — silently picking
// either is worse than admitting the query is ambiguous (CORE PRINCIPLE:
// WRONG PLACE > NO PLACE).
//
// This section adds a small, generalizable matching layer used ONLY to
// select among already-`isGenuineDestination`-filtered candidates. It never
// changes which OSM classes/types are accepted (that boundary — business/
// foreign-namesake protection — is entirely Phase 7's, untouched here), and
// it deliberately does NOT modify pickBest() (still used, unmodified, for
// settlement-vs-settlement collisions like Kondapur, where Phase 7's
// importance-then-rank logic is already proven correct).

// Common Indian honorific prefixes seen on temple names — stripped only when
// they appear as a genuine LEADING token followed by more content (never
// mid-string, never leaving an empty remainder), so "Sri Meenakshi Amman
// Temple" normalizes toward "meenakshi amman temple" without stripping
// meaning from anywhere else in the string.
const HONORIFIC_PREFIXES = ['sri', 'shri', 'sree', 'shree'];

/** Lowercase, trim, collapse whitespace, normalize punctuation to spaces, and
 *  drop a single leading honorific token. This is comparison-only — never
 *  used for display. */
function normalizeName(s: string): string {
  const cleaned = s
    .toLowerCase()
    .trim()
    .replace(/[.,'"()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const [first, ...rest] = cleaned.split(' ');
  if (rest.length > 0 && HONORIFIC_PREFIXES.includes(first)) {
    return rest.join(' ');
  }
  return cleaned;
}

// Category-describing nouns that appear in countless unrelated place names —
// matching on these ALONE is not identity evidence ("Meenakshi Temple"
// sharing the word "temple" with a thousand other temples proves nothing).
// Excluded only from TOKEN_MATCH/PARTIAL scoring, never from EXACT
// (normalized full-string) comparison, so a place whose real name IS just
// "Temple" still matches itself exactly.
const GENERIC_NAME_WORDS = new Set([
  'temple',
  'mandir',
  'fort',
  'museum',
  'park',
  'church',
  'mosque',
  'basilica',
  'cathedral',
  'shrine',
  'palace',
  'garden',
  'gardens',
  'lake',
  'hill',
  'hills',
]);

function tokenize(normalized: string): string[] {
  return normalized.split(' ').filter((w) => w.length >= 2);
}

/** Significant (non-generic) tokens — the words that actually carry identity. */
function significantTokens(normalized: string): Set<string> {
  return new Set(tokenize(normalized).filter((w) => !GENERIC_NAME_WORDS.has(w)));
}

export type NameMatchTier = 'EXACT' | 'TOKEN_MATCH' | 'PARTIAL' | 'NONE';

/**
 * Classifies how strongly a (already address-context-stripped, see below)
 * query matches a candidate's own primary name.
 *   EXACT       — normalized full strings are equal.
 *   TOKEN_MATCH — every SIGNIFICANT query token appears in the candidate's
 *                 significant tokens (the candidate may have extra tokens —
 *                 this is what lets "Meenakshi Temple" reach the real
 *                 "Sri Meenakshi Amman Temple" despite "Amman" and "Sri").
 *   PARTIAL     — at least one significant token in common, but not all.
 *   NONE        — no significant tokens in common at all.
 * Exported purely for unit testing.
 */
export function classifyNameMatch(query: string, candidateName: string): NameMatchTier {
  const normQuery = normalizeName(query);
  const normCandidate = normalizeName(candidateName);
  if (normQuery === normCandidate) return 'EXACT';

  const queryWords = significantTokens(normQuery);
  const candidateWords = significantTokens(normCandidate);
  // A query with no significant tokens (empty, or purely generic words like
  // a bare "Temple") carries no identity evidence at all — it does NOT
  // vacuously match everything, and it does NOT get a middling "PARTIAL"
  // score either; every candidate is equally (un)supported by the name.
  if (queryWords.size === 0) return 'NONE';

  const allPresent = [...queryWords].every((w) => candidateWords.has(w));
  if (allPresent) return 'TOKEN_MATCH';

  const anyPresent = [...queryWords].some((w) => candidateWords.has(w));
  return anyPresent ? 'PARTIAL' : 'NONE';
}

const TIER_RANK: Record<NameMatchTier, number> = {
  EXACT: 3,
  TOKEN_MATCH: 2,
  PARTIAL: 1,
  NONE: 0,
};

/** Address-hierarchy tokens for a candidate — used only to detect when the
 *  QUERY already names the candidate's own city/district/state, never to
 *  invent or guess location. */
function addressContextTokens(address: NominatimAddress | undefined): Set<string> {
  if (!address) return new Set();
  const fields = [
    address.village,
    address.town,
    address.city,
    address.municipality,
    address.suburb,
    address.state_district,
    address.state,
  ].filter((v): v is string => !!v);
  const tokens = new Set<string>();
  for (const field of fields) {
    for (const t of tokenize(normalizeName(field))) tokens.add(t);
  }
  return tokens;
}

interface CandidateEvaluation {
  place: NominatimPlace;
  tier: NameMatchTier;
  /** True when the query contained a token that matches this candidate's OWN
   *  city/district/state — i.e. the user already told us where. Never
   *  fabricated; only ever set when a real query token matched real address
   *  data for THIS specific candidate. */
  hasContext: boolean;
  importance: number;
  isSettlement: boolean;
}

/**
 * Evaluates one candidate against the query: tokens that match the
 * candidate's OWN address hierarchy are set aside as geographic context
 * before scoring the remaining tokens against its name — this is what lets
 * "Meenakshi Temple Madurai" reach EXACT/TOKEN_MATCH against "Sri Meenakshi
 * Amman Temple" (whose city is Madurai) without "Madurai" counting against
 * the name match, while a DIFFERENT candidate whose city isn't Madurai gets
 * no such benefit — the context token only ever helps candidates it's
 * actually true of.
 *
 * Tokens that are already part of the candidate's OWN name are excluded from
 * "context" — a village's `address.village` field is very commonly just its
 * own name again (real Nominatim data: e.g. a "Kondapur" suburb's own
 * suburb field is "Kondapur"), so without this exclusion a query that merely
 * repeats a settlement's name would wrongly look like it supplied external
 * geographic disambiguation, when it supplied none at all.
 */
function evaluateCandidate(query: string, place: NominatimPlace): CandidateEvaluation {
  const primaryName = (place.display_name.split(',')[0] ?? '').trim();
  const ownNameTokens = significantTokens(normalizeName(primaryName));
  const queryTokens = tokenize(normalizeName(query));
  const contextTokens = new Set(
    [...addressContextTokens(place.address)].filter((t) => !ownNameTokens.has(t)),
  );
  const coreTokens = queryTokens.filter((t) => !contextTokens.has(t));
  const hasContext = coreTokens.length < queryTokens.length;
  const coreQuery = coreTokens.join(' ') || query; // never let context-stripping empty the query out

  return {
    place,
    tier: classifyNameMatch(coreQuery, primaryName),
    hasContext,
    importance: place.importance ?? 0,
    isSettlement: !!place.class && (place.class === 'place' || place.class === 'boundary'),
  };
}

// A dominant outside-tier candidate must be overwhelmingly more important —
// not just "a bit higher" — to override a stronger name-match tier. 50x is
// far above any noise observed between same-tier candidates that both lack a
// real prominence signal (Nominatim's un-linked baseline importance values
// cluster within ~1.5x of each other), and far below the >6000x gap Madurai's
// actual temple has over its unrelated Bengaluru namesakes — so it promotes
// genuine landmark-level prominence without being triggered by ordinary
// importance noise.
const IMPORTANCE_PROMOTION_MULTIPLIER = 50;

// Among same-tier, same-kind POI/landmark candidates (not settlements — see
// isSettlement below), an importance gap smaller than this is treated as
// noise, not a genuine "this one is more famous" signal — this is what makes
// Ramappa Temple's two candidates (importance ratio ~1.44x) ambiguous rather
// than silently picking whichever Nominatim happens to rank a hair higher.
const POI_DECISIVE_IMPORTANCE_RATIO = 3;

export const AMBIGUOUS_MESSAGE =
  'Multiple different places in India share that name. Try adding a city, district, or state to be more specific.';

/** Internal — carries the raw candidates behind an ambiguous resolution so
 *  `geocodeLocation` can convert them to the UI-safe `PlaceCandidate` shape
 *  before surfacing a `GeocodeError('ambiguous', …)`. Not part of the public
 *  API; `resolveDestination` still just throws (its own tests only assert
 *  `.toThrow()`), this merely carries more information on the way out. */
class AmbiguousMatchError extends Error {
  constructor(readonly candidates: NominatimPlace[]) {
    super(AMBIGUOUS_MESSAGE);
    this.name = 'AmbiguousMatchError';
  }
}

// Thrown when resolveDestination's ONLY option (or every remaining option
// after filtering) shares literally no word with the query — a genuinely
// unrelated candidate that a naive "trust Nominatim's importance" fallback
// would otherwise return silently (the original Tirupathi → Dwaraka
// Tirumala bug). `geocodeLocation` maps this to GeocodeError('not_found'),
// the same honest "we couldn't confidently match that" outcome a real typo
// with zero results gets — never a wrong place presented as a right one.
class LowConfidenceMatchError extends Error {
  constructor() {
    super(NOT_FOUND_MESSAGE);
    this.name = 'LowConfidenceMatchError';
  }
}

// A small, hand-curated list of well-known Indian places whose common,
// most-searched name differs entirely from Nominatim's own indexed name —
// e.g. "Shirdi" (the town almost everyone means when they search it) is
// indexed by Nominatim under its formal administrative name "Sainagar".
// Without this, the NONE-tier rejection that correctly stops "Tirupathi" →
// "Dwaraka Tirumala" (an unrelated real place 60km away) also incorrectly
// stopped "Shirdi" → "Sainagar" (the SAME real place, just under a
// different name) — name-text comparison alone can't tell those two
// situations apart.
//
// Each entry is applied ONLY when RE-VERIFIED: the single candidate
// Nominatim actually returned must itself be a genuine name match
// (EXACT/TOKEN_MATCH/PARTIAL — never NONE) against the alias's OWN target
// name, not merely "the query happens to be a known alias key". A stale or
// wrong alias entry can therefore never override real data — if Nominatim's
// data ever changes so the alias target no longer describes what it
// returns for that query, the alias silently stops applying and the query
// correctly falls back to LowConfidenceMatchError, exactly like any other
// unverified NONE-tier match (see verifiedAliasMatch below).
//
// Deliberately scoped to the single-candidate path only (resolveDestination
// below) — it never participates in resolveWeakMatch's multi-candidate
// filtering, so it can never turn a genuinely ambiguous multi-candidate
// query (Central Park, Ramappa Temple, Birla Mandir…) into a confident
// single answer. Add an entry here only for a specific, confirmed
// real-world alternate-name mismatch (see the Shirdi regression test) —
// never as a general fuzzy-matching mechanism.
const COMMON_NAME_ALIASES: Record<string, string> = {
  shirdi: 'sainagar',
};

function verifiedAliasMatch(query: string, place: NominatimPlace): boolean {
  const target = COMMON_NAME_ALIASES[normalizeName(query)];
  if (!target) return false;
  const primaryName = (place.display_name.split(',')[0] ?? '').trim();
  return classifyNameMatch(target, primaryName) !== 'NONE';
}

// A candidate counts as a STRONG (identity-confirmed) match when it's a raw
// EXACT match, OR when it only reaches TOKEN_MATCH because the query
// explicitly supplied geographic context that this specific candidate's own
// address confirms (`hasContext`) — the user telling us "…Madurai" is as
// good as an exact name match once "Madurai" is confirmed to be this
// candidate's own city. A coincidental TOKEN_MATCH with NO context (a query
// word merely happening to appear inside a longer, otherwise-unrelated name
// — see the Tirupathi bug documented below) does NOT count as strong.
function isStrongMatch(e: CandidateEvaluation): boolean {
  return e.tier === 'EXACT' || (e.hasContext && e.tier === 'TOKEN_MATCH');
}

// Called only when NOTHING reached a strong (identity-confirmed) match —
// resolveDestination's own fallback for that case. Prefers any candidate
// that shares a real word with the query (tier TOKEN_MATCH/PARTIAL) over one
// that shares none, so a textually-unrelated candidate can never win purely
// on Nominatim importance (the Tirupathi bug). Reuses the exact same
// decisive-importance-gap / same-location-collapse / else-ambiguous logic
// resolveDestination already applies to strong-match POI collisions below —
// this is that same tiered fallback applied one confidence level down, not a
// new threshold.
function resolveWeakMatch(
  query: string,
  evaluations: CandidateEvaluation[],
  candidates: NominatimPlace[],
): NominatimPlace {
  const related = evaluations.filter((e) => e.tier !== 'NONE');

  if (related.length === 0) {
    // Every candidate shares literally no word with the query — genuinely
    // blind fuzzy/phonetic territory (Phase 7's original Tirupathi case had
    // exactly one such candidate, handled by resolveDestination's own
    // length-1 check above; this covers the same situation with 2+). Trust
    // Nominatim's own relevance ranking, since this module has no better
    // signal to offer.
    return pickBest(query, candidates);
  }
  if (related.length === 1) return related[0].place;

  const byImportance = [...related].sort((a, b) => b.importance - a.importance);
  const [top, second] = byImportance;
  if (top.importance >= second.importance * POI_DECISIVE_IMPORTANCE_RATIO) {
    return top.place;
  }

  const distinctLocations = new Set(
    byImportance.map(
      (e) => `${e.place.address?.state_district ?? ''}|${e.place.address?.state ?? ''}`,
    ),
  );
  if (distinctLocations.size === 1) return top.place;

  throw new AmbiguousMatchError(byImportance.map((e) => e.place));
}

/**
 * Selects the intended candidate from an already-`isGenuineDestination`
 * -filtered list, or throws when the evidence genuinely doesn't support a
 * confident choice (CORE PRINCIPLE: WRONG PLACE > NO PLACE — see module
 * comment above). `candidates` must be non-empty.
 *
 * When NO candidate reaches a strong match at all, this module still prefers
 * any candidate that shares SOME real word with the query (tier TOKEN_MATCH
 * or PARTIAL) over one that shares none — a candidate that is NONE-tier
 * (e.g. "Tirupathi" → "Dwaraka Tirumala", which shares zero name tokens with
 * the query) is never silently returned as the answer merely for having the
 * highest Nominatim importance; it throws LowConfidenceMatchError instead
 * (→ GeocodeError('not_found') — see geocodeLocation), the same honest
 * outcome a genuinely unmatched query gets. Only when EVERY candidate is
 * NONE-tier does this defer to pickBest()'s raw importance ranking — that
 * remaining case is genuinely blind fuzzy/phonetic territory where this
 * module has no better signal to offer than Nominatim's own relevance score.
 *
 * Settlement-vs-settlement collisions among strong matches (Kondapur's
 * suburb vs same-named rural villages) are delegated to pickBest()
 * UNCHANGED — Phase 7 already proved that importance-then-rank is the right
 * rule there, and there is a reasonable, generalizable prior for it (a
 * well-known metro locality is a far more common search target than an
 * obscure identically-named village), which does not hold for landmarks/POIs
 * the same way. Non-settlement (temple/fort/park/museum/…) collisions get:
 * geographic context the query already supplied wins outright; otherwise an
 * overwhelming importance gap (not "highest importance" — a DECISIVE one)
 * wins; otherwise, if multiple genuinely different places remain
 * indistinguishable, this throws rather than guesses.
 */
export function resolveDestination(query: string, candidates: NominatimPlace[]): NominatimPlace {
  if (candidates.length === 1) {
    // A lone candidate that shares literally no word with the query (e.g.
    // "Tirupathi" → "Dwaraka Tirumala") is not confirmed just by being the
    // only option Nominatim returned — see LowConfidenceMatchError above.
    // The one exception is a re-verified common-name alias (e.g. "Shirdi" →
    // "Sainagar", the SAME real place under its formal name, not a
    // different one) — see COMMON_NAME_ALIASES/verifiedAliasMatch above.
    const tier = evaluateCandidate(query, candidates[0]).tier;
    if (tier === 'NONE' && !verifiedAliasMatch(query, candidates[0])) {
      throw new LowConfidenceMatchError();
    }
    return candidates[0];
  }

  const evaluations = candidates.map((c) => evaluateCandidate(query, c));

  let topSet = evaluations.filter(isStrongMatch);
  if (topSet.length === 0) {
    return resolveWeakMatch(query, evaluations, candidates);
  }

  // Cross-tier promotion: a candidate that ISN'T a strong match can still win
  // outright when its importance overwhelms every strong-match candidate —
  // this is what lets Madurai's real temple beat the exact-but-unrelated
  // Bengaluru "Meenakshi Temple" namesakes despite matching only at
  // TOKEN_MATCH with no query-supplied context. Still requires at least
  // TOKEN_MATCH (never a totally unrelated NONE-tier candidate) — the
  // Tirupathi-style "nothing is strong" case is handled entirely by the
  // early return above, so this only ever promotes a plausible-but-imprecise
  // name match, never an arbitrary one.
  const topImportance = Math.max(...topSet.map((e) => e.importance));
  const dominant = evaluations.filter(
    (e) =>
      !isStrongMatch(e) &&
      TIER_RANK[e.tier] >= TIER_RANK.TOKEN_MATCH &&
      e.importance >= topImportance * IMPORTANCE_PROMOTION_MULTIPLIER,
  );
  if (dominant.length === 1) return dominant[0].place;
  if (dominant.length > 1) topSet = dominant; // several overwhelming outsiders — resolve among them below

  if (topSet.length === 1) return topSet[0].place;

  // The query already named a city/district/state that matches exactly one
  // top candidate — explicit disambiguation the user provided; use it.
  const contextMatches = topSet.filter((e) => e.hasContext);
  if (contextMatches.length === 1) return contextMatches[0].place;

  const allSettlements = topSet.every((e) => e.isSettlement);
  if (allSettlements) {
    // Unchanged Phase 7 logic — proven correct for locality collisions.
    return pickBest(
      query,
      topSet.map((e) => e.place),
    );
  }

  // POI/landmark collision (temple, fort, park, museum…): require a decisive
  // importance gap, not just "highest of several near-identical values".
  const byImportance = [...topSet].sort((a, b) => b.importance - a.importance);
  const [top, second] = byImportance;
  if (!second || top.importance >= second.importance * POI_DECISIVE_IMPORTANCE_RATIO) {
    return top.place;
  }

  // Are these actually different places, or just duplicate/adjacent OSM
  // entries for the same physical site? Only genuinely different locations
  // are ambiguous — several records for the SAME district/state just get the
  // best-importance one.
  const distinctLocations = new Set(
    byImportance.map(
      (e) => `${e.place.address?.state_district ?? ''}|${e.place.address?.state ?? ''}`,
    ),
  );
  if (distinctLocations.size === 1) return top.place;

  throw new AmbiguousMatchError(byImportance.map((e) => e.place));
}

/** Converts a raw Nominatim record into the UI-safe candidate shape — never
 *  exposes class/type/importance/match-tier, only what a picker needs. */
function toPlaceCandidate(p: NominatimPlace): PlaceCandidate {
  const hierarchy = buildLocationHierarchy(p.address);
  return {
    name: (p.display_name.split(',')[0] ?? '').trim(),
    locality: hierarchy?.locality,
    district: hierarchy?.district,
    state: hierarchy?.state,
    country: hierarchy?.country,
    lat: parseFloat(p.lat),
    lon: parseFloat(p.lon),
  };
}

export async function geocodeLocation(query: string): Promise<GeocodeResult> {
  const trimmed = query.trim();
  if (!trimmed) throw new GeocodeError('not_found', 'Enter a place to search');

  // Foreign-place veto. `countrycodes=in` only guarantees the *result* is in
  // India — it does NOT stop a foreign query ("Dubai", "Singapore") from
  // matching an unrelated Indian namesake or POI. Reject a query that names a
  // foreign country/place up front (reusing the image resolver's veto) so a
  // foreign search is never silently converted into an unrelated Indian place.
  if (hasForeignContext(trimmed.toLowerCase())) {
    throw new GeocodeError('not_found', INDIA_ONLY_MESSAGE);
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

  let res: Response;
  try {
    res = await fetch(`${NOMINATIM_URL}/search?${params.toString()}`, {
      headers: { 'Accept-Language': 'en', 'User-Agent': 'TravelMate/1.0' },
      // Bound the request so a stalled Nominatim connection (which neither
      // resolves nor rejects on its own) can't hold consumers — Hotels, Nearby,
      // Weather — in an indefinite loading state. On timeout this rejects with a
      // TimeoutError, routing into the 'unavailable' path below rather than an
      // unclassified network exception.
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    // Network failure or timeout — the destination itself may be perfectly
    // valid; the SERVICE failed. Must never read as "not found" (Phase 9).
    throw new GeocodeError('unavailable', 'Geocoding request failed');
  }

  if (!res.ok) throw new GeocodeError('unavailable', 'Geocoding request failed');

  const results = (await res.json()) as NominatimPlace[];

  if (!results.length) throw new GeocodeError('not_found', NOT_FOUND_MESSAGE);

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
    throw new GeocodeError('not_found', NOT_FOUND_MESSAGE);
  }

  // Rank only genuine destinations, so an incidental POI (shop, road, hotel)
  // can never be selected even if Nominatim ranks it first.
  const genuine = results.filter(isGenuineDestination);
  if (!genuine.length) throw new GeocodeError('not_found', NOT_FOUND_MESSAGE);

  let best: NominatimPlace;
  try {
    best = resolveDestination(trimmed, genuine);
  } catch (err) {
    if (err instanceof AmbiguousMatchError) {
      // Every candidate here already passed isGenuineDestination above — a
      // picker built from this can never surface a hotel/restaurant/road.
      throw new GeocodeError('ambiguous', AMBIGUOUS_MESSAGE, err.candidates.map(toPlaceCandidate));
    }
    if (err instanceof LowConfidenceMatchError) {
      // The only/best candidate shares no real word with the query — same
      // honest "not found" outcome as zero results, never a wrong place
      // presented as the right one (see LowConfidenceMatchError above).
      throw new GeocodeError('not_found', NOT_FOUND_MESSAGE);
    }
    throw err;
  }

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
    location: buildLocationHierarchy(best.address),
  };
}
