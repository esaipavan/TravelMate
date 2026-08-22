// ── Public types ──────────────────────────────────────────────────────────────

export interface DestinationTheme {
  accent: string;
  accentRgb: string;
  secondary: string;
  /** Primary image URL, or null when we don't confidently recognise the
   *  place. Null means "show the honest colour/gradient treatment" rather
   *  than a guessed stock photo — never render a fabricated image. */
  imageUrl: string | null;
  /** All recognised images for carousels / galleries (first = primary).
   *  Empty when the place isn't confidently recognised. */
  imageUrls: string[];
}

// ── Internal types ────────────────────────────────────────────────────────────

interface ColorSet {
  accent: string;
  accentRgb: string;
  secondary: string;
}

/**
 * A destination entry covers one or more place names (city aliases, country,
 * region). `keys` are lowercase whole-word tokens matched against the
 * destination string (see `matchesKey` — delimited by edges/punctuation, not raw
 * substrings). More-specific entries (city names) must appear BEFORE less-
 * specific ones (country names) so "Paris, France" matches `paris` not `france`.
 *
 * `images` should contain 2–5 diverse Unsplash photo IDs for the same place.
 */
interface DestinationEntry {
  keys: string[];
  images: string[];
  colors: ColorSet;
}

// ── Destination entries ───────────────────────────────────────────────────────
// Ordered: specific (city) → general (country). First match wins.
// Each entry provides 2–5 diverse photos of the same place.

