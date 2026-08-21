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

interface WikiSummary {
  type?: string;
  coordinates?: { lat: number; lon: number };
  originalimage?: { source: string };
  thumbnail?: { source: string };
  description?: string;
  extract?: string;
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
 * Returns a real, place-relevant image URL for a recognised destination, or
 * `null` when we can't confidently source one. Confidence bar:
 *   1. Wikipedia search resolves the query to a page.
 *   2. That page is a `standard` article (not a disambiguation / missing page).
 *   3. The page carries geographic `coordinates` — i.e. it's an actual place,
 *      not a person, film, or concept that happens to share the name.
 *   4. The page has an image.
 * Only when all four hold do we return the image (preferring the full-size
 * `originalimage`); otherwise `null`.
 */
export async function fetchPlaceImage(destination: string): Promise<string | null> {
  const query = destination.trim();
  if (!query) return null;

  const title = await searchWikiTitle(query);
  if (!title) return null;

  const summary = await fetchWikiSummary(title);
  if (!summary) return null;

  // Must be a real geographic place article with an image — never a guess.
  if (summary.type !== 'standard') return null;
  if (!summary.coordinates) return null;

  // India-only product scope: only enrich places that actually sit inside India.
  // A generous bounding box excludes far-away places (Paris, Tokyo); the text
  // check additionally excludes neighbouring-country places that fall inside the
  // box (Kathmandu, Colombo, Dhaka, Lahore …) by requiring the article to name
  // India. Both must hold, else return null → honest gradient.
  if (!isInIndia(summary.coordinates.lat, summary.coordinates.lon)) return null;
  if (!mentionsIndia(summary)) return null;

  const image = summary.originalimage?.source ?? summary.thumbnail?.source ?? null;
  // Reject non-photograph lead images (locator maps, flags, seals, SVG logos)
  // that some place articles carry — we only want a real photo of the place.
  return image && isUsablePhoto(image) ? image : null;
}

// Wikipedia article lead images are usually a real photo, but some places carry
// a locator map / flag / seal / SVG emblem instead. Exclude those by filename.
function isUsablePhoto(url: string): boolean {
  const u = url.toLowerCase();
  if (u.endsWith('.svg')) return false;
  return !/(flag|coat[_%]|locator|location_map|_map[._]|seal[_%]|emblem|\blogo\b|\bicon\b)/.test(u);
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
