// Shared helpers for the public-trip edge functions (/api/og and /api/og-image).
// Files prefixed with "_" are not routes; they're importable by the functions.
// Kept dependency-free and honest: only PUBLIC trips are ever fetched.

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = process.env.VITE_SUPABASE_ANON_KEY;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export interface PublicTrip {
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  cover_image_url: string | null;
}

export function escHtml(value: string): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fmtDay(dateStr: string): string {
  const [, m, d] = dateStr.split('-').map(Number);
  return `${MONTHS[(m || 1) - 1]} ${d || ''}`.trim();
}

export function formatRange(start: string, end: string): string {
  const year = (end || start).split('-')[0];
  return `${fmtDay(start)} – ${fmtDay(end)}, ${year}`;
}

// A cover is "real" (trustworthy to display in the OG card) only when it's a
// genuine user-provided image. This runtime can't run the curated resolver or
// verify India-ness, so it treats both auto sources as unverifiable → branded
// fallback: an images.unsplash.com URL may be a stale legacy guess, and an
// upload.wikimedia.org URL may be an out-of-scope foreign legacy cover. Only a
// user upload (storage / custom URL) passes. The client public page still shows
// the correctly reconciled cover.
export function isRealCover(cover: string | null | undefined): cover is string {
  return (
    !!cover &&
    !cover.includes('images.unsplash.com') &&
    !cover.includes('wikimedia.org') &&
    !cover.includes('wikipedia.org')
  );
}

/** Fetch a PUBLIC trip (is_public only) via Supabase REST. Null when private,
 *  unknown, malformed id, or the service is unavailable. */
export async function fetchPublicTrip(id: string): Promise<PublicTrip | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON || !UUID_RE.test(id)) return null;
  try {
    const endpoint =
      `${SUPABASE_URL}/rest/v1/trips` +
      `?select=title,destination,start_date,end_date,cover_image_url` +
      `&id=eq.${id}&is_public=eq.true&limit=1`;
    const res = await fetch(endpoint, {
      headers: { apikey: SUPABASE_ANON, authorization: `Bearer ${SUPABASE_ANON}` },
    });
    if (!res.ok) return null;
    const rows = (await res.json()) as PublicTrip[];
    return Array.isArray(rows) && rows[0] ? rows[0] : null;
  } catch {
    return null;
  }
}