const DESTINATIONS: DestinationEntry[] = [
  // ── Curated destinations (India-only scope) ─────────────────────────────────
  // Only Indian entries are kept: the resolver gates every match through
  // INDIA_KEYS, so a foreign entry could never resolve to a photo. Ordered
  // specific (city) → general (state/country). First match wins.
  {
    keys: ['varanasi', 'benares'],
    images: [
      'photo-1561361058-c24cecae35ca', // Ghats and temples at sunrise
    ],
    colors: { accent: '#F97316', accentRgb: '249,115,22', secondary: '#F59E0B' },
  },
  {
    keys: ['rishikesh', 'haridwar'],
    images: [
      'photo-1561361058-c24cecae35ca', // Ganga riverside ghats
    ],
    colors: { accent: '#F97316', accentRgb: '249,115,22', secondary: '#F59E0B' },
  },
  {
    keys: ['amritsar'],
    images: [
      'photo-1609947017136-9daf32a5eb16', // Golden Temple by day, causeway
      'photo-1583821017783-4333717df070', // Golden Temple illuminated at night
    ],
    colors: { accent: '#F59E0B', accentRgb: '245,158,11', secondary: '#D97706' },
  },
  {
    keys: ['mathura', 'vrindavan', 'brindavan'],
    images: [
      'photo-1561361058-c24cecae35ca', // temple riverside
      'photo-1708346561250-ea0f8b54bc1c', // ornate Hindu temple gopuram
    ],
    colors: { accent: '#F97316', accentRgb: '249,115,22', secondary: '#F59E0B' },
  },
  {
    keys: ['tirupati', 'tirumala'],
    images: [
      'photo-1708346561250-ea0f8b54bc1c', // South Indian temple gopuram
    ],
    colors: { accent: '#F59E0B', accentRgb: '245,158,11', secondary: '#D97706' },
  },
  {
    keys: ['puri'],
    images: [
      'photo-1708346561250-ea0f8b54bc1c', // temple town — ornate gopuram
    ],
    colors: { accent: '#0EA5E9', accentRgb: '14,165,233', secondary: '#F97316' },
  },
  {
    keys: ['shirdi'],
    images: [
      'photo-1708346561250-ea0f8b54bc1c', // pilgrimage temple town
    ],
    colors: { accent: '#F59E0B', accentRgb: '245,158,11', secondary: '#D97706' },
  },
  {
    keys: ['goa'],
    images: [
      'photo-1512343879784-a960bf40e7f2', // Baga / Calangute beach sunset
    ],
    colors: { accent: '#0EA5E9', accentRgb: '14,165,233', secondary: '#06B6D4' },
  },
  {
    keys: ['kerala'],
    images: [
      'photo-1602216056096-3b40cc0c9944', // Kerala backwaters houseboat
      'photo-1512343879784-a960bf40e7f2', // coastal Kerala
    ],
    colors: { accent: '#10B981', accentRgb: '16,185,129', secondary: '#059669' },
  },
  {
    keys: ['jaipur'],
    images: [
      'photo-1599661046289-e31897846e41', // Amber Fort, Jaipur
    ],
    colors: { accent: '#F59E0B', accentRgb: '245,158,11', secondary: '#EA580C' },
  },
  {
    keys: ['udaipur'],
    images: [
      'photo-1599661046289-e31897846e41', // Rajasthan palace heritage
    ],
    colors: { accent: '#F59E0B', accentRgb: '245,158,11', secondary: '#EA580C' },
  },
  {
    keys: ['jodhpur'],
    images: [
      'photo-1521182369863-7c68f43ee5cf', // Jodhpur blue city walls
    ],
    colors: { accent: '#3B82F6', accentRgb: '59,130,246', secondary: '#F97316' },
  },
  {
    keys: ['agra'],
    images: [
      'photo-1564507592333-c60657eea523', // Taj Mahal at dawn
    ],
    colors: { accent: '#F59E0B', accentRgb: '245,158,11', secondary: '#EF4444' },
  },
  {
    keys: ['manali'],
    images: [
      'photo-1616942986550-ea6469c08530', // Himalayan snow peaks & valley
      'photo-1591331554229-f614ee904bcd', // pine-forested hillside
    ],
    colors: { accent: '#38BDF8', accentRgb: '56,189,248', secondary: '#0EA5E9' },
  },
  {
    keys: ['shimla'],
    images: [
      'photo-1591331554229-f614ee904bcd', // Himalayan hill station
    ],
    colors: { accent: '#38BDF8', accentRgb: '56,189,248', secondary: '#0EA5E9' },
  },
  {
    keys: ['dharamshala', 'mcleod'],
    images: [
      'photo-1616942986550-ea6469c08530', // Himalayan hill town
    ],
    colors: { accent: '#818CF8', accentRgb: '129,140,248', secondary: '#6366F1' },
  },
  {
    keys: ['leh', 'ladakh'],
    images: [
      'photo-1648851460314-ba293ba2cdcf', // Pangong Lake, Ladakh
      'photo-1581285090568-378f43fc4f19', // Leh valley panorama
    ],
    colors: { accent: '#818CF8', accentRgb: '129,140,248', secondary: '#A78BFA' },
  },
  {
    keys: ['kashmir', 'srinagar'],
    images: [
      'photo-1577500588651-5603d971f338', // Dal Lake houseboats, Srinagar
      'photo-1564329494258-3f72215ba175', // shikara on Dal Lake
    ],
    colors: { accent: '#818CF8', accentRgb: '129,140,248', secondary: '#A78BFA' },
  },
  {
    keys: ['mumbai', 'bombay'],
    images: [
      'photo-1562979314-bee7453e911c', // Mumbai skyline / Gateway of India
    ],
    colors: { accent: '#6366F1', accentRgb: '99,102,241', secondary: '#8B5CF6' },
  },
  {
    keys: ['delhi', 'new delhi'],
    images: [
      'photo-1587474260584-136574528ed5', // India Gate, New Delhi
    ],
    colors: { accent: '#EF4444', accentRgb: '239,68,68', secondary: '#F97316' },
  },
  {
    keys: ['india'],
    images: ['photo-1564507592333-c60657eea523', 'photo-1548013146-72479768bada'],
    colors: { accent: '#F97316', accentRgb: '249,115,22', secondary: '#F59E0B' },
  },
  {
    keys: ['rajasthan'],
    images: ['photo-1599661046289-e31897846e41'],
    colors: { accent: '#F59E0B', accentRgb: '245,158,11', secondary: '#EA580C' },
  },
  {
    keys: ['himachal', 'uttarakhand'],
    images: ['photo-1616942986550-ea6469c08530', 'photo-1591331554229-f614ee904bcd'],
    colors: { accent: '#38BDF8', accentRgb: '56,189,248', secondary: '#0EA5E9' },
  },
];

