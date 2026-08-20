// ── Generated OG/share image for public itinerary links ─────────────────────
// Vercel Edge Function using @vercel/og (Satori → PNG). /api/og-image?id=:id is
// referenced as og:image by /api/og, so social/chat unfurls show a purpose-built
// 1200×630 card instead of the generic site image.
//
// Honest + private-safe:
//   • Only PUBLIC trips are fetched (fetchPublicTrip → is_public + RLS). A
//     private/unknown id renders a GENERIC branded card with NO trip data.
//   • Card text is real stored trip data only (title, destination, dates).
//   • The trip cover is used as the background ONLY when it's a real image
//     (isRealCover); an auto-generated / possibly-stale cover → branded gradient.
//   • Any render error (e.g. a cover that won't load) degrades to the branded
//     card rather than failing.

import { ImageResponse } from '@vercel/og';
import { fetchPublicTrip, formatRange, isRealCover } from './_shared';

export const config = { runtime: 'edge' };

const W = 1200;
const H = 630;
const BRAND_GRADIENT = 'linear-gradient(135deg, #1D4ED8 0%, #7C3AED 55%, #DB2777 100%)';

const IMAGE_HEADERS = {
  'content-type': 'image/png',
  'cache-control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800',
};

function BrandMark() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div
        style={{
          display: 'flex',
          width: 46,
          height: 46,
          borderRadius: 12,
          background: 'white',
          color: '#1D4ED8',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
          fontWeight: 800,
        }}
      >
        T
      </div>
      <div style={{ fontSize: 27, fontWeight: 700, letterSpacing: 1 }}>TravelMate</div>
    </div>
  );
}

function brandedCard(subtitle: string) {
  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: BRAND_GRADIENT,
        color: 'white',
        fontFamily: 'sans-serif',
        gap: 18,
      }}
    >
      <div style={{ fontSize: 78, fontWeight: 800, letterSpacing: 1 }}>TravelMate</div>
      <div style={{ fontSize: 32, opacity: 0.9 }}>{subtitle}</div>
    </div>,
    { width: W, height: H, headers: IMAGE_HEADERS },
  );
}

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const id = url.searchParams.get('id') ?? '';

  try {
    const trip = await fetchPublicTrip(id);

    // Private / unknown → generic branded card, no trip data exposed.
    if (!trip) return brandedCard('Plan · book · share your trips');

    const cover = isRealCover(trip.cover_image_url) ? trip.cover_image_url : null;
    const dates = formatRange(trip.start_date, trip.end_date);

    return new ImageResponse(
      <div
        style={{
          display: 'flex',
          position: 'relative',
          width: '100%',
          height: '100%',
          fontFamily: 'sans-serif',
        }}
      >
        {cover ? (
          <img
            src={cover}
            width={W}
            height={H}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : null}
        {/* Overlay for legibility over a cover, or the branded gradient when none. */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: cover
              ? 'linear-gradient(180deg, rgba(2,6,23,0.30) 0%, rgba(2,6,23,0.82) 100%)'
              : BRAND_GRADIENT,
          }}
        />
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '100%',
            height: '100%',
            padding: 64,
            color: 'white',
          }}
        >
          {/* Top row: brand + read-only tag */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <BrandMark />
            <div
              style={{ fontSize: 20, letterSpacing: 3, textTransform: 'uppercase', opacity: 0.85 }}
            >
              Shared itinerary
            </div>
          </div>

          {/* Bottom block: title + destination + dates */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                display: 'flex',
                fontSize: 66,
                fontWeight: 800,
                lineHeight: 1.05,
                maxWidth: 1000,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {trip.title}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 24 }}>
              <div
                style={{
                  display: 'flex',
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  background: '#38BDF8',
                }}
              />
              <div style={{ fontSize: 32, opacity: 0.96 }}>{trip.destination}</div>
            </div>
            <div style={{ display: 'flex', fontSize: 26, opacity: 0.82, marginTop: 8 }}>
              {dates}
            </div>
          </div>
        </div>
      </div>,
      { width: W, height: H, headers: IMAGE_HEADERS },
    );
  } catch {
    // Any failure (e.g. a cover that won't load) → safe branded card.
    return brandedCard('Plan · book · share your trips');
  }
}
