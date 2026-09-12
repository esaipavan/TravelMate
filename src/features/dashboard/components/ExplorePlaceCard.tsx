import { MapPin } from 'lucide-react';
import { SourceTag } from '@/components/shared/SourceTag';
import type { ExplorePlace } from '@/features/explore/types';

interface Props {
  place: ExplorePlace;
  /** Show the locality/state line — on for country/state-scope results, where
   *  WHICH city/area a place is in is itself useful information; redundant
   *  for a city-scope search where every result is already local. */
  showLocation: boolean;
}

export function ExplorePlaceCard({ place, showLocation }: Props) {
  const locationLine = [place.locality, place.state].filter(Boolean).join(', ');

  return (
    <div className="rounded-xl border border-border/50 bg-background/60 p-3.5">
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <h4 className="min-w-0 truncate text-sm font-semibold text-foreground">{place.name}</h4>
        <span className="shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
          {place.category}
        </span>
      </div>

      {showLocation && locationLine && (
        <p className="mb-1.5 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
          <span className="truncate">{locationLine}</span>
        </p>
      )}

      {place.blurb && (
        <p className="mb-2 text-xs leading-relaxed text-foreground/80">{place.blurb}</p>
      )}

      <div className="flex items-center gap-3">
        <SourceTag kind="verified" label="Real place" />
        {place.aiRanked && <SourceTag kind="ai" label="AI pick" />}
      </div>
    </div>
  );
}
