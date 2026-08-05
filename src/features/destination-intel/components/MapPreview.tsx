import { useState, useEffect } from 'react';
import { MapPin, Navigation, Loader2 } from 'lucide-react';
import type { DestinationOverview } from '../types';

interface Props {
  overview: DestinationOverview;
}

interface Coords {
  lat: number;
  lon: number;
}

async function geocodeDestination(query: string, signal: AbortSignal): Promise<Coords | null> {
  try {
    const params = new URLSearchParams({ q: query, format: 'json', limit: '1' });
    const res = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
      headers: { 'Accept-Language': 'en', 'User-Agent': 'TravelMate/1.0' },
      signal,
    });
    if (!res.ok) return null;
    const raw: unknown = await res.json();
    if (!Array.isArray(raw) || raw.length === 0) return null;
    const first = raw[0] as Record<string, unknown>;
    const lat = parseFloat(String(first['lat'] ?? ''));
    const lon = parseFloat(String(first['lon'] ?? ''));
    if (isNaN(lat) || isNaN(lon)) return null;
    return { lat, lon };
  } catch {
    return null;
  }
}

export function MapPreview({ overview }: Props) {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setCoords(null);
    const query =
      overview.country && overview.country !== overview.destination
        ? `${overview.destination}, ${overview.country}`
        : overview.destination;
    void geocodeDestination(query, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setCoords(result);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => {
      controller.abort();
    };
  }, [overview.destination, overview.country]);

  const delta = 0.15;
  const mapSrc = coords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${coords.lon - delta},${coords.lat - delta},${coords.lon + delta},${coords.lat + delta}&layer=mapnik&marker=${coords.lat},${coords.lon}`
    : null;

  return (
    <div
      className="overflow-hidden rounded-2xl border border-border/50 bg-card"
      role="region"
      aria-label={`Map of ${overview.destination}`}
    >
      {/* Header strip */}
      <div className="flex items-center gap-2 border-b border-border/50 px-4 py-3">
        <span className="text-lg leading-none" role="img" aria-label={overview.country}>
          {overview.flagEmoji}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
            <span className="text-sm font-semibold text-foreground">{overview.destination}</span>
            <span className="text-sm text-muted-foreground">· {overview.country}</span>
          </div>
          <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <Navigation className="h-3 w-3 shrink-0" aria-hidden="true" />
            <span>{overview.timezoneOffset}</span>
          </div>
        </div>
        <span className="text-[10px] text-muted-foreground/50">© OpenStreetMap</span>
      </div>

      {/* Map area */}
      <div className="relative h-64 bg-muted/30">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2
              className="h-6 w-6 animate-spin text-muted-foreground"
              aria-label="Loading map…"
            />
          </div>
        )}
        {!loading && mapSrc && (
          <iframe
            src={mapSrc}
            className="h-full w-full border-0"
            title={`Map of ${overview.destination}`}
            loading="lazy"
            sandbox="allow-scripts allow-same-origin"
          />
        )}
        {!loading && !mapSrc && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <MapPin className="h-8 w-8 text-muted-foreground/30" aria-hidden="true" />
            <p className="text-xs">Map unavailable for this destination</p>
          </div>
        )}
      </div>
    </div>
  );
}
