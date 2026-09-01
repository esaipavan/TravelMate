import { MapPin, ExternalLink, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getMapSearchUrl } from '@/lib/mapLinks';
import { PLACE_CATEGORIES } from '../types';
import type { NearbyPlace } from '../types';

interface Props {
  place: NearbyPlace;
}

function formatDistance(metres: number): string {
  if (metres < 1000) return `${metres} m`;
  return `${(metres / 1000).toFixed(1)} km`;
}

export function PlaceCard({ place }: Props) {
  const meta = PLACE_CATEGORIES.find((c) => c.value === place.category);

  const mapsUrl = getMapSearchUrl(place.lat, place.lon);

  return (
    <div className="flex items-start gap-3 rounded-lg border bg-card p-4 transition-shadow hover:shadow-sm">
      <span className="mt-0.5 shrink-0 text-2xl leading-none" role="img" aria-label={meta?.label}>
        {meta?.emoji ?? '📍'}
      </span>

      <div className="min-w-0 flex-1 space-y-1">
        <p className="font-medium leading-snug">{place.name}</p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          {place.address && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="line-clamp-1">{place.address}</span>
            </span>
          )}
          <span className="flex items-center gap-1 tabular-nums">
            <Navigation className="h-3 w-3 shrink-0" />
            {formatDistance(place.distance)}
          </span>
        </div>
      </div>

      <Button size="sm" variant="outline" className="shrink-0" asChild>
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
          Maps
        </a>
      </Button>
    </div>
  );
}
