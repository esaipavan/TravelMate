// Real place imagery for recognised-but-non-curated destinations.
//
// Source: Wikipedia (search → REST summary). The app already renders Wikipedia
// thumbnails elsewhere, so `upload.wikimedia.org` (images) and `en.wikipedia.org`
// (fetch) are already allow-listed in the CSP — no boundary change needed.
//
// This deliberately does NOT guess. An image is only returned when Wikipedia
// gives us a *genuinely matching, India-scoped geographic* article that also
// has a real image — which structurally excludes people / films / concepts /
// disambiguation pages. Anything short of that returns null so the caller
// shows its honest gradient instead of a photo. See resolveVerifiedArticle
// for the two ways an article can prove it's genuinely about the right,
// India-located place: real GPS coordinates (strongest), or — only when an
// article genuinely has none, a real Wikipedia data gap, not a relaxation —
// a re-verified name match between the query and the resolved title.

import { resolveDestinationImageDetail } from '@/utils/destinationTheme';
import { classifyNameMatch } from '@/lib/geocode';

const WIKI_SEARCH = 'https://en.wikipedia.org/w/api.php';
const WIKI_SUMMARY = 'https://en.wikipedia.org/api/rest_v1/page/summary';
const WIKI_MEDIA_LIST = 'https://en.wikipedia.org/api/rest_v1/page/media-list';

interface WikiSummary {
  type?: string;
  coordinates?: { lat: number; lon: number };
  originalimage?: { source: string };
  thumbnail?: { source: string };
  description?: string;
  extract?: string;
}

interface WikiMediaListItem {
  title?: string;
  type?: string;
  srcset?: { src: string; scale?: string }[];
}

async function searchWikiTitle(query: string): Promise<string | null> {
  const params = new URLSearchParams({
    action: 'query',
    list: 'search',
    srsearch: query,
    srlimit: '1',
    format: 'json',
    origin: '*',
  });
  const res = await fetch(`${WIKI_SEARCH}?${params.toString()}`);
  if (!res.ok) return null;
  const data = (await res.json()) as { query?: { search?: { title: string }[] } };
  return data.query?.search?.[0]?.title ?? null;
}

