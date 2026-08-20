// ── Edge preview renderer for public itinerary links (/p/:id) ────────────────
// Vercel Edge Function. `vercel.json` rewrites /p/:id → /api/og?id=:id so this
// runs on the initial request, BEFORE any client JavaScript. It fetches the
// PUBLIC trip (is_public only) from Supabase and injects real Open Graph /
// Twitter / canonical tags into the app shell, so link unfurlers that don't
// execute JS still see the trip title, description, dates and preview image.
//
// Honest + private-safe:
//   • Only trips with is_public = true are ever fetched (RLS enforces this too),
//     so a private/unknown id falls through to the default site meta — no leak.
//   • Metadata is built only from stored trip fields; no invented text/images.
//   • og:image points at the generated /api/og-image card (built from the same
//     public trip data), which itself is private-safe.
//   • The returned document is the unmodified app shell (same scripts), so the
//     SPA still boots and the client `useShareMeta` hook keeps working as before.

import { fetchPublicTrip, formatRange, escHtml } from './_shared';

export const config = { runtime: 'edge' };

function injectMeta(
  html: string,
  meta: { title: string; description: string; url: string; image: string },
): string {
  const tags = [
    `<title>${escHtml(meta.title)}</title>`,
    `<meta name="description" content="${escHtml(meta.description)}" />`,
    `<link rel="canonical" href="${escHtml(meta.url)}" />`,
    `<meta property="og:type" content="article" />`,
    `<meta property="og:site_name" content="TravelMate" />`,
    `<meta property="og:title" content="${escHtml(meta.title)}" />`,
    `<meta property="og:description" content="${escHtml(meta.description)}" />`,
    `<meta property="og:url" content="${escHtml(meta.url)}" />`,
    `<meta property="og:image" content="${escHtml(meta.image)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${escHtml(meta.title)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escHtml(meta.title)}" />`,
    `<meta name="twitter:description" content="${escHtml(meta.description)}" />`,
    `<meta name="twitter:image" content="${escHtml(meta.image)}" />`,
  ].join('\n    ');

  // Strip the static site defaults so the injected trip tags are authoritative,
  // then insert the fresh block just before </head>.
  return html
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(/<meta\s+name="description"[^>]*>/i, '')
    .replace(/<link\s+rel="canonical"[^>]*>/i, '')
    .replace(/<meta\s+property="og:[^"]*"[^>]*>/gi, '')
    .replace(/<meta\s+name="twitter:[^"]*"[^>]*>/gi, '')
    .replace(/<\/head>/i, `${tags}\n  </head>`);
}

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const origin = url.origin;
  const id = url.searchParams.get('id') ?? '';

  // Always serve the real app shell so the SPA boots normally after unfurl.
  const shell = await fetch(new URL('/index.html', origin));
  let html = await shell.text();

  const trip = await fetchPublicTrip(id);
  if (trip) {
    const title = `${trip.title} · Shared itinerary`;
    const description =
      `${trip.destination} · ${formatRange(trip.start_date, trip.end_date)}` +
      ` — a read-only itinerary shared from TravelMate.`;
    // Purpose-built, private-safe generated card for this trip.
    const image = `${origin}/api/og-image?id=${encodeURIComponent(id)}`;
    html = injectMeta(html, { title, description, url: `${origin}/p/${id}`, image });
  }
  // Private / unknown trips: shell is returned unchanged → default site meta.

  return new Response(html, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=600',
    },
  });
}