// Neutral colour treatment for places we don't confidently recognise. Used
// for the honest gradient fallback — never paired with a guessed photo.
const DEFAULT_COLORS: ColorSet = {
  accent: '#6366F1',
  accentRgb: '99,102,241',
  secondary: '#8B5CF6',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function toUnsplashUrl(photoId: string): string {
  return `https://images.unsplash.com/${photoId}?w=1600&h=900&fit=crop&crop=entropy&q=80`;
}

// ── Core resolver ─────────────────────────────────────────────────────────────

interface ResolvedImages {
  photoIds: string[];
  colors: ColorSet;
}

// Whole-word (token) key match. A key matches only when it is delimited by the
// string edges or non-alphanumeric characters — NOT as a raw substring. This
// prevents false hits that used to assign unrelated covers, e.g. `la`
// (Los Angeles) inside "Pa·la·ni" or `bali` inside "Maha·bali·puram". Unicode
// safe (checks the neighbouring chars directly rather than relying on \b).
function matchesKey(haystack: string, key: string): boolean {
  let idx = haystack.indexOf(key);
  while (idx !== -1) {
    const before = idx === 0 ? '' : haystack[idx - 1];
    const after = idx + key.length >= haystack.length ? '' : haystack[idx + key.length];
    const okBefore = before === '' || !/[a-z0-9]/i.test(before);
    const okAfter = after === '' || !/[a-z0-9]/i.test(after);
    if (okBefore && okAfter) return true;
    idx = haystack.indexOf(key, idx + 1);
  }
  return false;
}

// ── Temple-relevant fallback ──────────────────────────────────────────────────
// A South-Indian gopuram is a strong, honest "place of worship" image, used only
// when a destination is CLEARLY temple-related but isn't curated by city name.
const TEMPLE_IMAGE = 'photo-1708346561250-ea0f8b54bc1c';
const TEMPLE_COLORS: ColorSet = {
  accent: '#F59E0B',
  accentRgb: '245,158,11',
  secondary: '#F97316',
};

// Well-known temple destinations not already curated above (city-name matched).
const TEMPLE_PLACES = [
  'palani',
  'madurai',
  'meenakshi',
  'rameswaram',
  'rameshwaram',
  'mahabalipuram',
  'mamallapuram',
  'tiruvannamalai',
  'srikalahasti',
  'kanchipuram',
  'sabarimala',
  'somnath',
  'dwarka',
  'kedarnath',
  'badrinath',
  'konark',
  'khajuraho',
  'hampi',
  'srirangam',
  'chidambaram',
  'guruvayur',
  'sringeri',
  'udupi',
  'kamakhya',
  'ayodhya',
  'bodhgaya',
  'bodh gaya',
  'sarnath',
  'thanjavur',
  'tanjore',
];
// Unambiguous place-of-worship markers (whole-word matched, so "Templeton" or
// the already-curated "Mathura" are never caught).
const TEMPLE_MARKERS = [
  'temple',
  'mandir',
  'kovil',
  'koil',
  'devasthanam',
  'jyotirlinga',
  'gopuram',
  'shrine',
  'basadi',
];
// Well-known places literally named "Temple" that are NOT places of worship —
// keeps temple imagery off unrelated destinations.
const TEMPLE_DENY = ['temple bar', 'temple university', 'temple, tx', 'temple, texas'];

function isTempleDestination(lower: string): boolean {
  if (TEMPLE_DENY.some((d) => lower.includes(d))) return false;
  if (TEMPLE_PLACES.some((p) => matchesKey(lower, p))) return true;
  return TEMPLE_MARKERS.some((m) => matchesKey(lower, m));
}

// ── Duplicate-name disambiguation ─────────────────────────────────────────────
// A handful of famous cities share their name with smaller towns elsewhere
// ("Paris, Texas"). The curated entry is always the famous international city, so
// when the destination names a DIFFERENT region (a US state, Ontario, …) and the
// famous city's own home country is absent, we suppress the match and fall back
// honestly rather than show e.g. the Eiffel Tower for Paris, Texas.

// Regions that commonly host a same-named duplicate of a famous city (US states
// as full names + collision-free abbreviations, plus Ontario). Abbreviations
// that are common English words (in, or, me, ok, hi, id, wa, la) are omitted.
const DUP_REGION_TOKENS = [
  'alabama',
  'alaska',
  'arizona',
  'arkansas',
  'california',
  'colorado',
  'connecticut',
  'delaware',
  'florida',
  'georgia',
  'hawaii',
  'idaho',
  'illinois',
  'indiana',
  'iowa',
  'kansas',
  'kentucky',
  'louisiana',
  'maine',
  'maryland',
  'massachusetts',
  'michigan',
  'minnesota',
  'mississippi',
  'missouri',
  'montana',
  'nebraska',
  'nevada',
  'new hampshire',
  'new jersey',
  'new mexico',
  'north carolina',
  'north dakota',
  'ohio',
  'oklahoma',
  'oregon',
  'pennsylvania',
  'rhode island',
  'south carolina',
  'south dakota',
  'tennessee',
  'texas',
  'utah',
  'vermont',
  'virginia',
  'washington',
  'west virginia',
  'wisconsin',
  'wyoming',
  'tx',
  'fl',
  'ga',
  'ky',
  'oh',
  'ny',
  'ca',
  'il',
  'tn',
  'sc',
  'va',
  'nc',
  'pa',
  'mi',
  'mo',
  'az',
  'co',
  'wi',
  'mn',
  'md',
  'nj',
  'nm',
  'nv',
  'ct',
  'ri',
  'ks',
  'ar',
  'nd',
  'sd',
  'wv',
  'wy',
  'mt',
  'ut',
  'vt',
  'nh',
  'ontario',
];

// Curated key → its HOME context tokens. Only these keys are disambiguated; all
// other curated matches (and the unambiguous aliases like "firenze"/"napoli") are
// unaffected.
const AMBIGUOUS_HOME: Record<string, string[]> = {
  paris: ['france'],
  london: ['uk', 'england', 'britain', 'united kingdom'],
  melbourne: ['australia'],
  athens: ['greece'],
  rome: ['italy'],
  naples: ['italy'],
  venice: ['italy'],
  florence: ['italy'],
  cairo: ['egypt'],
  berlin: ['germany', 'deutschland'],
  vienna: ['austria'],
};

// True when a curated entry matched via an ambiguous key but the destination
// points at a different same-named place (home country absent, a duplicate
// region present) — so the famous-city image should NOT be used.
function isAmbiguousMismatch(lower: string, matchedKey: string): boolean {
  const home = AMBIGUOUS_HOME[matchedKey];
  if (!home) return false;
  if (home.some((h) => matchesKey(lower, h))) return false; // the famous one
  return DUP_REGION_TOKENS.some((r) => matchesKey(lower, r)); // a same-named duplicate
}

// ── India-only scope ──────────────────────────────────────────────────────────
// This is an India-only travel product, so only INDIAN curated entries may
// resolve to a photo. A curated match whose key is a foreign city (Paris, Tokyo,
// …) is ignored, so a non-India destination falls back to the honest gradient
// instead of showing a foreign landmark. Indian landmarks/temples resolve via
// these keys or the temple fallback below; foreign curated entries in the list
// are retained but unreachable (kept only to avoid a large deletion).
const INDIA_KEYS = new Set<string>([
  // religious cities / temple towns
  'varanasi',
  'benares',
  'rishikesh',
  'haridwar',
  'amritsar',
  'mathura',
  'vrindavan',
  'brindavan',
  'tirupati',
  'tirumala',
  'puri',
  'shirdi',
  // cities / regions
  'goa',
  'kerala',
  'jaipur',
  'udaipur',
  'jodhpur',
  'agra',
  'manali',
  'shimla',
  'dharamshala',
  'mcleod',
  'leh',
  'ladakh',
  'kashmir',
  'srinagar',
  'mumbai',
  'bombay',
  'delhi',
  'new delhi',
  // country / state fallbacks
  'india',
  'rajasthan',
  'himachal',
  'uttarakhand',
]);

// Explicit foreign context — a neighbouring country or any clearly foreign
// country named in the destination. Used to veto a curated Indian match that
// only collides on a shared region name (e.g. "Kashmir, Pakistan" must NOT show
// the Indian Kashmir photo) and to disqualify a legacy Wikipedia cover.
const FOREIGN_TOKENS = [
  'pakistan',
  'nepal',
  'bangladesh',
  'sri lanka',
  'srilanka',
  'bhutan',
  'myanmar',
  'burma',
  'china',
  'tibet',
  'afghanistan',
  'maldives',
  'france',
  'japan',
  'usa',
  'united states',
  'america',
  'uk',
  'united kingdom',
  'england',
  'italy',
  'spain',
  'germany',
  'thailand',
  'indonesia',
  'singapore',
  'malaysia',
  'vietnam',
  'cambodia',
  'uae',
  'emirates',
  'dubai',
  'qatar',
  'saudi',
  'egypt',
  'turkey',
  'greece',
  'australia',
  'canada',
  'brazil',
  'mexico',
  'korea',
];

// Exported so the India-only geocoder can reuse the exact same foreign-place
// veto (keeps "what counts as foreign" defined in one place).
export function hasForeignContext(lower: string): boolean {
  return FOREIGN_TOKENS.some((f) => matchesKey(lower, f));
}

// Only returns photos for an INDIAN place we actually recognise in the curated
// list (or a clearly temple-related destination). There is deliberately NO
// keyword-guessing or hashed-stock fallback: an unrecognised place (a village, a
// small locality, anything offbeat) — or any foreign place — returns an empty
// photo list and the neutral colour set, so callers show an honest gradient
// rather than a mismatched / out-of-scope stock image.
function resolveCore(destination: string): ResolvedImages {
  const lower = destination.trim().toLowerCase();

  for (const entry of DESTINATIONS) {
    const matched = entry.keys.find((k) => matchesKey(lower, k));
    if (!matched) continue;
    // India-only: never resolve a foreign city's image (out of product scope).
    if (!INDIA_KEYS.has(matched)) continue;
    // …and veto a curated Indian match when the destination names a foreign
    // country (e.g. "Kashmir, Pakistan" / "Ladakh, China") — out of scope.
    if (hasForeignContext(lower)) continue;
    // Guard retained from same-name disambiguation (now subsumed by the India
    // gate, since no Indian key is duplicate-prone) — harmless belt-and-braces.
    if (isAmbiguousMismatch(lower, matched)) continue;
    return { photoIds: entry.images, colors: entry.colors };
  }

  // Clearly temple-related but not curated by city name → honest temple imagery.
  if (isTempleDestination(lower)) {
    return { photoIds: [TEMPLE_IMAGE], colors: TEMPLE_COLORS };
  }

  return { photoIds: [], colors: DEFAULT_COLORS };
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Returns the recognised image URLs for a destination (empty when the place
 * isn't in the curated list — callers should fall back to a colour/gradient
 * treatment rather than show a guessed image).
 */
export function resolveDestinationImages(destination: string): string[] {
  const { photoIds } = resolveCore(destination || '');
  return photoIds.map(toUnsplashUrl);
}

/**
 * Returns the primary image URL for a destination, or `null` when the place
 * isn't confidently recognised. Callers MUST treat `null` as "no photo" and
 * render their colour/gradient fallback — never an <img> with an empty src.
 */
export function resolveDestinationImageUrl(destination: string): string | null {
  return resolveDestinationImages(destination)[0] ?? null;
}

/**
 * Like `resolveDestinationImageUrl`, but also flags whether the resolved image
 * is the GENERIC temple gopuram — a stand-in used for any temple town rather
 * than a place-specific photo. Cover selection uses this to prefer a real,
 * place-specific Wikipedia photo (e.g. the actual Tirumala temple for Tirupati)
 * over the generic gopuram, falling back to the gopuram only when no real
 * photo exists.
 */
export function resolveDestinationImageDetail(destination: string): {
  url: string | null;
  generic: boolean;
} {
  const { photoIds } = resolveCore(destination || '');
  const first = photoIds[0];
  if (!first) return { url: null, generic: false };
  return { url: toUnsplashUrl(first), generic: first === TEMPLE_IMAGE };
}

/**
 * True when a cover URL is the generic temple-gopuram stand-in (not a
 * place-specific photo), so callers can prefer a real Wikipedia image over it.
 */
export function isGenericTempleCover(url: string | null | undefined): boolean {
  return !!url && url.includes(TEMPLE_IMAGE);
}

// Auto-generated stock covers came from our own image resolver (Unsplash).
function isAutoGeneratedCover(url: string): boolean {
  return url.includes('images.unsplash.com');
}

// Auto-selected enrichment covers came from Wikipedia. Unlike a user upload,
// these were picked by the app — so under the India-only scope they must be
// re-verified as Indian before being trusted (see resolveTripCoverImage).
function isWikipediaCover(url: string): boolean {
  return url.includes('wikimedia.org') || url.includes('wikipedia.org');
}

/**
 * Reconciles a persisted trip `cover_image_url` against the honest resolver —
 * the single source of truth for what a trip card / hero should actually show.
 *
 * Legacy trips may still carry a stock cover that the OLD guessing logic
 * assigned to an unrecognised place. Rather than trust the stored value, we
 * re-derive auto-generated covers from the current resolver: a recognised
 * place gets its correct curated image, and an unrecognised place gets `null`
 * so the UI shows its gradient fallback instead of a stale guessed photo.
 *
 * Cover sources are treated differently under the India-only scope:
 *   • Unsplash stock (auto)      → re-derived from the India-only resolver.
 *   • Wikipedia enrichment (auto)→ kept ONLY when the destination is verifiably
 *     Indian; a legacy foreign Wikipedia cover is dropped → gradient. If we
 *     cannot confirm India, we fail safely to the fallback.
 *   • Anything else (user upload / custom URL) → always kept.
 *
 * Non-destructive: this normalises at render time, so stale/foreign rows stop
 * rendering out-of-scope images without any database rewrite.
 */
export function resolveTripCoverImage(
  destination: string,
  storedCover: string | null | undefined,
): string | null {
  if (storedCover) {
    if (isAutoGeneratedCover(storedCover)) {
      // Unsplash stock → re-derive from the resolver below.
    } else if (isWikipediaCover(storedCover)) {
      // Persisted Wikipedia enrichment. Our pipeline (fetchPlaceImage) only ever
      // persists a Wikipedia image taken from an article whose coordinates fall
      // INSIDE India, so a stored Wikipedia cover is already India-verified at
      // source. Trust it directly — dropping it only when the destination itself
      // is confidently foreign (defense-in-depth for any legacy/hand-set value).
      // This avoids needlessly re-fetching Wikipedia on every list render for a
      // valid Indian cover whose place name isn't on a curated whitelist
      // (e.g. "Hyderabad", "Tirupati", "Taj Mahal").
      if (!hasForeignContext(destination.trim().toLowerCase())) return storedCover;
      // Confidently foreign → drop (fall through to the resolver → gradient).
    } else {
      // Genuinely user-provided (storage upload / custom URL) → always kept.
      return storedCover;
    }
  }
  return resolveDestinationImageUrl(destination);
}

/**
 * Returns the full theme — colours + images — for a destination.
 * `imageUrl` is the primary image or `null` when unrecognised; `imageUrls` is
 * the (possibly empty) list of recognised images.
 */
export function resolveDestinationTheme(destination: string): DestinationTheme {
  const { photoIds, colors } = resolveCore(destination || '');
  const imageUrls = photoIds.map(toUnsplashUrl);
  return {
    ...colors,
    imageUrl: imageUrls[0] ?? null,
    imageUrls,
  };
}