async function fetchWikiSummary(title: string): Promise<WikiSummary | null> {
  const res = await fetch(`${WIKI_SUMMARY}/${encodeURIComponent(title)}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) return null;
  return (await res.json()) as WikiSummary;
}

interface ResolvedArticle {
  title: string;
  /** null when the article verified but had no usable photo — callers that
   *  only need an image treat this the same as "no article"; callers that
   *  also want the verified description (fetchPlaceDescription/fetchPlaceMedia)
   *  can still use the article without one. */
  leadImage: string | null;
  extract?: string;
}

/**
 * Resolves a query to a verified geographic Wikipedia article, or `null`.
 * Confidence bar: search resolves a page; the page is a `standard` article
 * (not a disambiguation/missing page); the article names India. Beyond that,
 * genuine India-location confirmation comes from ONE of two signals:
 *   - real GPS `coordinates`, confirmed inside India (the strongest signal,
 *     used whenever the article has them) — excludes people/films/concepts
 *     and foreign namesakes; or
 *   - when the article genuinely has no coordinates at all (a real Wikipedia
 *     data gap — e.g. Warangal Fort's own article has none, confirmed live)
 *     AND the title came from a fuzzy name search (not a trusted
 *     `knownTitle`), a real name match between the query and the resolved
 *     title. This is a DIFFERENT check, not a relaxed one: the coordinates
 *     path never requires a name match at all, because it has its own,
 *     independent geographic proof; losing that signal is compensated by
 *     requiring this one instead, so a coordinate-less article that has
 *     nothing to do with the query still correctly fails to verify.
 * A `knownTitle` (e.g. Geoapify's own wiki_and_media hint for a specific
 * POI) is already independently trusted via that provider's own OSM tag
 * linkage, so the name-match fallback only applies to the fuzzy-search path.
 * Callers that need a photo additionally check `leadImage`; `extract`
 * (Wikipedia's own summary paragraph) is returned whenever the article
 * verifies at all, since a missing photo doesn't make the text any less
 * genuine.
 */
async function resolveVerifiedArticle(
  query: string,
  knownTitle?: string,
): Promise<ResolvedArticle | null> {
  const title = knownTitle ?? (await searchWikiTitle(query));
  if (!title) return null;

  const summary = await fetchWikiSummary(title);
  if (!summary) return null;

  if (summary.type !== 'standard') return null;
  if (!mentionsIndia(summary)) return null;

  if (summary.coordinates) {
    if (!isInIndia(summary.coordinates.lat, summary.coordinates.lon)) return null;
  } else if (!knownTitle && classifyNameMatch(query, title) === 'NONE') {
    return null;
  }

  const image = summary.originalimage?.source ?? summary.thumbnail?.source ?? null;
  return {
    title,
    leadImage: image && isUsablePhoto(image) ? image : null,
    extract: summary.extract,
  };
}

// Shared resolution path for every export below: try `knownTitle` alone when
// given (a provider-supplied exact title deserves no fuzzy fallback — if IT
// doesn't verify, guessing further is more likely to find the wrong place
// than the right one); otherwise fall back to the existing candidate search
// (destination as typed, then its first comma-part for a "Place, City"
// string) exactly as before.
async function resolveArticleFor(
  destination: string,
  knownTitle?: string,
): Promise<ResolvedArticle | null> {
  if (knownTitle) return resolveVerifiedArticle(destination, knownTitle);

  const query = destination.trim();
  if (!query) return null;
  const firstPart = query.split(',')[0]?.trim();
  const candidates: string[] = [query];
  if (firstPart && firstPart.toLowerCase() !== query.toLowerCase()) candidates.push(firstPart);

  for (const c of candidates) {
    const resolved = await resolveVerifiedArticle(c);
    if (resolved) return resolved;
  }
  return null;
}

function placeNameFor(destination: string, knownTitle?: string): string {
  if (knownTitle) return knownTitle;
  const query = destination.trim();
  return query.split(',')[0]?.trim() || query;
}

/**
 * Returns a real, place-SPECIFIC image URL for a destination, or `null` when we
 * can't confidently source one (→ the caller shows its honest gradient).
 *
 * The cover must be a photo of the PLACE itself — never a loosely-related city
 * or state landmark. We try the destination exactly as typed, then — for a
 * "Place, City/State" string — the place name on its own (so "Gachibowli,
 * Hyderabad" still resolves to Gachibowli even if the full string doesn't).
 * We deliberately do NOT fall back to the parent city or state: an obscure
 * locality with no photo of its own (e.g. "Swarnagiri, Hyderabad") shows the
 * honest gradient rather than an unrelated regional photo. The India-only +
 * geographic-article gates in `resolveVerifiedArticle` keep foreign/wrong
 * matches out. `knownTitle` is optional — existing callers are unaffected.
 */
export async function fetchPlaceImage(
  destination: string,
  knownTitle?: string,
): Promise<string | null> {
  const resolved = await resolveArticleFor(destination, knownTitle);
  return resolved?.leadImage ?? null;
}

// Wikipedia article lead images are usually a real photo, but some places carry
// a locator map / flag / seal / SVG emblem instead. Exclude those by filename.
// Exported (alongside the other pure helpers below) purely for unit testing.
export function isUsablePhoto(url: string): boolean {
  const u = url.toLowerCase();
  if (u.endsWith('.svg')) return false;
  return !/(flag|coat[_%]|locator|location_map|_map[._]|seal[_%]|emblem|\blogo\b|\bicon\b)/.test(u);
}

const FILENAME_WORD_RE = /[a-z]{3,}/g;
const GENERIC_TITLE_WORDS = new Set([
  'the',
  'and',
  'view',
  'file',
  'photo',
  'image',
  'india',
  'temple',
  'temples',
  'fort',
  'palace',
  'lake',
  'hill',
  'hills',
  'front',
  'side',
  'aerial',
  'night',
  'day',
  'old',
  'new',
  'jpg',
  'jpeg',
  'png',
]);

// A Wikipedia article's own media list is usually all about that article's
// subject, but not always — e.g. an infobox/"see also" image for a broader
// topic ("Temples of India") can be embedded in a specific temple's page. This
// rejects any media-list image whose filename shares NO significant word with
// the resolved place name, so a generic cross-topic image can't slip into a
// specific place's gallery just because Wikipedia's own page embedded it.
// Common words (temple/fort/india/etc.) are excluded from the comparison so a
// same-category-different-place image still gets caught.
export function isTitleRelevant(filename: string, placeName: string): boolean {
  const placeWords = new Set(
    (placeName.toLowerCase().match(FILENAME_WORD_RE) ?? []).filter(
      (w) => !GENERIC_TITLE_WORDS.has(w),
    ),
  );
  if (placeWords.size === 0) return true; // nothing distinctive to compare against
  const fileWords = (filename.toLowerCase().match(FILENAME_WORD_RE) ?? []).filter(
    (w) => !GENERIC_TITLE_WORDS.has(w),
  );
  return fileWords.some((w) => placeWords.has(w));
}

// Wikipedia's media-list API returns protocol-relative URLs ("//upload...").
export function toAbsoluteUrl(src: string): string {
  return src.startsWith('//') ? `https:${src}` : src;
}

const MAX_GALLERY_IMAGES = 6;

/** A single gallery image, carrying the same provenance
 *  `PlaceDescription` already exposes for the article text — so a caller can
 *  show "Source: Wikipedia — {title}", linked to the real article, next to
 *  the photo itself instead of a bare, unexplained URL. `wikipediaTitle`/
 *  `wikipediaUrl` are identical across every image in one gallery response
 *  (all verified against the same article) — kept per-image rather than
 *  hoisted to the array so a caller never has to reach for a second object
 *  to know where a specific photo came from. */
export interface PlaceImage {
  url: string;
  wikipediaTitle: string;
  wikipediaUrl: string;
}

function wikipediaUrlFor(title: string): string {
  return `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`;
}

// Expands one already-verified article (lead image + title) into up to
// MAX_GALLERY_IMAGES deduped, filename-relevant photos via the article's own
// media-list. Shared by fetchPlaceGallery and fetchPlaceMedia so there is one
// gallery-building path, not two.
async function expandGallery(
  resolved: { title: string; leadImage: string },
  placeName: string,
): Promise<PlaceImage[]> {
  const wikipediaUrl = wikipediaUrlFor(resolved.title);
  const toPlaceImage = (url: string): PlaceImage => ({
    url,
    wikipediaTitle: resolved.title,
    wikipediaUrl,
  });

  const seen = new Set<string>([resolved.leadImage]);
  const gallery = [toPlaceImage(resolved.leadImage)];

  try {
    const res = await fetch(`${WIKI_MEDIA_LIST}/${encodeURIComponent(resolved.title)}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const data = (await res.json()) as { items?: WikiMediaListItem[] };
      for (const item of data.items ?? []) {
        if (gallery.length >= MAX_GALLERY_IMAGES) break;
        if (item.type !== 'image' || !item.title) continue;
        const src = item.srcset?.[0]?.src;
        if (!src) continue;
        const url = toAbsoluteUrl(src);
        if (seen.has(url)) continue;
        if (!isUsablePhoto(url)) continue;
        if (!isTitleRelevant(item.title, placeName)) continue;
        seen.add(url);
        gallery.push(toPlaceImage(url));
      }
    }
  } catch {
    // Media-list fetch failed (timeout/network) — the lead image alone is
    // still a valid, verified result; just skip the extra photos.
  }

  return gallery;
}

