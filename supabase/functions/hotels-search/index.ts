import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { HotelProviderError, searchHotels } from './provider.ts';
import type { HotelsSearchRequest, HotelsSearchResponse } from './types.ts';

// Real hotel search, replacing the previous fully-mocked provider
// (src/features/hotels/services/hotels.provider.ts). Mirrors ai-chat's Edge
// Function shape deliberately: same CORS handling, same JWT-verification
// pattern, same "never return the raw upstream error" discipline — see
// supabase/functions/ai-chat/index.ts for the original.

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

// Same redaction discipline as ai-chat/index.ts's sanitizeProviderError —
// strips URLs and key/token-like substrings before anything is logged or
// returned, in case an upstream error ever echoes back its own request URL
// or header value.
function sanitize(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  return raw
    .replace(/https?:\/\/\S+/gi, '[redacted-url]')
    .replace(/\b(key|token|authorization|bearer)\b[=:]?\s*\S+/gi, '$1=[redacted]')
    .slice(0, 300);
}

function isValidRequest(body: unknown): body is HotelsSearchRequest {
  if (typeof body !== 'object' || body === null) return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.destination === 'string' &&
    b.destination.trim().length > 0 &&
    typeof b.lat === 'number' &&
    typeof b.lon === 'number' &&
    typeof b.checkIn === 'string' &&
    b.checkIn.length > 0 &&
    typeof b.checkOut === 'string' &&
    b.checkOut.length > 0 &&
    typeof b.guests === 'number' &&
    b.guests > 0
  );
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  try {
    // Verify Supabase JWT — same pattern as ai-chat/index.ts.
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return json({ error: 'Unauthorized' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return json({ error: 'Unauthorized' }, 401);
    }

    const body = await req.json();
    if (!isValidRequest(body)) {
      return json(
        { error: 'destination, lat, lon, checkIn, checkOut and guests are required' },
        400,
      );
    }

    const hotels = await searchHotels(body);
    const responseBody: HotelsSearchResponse =
      hotels.length > 0 ? { hotels } : { hotels: [], reason: 'no_results' };
    return json(responseBody);
  } catch (err) {
    const message = sanitize(err);
    console.error('hotels-search error:', message);

    if (err instanceof HotelProviderError) {
      const status =
        err.reason === 'rate_limited' ? 429 : err.reason === 'not_configured' ? 503 : 502;
      return json({ error: message, reason: err.reason }, status);
    }
    return json({ error: 'Hotel search failed. Please try again shortly.' }, 500);
  }
});
