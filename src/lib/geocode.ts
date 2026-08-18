// Shared Nominatim (OpenStreetMap) geocoding client. Both `nearby` and
// `weather` used to duplicate this request independently — this is the
// single source of truth so a fix (headers, error handling) only needs to
// happen once. No API key required; Nominatim's usage policy asks for an
// identifying User-Agent, which every request here sends.

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';

export interface GeocodeResult {
  lat: number;
  lon: number;
  displayName: string;
}

export async function geocodeLocation(query: string): Promise<GeocodeResult> {
  const params = new URLSearchParams({ q: query, format: 'json', limit: '1' });

  const res = await fetch(`${NOMINATIM_URL}/search?${params.toString()}`, {
    headers: { 'Accept-Language': 'en', 'User-Agent': 'TravelMate/1.0' },
  });

  if (!res.ok) throw new Error('Geocoding request failed');

  const results = (await res.json()) as Array<{
    lat: string;
    lon: string;
    display_name: string;
  }>;

  if (!results.length) throw new Error(`No location found for "${query}"`);

  return {
    lat: parseFloat(results[0].lat),
    lon: parseFloat(results[0].lon),
    displayName: results[0].display_name,
  };
}