/**
 * Returns up to a handful of VERIFIED, place-specific images for a
 * destination, or an empty array when none can be confidently sourced. Every
 * image comes from the SAME Wikipedia article that already passed
 * `resolveVerifiedArticle`'s India + geographic-article gates (the same trust
 * boundary `fetchPlaceImage` relies on for its single cover) — this does not
 * introduce a new image source or a new trust level, only pulls more than one
 * photo from the one already-verified article. The lead image is always
 * first. `knownTitle` is optional — existing callers are unaffected.
 */
export async function fetchPlaceGallery(
  destination: string,
  knownTitle?: string,
): Promise<PlaceImage[]> {
  const resolved = await resolveArticleFor(destination, knownTitle);
  if (!resolved?.leadImage) return [];
  return expandGallery(
    { title: resolved.title, leadImage: resolved.leadImage },
    placeNameFor(destination, knownTitle),
  );
}

export interface PlaceDescription {
  /** Wikipedia's own lead-summary paragraph — genuine sourced text, not an
   *  AI paraphrase or invention. */
  text: string;
  wikipediaTitle: string;
  wikipediaUrl: string;
}

function toDescription(resolved: ResolvedArticle): PlaceDescription | undefined {
  if (!resolved.extract) return undefined;
  return {
    text: resolved.extract,
    wikipediaTitle: resolved.title,
    wikipediaUrl: wikipediaUrlFor(resolved.title),
  };
}

