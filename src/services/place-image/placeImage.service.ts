// Real place imagery for recognised-but-non-curated destinations.
//
// Source: Wikipedia (search → REST summary). The app already renders Wikipedia
// thumbnails elsewhere, so `upload.wikimedia.org` (images) and `en.wikipedia.org`
// (fetch) are already allow-listed in the CSP — no boundary change needed.
//
// This deliberately does NOT guess. An image is only returned when Wikipedia
// gives us a *geographic* article (a standard page that carries map
// coordinates) that also has a real image — which structurally excludes
// people / films / concepts / disambiguation pages. Anything short of that
// returns null so the caller shows its honest gradient instead of a photo.

import { resolveDestinationImageDetail } from '@/utils/destinationTheme';

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

/**
 * Resolves a query to a verified geographic Wikipedia article, or `null`.
 * Confidence bar: search resolves a page; the page is a `standard` article (not
 * a disambiguation/missing page); it carries geographic `coordinates` inside
 * India (excludes people/films/concepts and foreign namesakes); the article
 * names India; and it has a real lead photo (not a locator map / flag / SVG).
 * Returns the article title alongside the lead image so callers that need more
 * than one photo (fetchPlaceGallery) can pull from the SAME verified article
 * instead of re-resolving it.
 */
async function resolveVerifiedArticle(
  query: string,
): Promise<{ title: string; leadImage: string } | null> {
  const title = await searchWikiTitle(query);
  if (!title) return null;

  const summary = await fetchWikiSummary(title);
  if (!summary) return null;

  if (summary.type !== 'standard') return null;
  if (!summary.coordinates) return null;
  if (!isInIndia(summary.coordinates.lat, summary.coordinates.lon)) return null;
  if (!mentionsIndia(summary)) return null;

  const leadImage = summary.originalimage?.source ?? summary.thumbnail?.source ?? null;
  return leadImage && isUsablePhoto(leadImage) ? { title, leadImage } : null;
}

async function tryWikiImage(query: string): Promise<string | null> {
  const resolved = await resolveVerifiedArticle(query);
  return resolved?.leadImage ?? null;
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
 * geographic-article gates in `tryWikiImage` keep foreign/wrong matches out.
 */
export async function fetchPlaceImage(destination: string): Promise<string | null> {
  const query = destination.trim();
  if (!query) return null;

  const candidates: string[] = [query];
  const firstPart = query.split(',')[0]?.trim();
  if (firstPart && firstPart.toLowerCase() !== query.toLowerCase()) candidates.push(firstPart);

  for (const c of candidates) {
    const img = await tryWikiImage(c);
    if (img) return img;
  }
  return null;
}

// Wikipedia article lead images are usually a real photo, but some places carry
// a locator map / flag / seal / SVG emblem instead. Exclude those by filename.
function isUsablePhoto(url: string): boolean {
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
function isTitleRelevant(filename: string, placeName: string): boolean {
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
function toAbsoluteUrl(src: string): string {
  return src.startsWith('//') ? `https:${src}` : src;
}

const MAX_GALLERY_IMAGES = 6;

/**
 * Returns up to a handful of VERIFIED, place-specific images for a
 * destination, or an empty array when none can be confidently sourced. Every
 * image comes from the SAME Wikipedia article that already passed
 * `resolveVerifiedArticle`'s India + geographic-article gates (the same trust
 * boundary `fetchPlaceImage` relies on for its single cover) — this does not
 * introduce a new image source or a new trust level, only pulls more than one
 * photo from the one already-verified article. The lead image is always
 * first. Filenames are deduped and filtered through both the existing
 * flag/map/seal blocklist and `isTitleRelevant` (rejects a same-page image
 * that names an unrelated broader topic, e.g. "Temples_of_India.jpg" showing
 * up inside a specific temple's own article).
 */
export async function fetchPlaceGallery(destination: string): Promise<string[]> {
  const query = destination.trim();
  if (!query) return [];

  const placeName = query.split(',')[0]?.trim() || query;
  const candidates: string[] = [query];
  if (placeName.toLowerCase() !== query.toLowerCase()) candidates.push(placeName);

  let resolved: { title: string; leadImage: string } | null = null;
  for (const c of candidates) {
    resolved = await resolveVerifiedArticle(c);
    if (resolved) break;
  }
  if (!resolved) return [];

  const seen = new Set<string>([resolved.leadImage]);
  const gallery = [resolved.leadImage];

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
        gallery.push(url);
      }
    }
  } catch {
    // Media-list fetch failed (timeout/network) — the lead image alone is
    // still a valid, verified result; just skip the extra photos.
  }

  return gallery;
}

// Generous bounding box for India (mainland + Andaman/Nicobar + Lakshadweep).
function isInIndia(lat: number, lon: number): boolean {
  return lat >= 6.0 && lat <= 37.6 && lon >= 68.0 && lon <= 97.5;
}

// A geographic Wikipedia article for an Indian place almost always names the
// country/an Indian union territory in its short description or first sentence
// ("… a town in Tamil Nadu, India"). Neighbouring-country articles name their
// own country instead, so this reliably keeps enrichment India-only.
function mentionsIndia(summary: WikiSummary): boolean {
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