/**
 * A VERIFIED "about this place" paragraph, sourced directly from the same
 * Wikipedia article used for imagery — never an AI paraphrase. Returns
 * `undefined` when no article verifies (the caller should fall back to its
 * own AI-advisory summary, clearly labelled as such, or show nothing).
 */
export async function fetchPlaceDescription(
  destination: string,
  knownTitle?: string,
): Promise<PlaceDescription | undefined> {
  const resolved = await resolveArticleFor(destination, knownTitle);
  return resolved ? toDescription(resolved) : undefined;
}

export interface PlaceMedia {
  images: PlaceImage[];
  description?: PlaceDescription;
}

/**
 * Combined gallery + description in a single Wikipedia resolution — for a
 * rich Place Detail view that wants both without doubling the number of
 * search/summary requests fetchPlaceGallery + fetchPlaceDescription would
 * make independently.
 */
export async function fetchPlaceMedia(
  destination: string,
  knownTitle?: string,
): Promise<PlaceMedia> {
  const resolved = await resolveArticleFor(destination, knownTitle);
  if (!resolved) return { images: [] };

  const description = toDescription(resolved);
  if (!resolved.leadImage) return { images: [], description };

  const images = await expandGallery(
    { title: resolved.title, leadImage: resolved.leadImage },
    placeNameFor(destination, knownTitle),
  );
  return { images, description };
}

// Generous bounding box for India (mainland + Andaman/Nicobar + Lakshadweep).
export function isInIndia(lat: number, lon: number): boolean {
  return lat >= 6.0 && lat <= 37.6 && lon >= 68.0 && lon <= 97.5;
}

// A geographic Wikipedia article for an Indian place almost always names the
// country/an Indian union territory in its short description or first sentence
// ("… a town in Tamil Nadu, India"). Neighbouring-country articles name their
// own country instead, so this reliably keeps enrichment India-only.
export function mentionsIndia(summary: WikiSummary): boolean {
  const text = `${summary.description ?? ''} ${summary.extract ?? ''}`.toLowerCase();
  return /\bindia\b/.test(text);
}

/**
 * One-time cover selection for a trip at create/edit time. Priority:
 *   1. curated image (recognised, hand-picked) — no network,
 *   2. real place image from Wikipedia (recognised non-curated place),
 *   3. `null` (weak / unknown place → the UI shows its honest gradient).
 *
 * Persisting this once at creation lets trip lists & summary cards render the
 * correct photo without any per-card Wikipedia fetch. It never returns a
 * guessed or unrelated image — a failed enrichment resolves to `null`.
 */
export async function selectTripCoverImage(destination: string): Promise<string | null> {
  const { url: curated, generic } = resolveDestinationImageDetail(destination);
  // A place-specific curated image (verified, hand-picked, no network) wins.
  if (curated && !generic) return curated;
  // Otherwise prefer a REAL place-specific photo (e.g. the actual Tirumala
  // temple for "Tirupati") over the generic temple gopuram stand-in.
  try {
    const real = await fetchPlaceImage(destination);
    if (real) return real;
  } catch {
    // ignore — fall through to the generic curated fallback / gradient
  }
  // Last resort: the generic curated fallback (gopuram) if one exists, else null.
  return curated;
}
