import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ExternalLink, Phone, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { InteractiveMap } from '@/components/shared/InteractiveMap';
import { useNearbyPlaces } from '@/features/nearby/hooks/useNearby';
import {
  CATEGORY_META,
  PLACE_CATEGORIES,
  formatDistance,
  travelTime,
} from '@/features/nearby/types';
import type { NearbyPlace, PlaceCategory } from '@/features/nearby/types';

interface Props {
  destination: string;
}

// ── Place mini-card shown when a map marker is tapped ────────────────────────

function PlaceMiniCard({ place, onClose }: { place: NearbyPlace; onClose: () => void }) {
  const meta = CATEGORY_META[place.category];
  const dist = formatDistance(place.distance);
  const { walk } = travelTime(place.distance);

  return (
    <motion.div
      className="rounded-2xl border border-border/50 bg-card/95 p-4 shadow-xl backdrop-blur-sm"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-lg',
            meta.gradient,
          )}
        >
          {meta.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-tight text-foreground">{place.name}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{place.address}</p>
          <div className="mt-1.5 flex items-center gap-2.5 text-[11px] text-muted-foreground">
            <span>{dist}</span>
            <span aria-hidden>·</span>
            <span>{walk}</span>
            {place.openNow !== undefined && (
              <>
                <span aria-hidden>·</span>
                <span className={place.openNow ? 'font-medium text-emerald-500' : 'text-rose-500'}>
                  {place.openNow ? 'Open now' : 'Closed'}
                </span>
              </>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close place details"
          className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>

      {(place.website || place.phone) && (
        <div className="mt-3 flex flex-wrap gap-3 border-t border-border/50 pt-3">
          {place.phone && (
            <a
              href={`tel:${place.phone}`}
              className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
            >
              <Phone className="h-3 w-3" aria-hidden />
              {place.phone}
            </a>
          )}
          {place.website && (
            <a
              href={place.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
            >
              <ExternalLink className="h-3 w-3" aria-hidden />
              Website
            </a>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function DestinationMap({ destination }: Props) {
  const [activeCategory, setActiveCategory] = useState<PlaceCategory | 'all'>('all');
  const [selectedPlace, setSelectedPlace] = useState<NearbyPlace | null>(null);

  const { data, isLoading, isError } = useNearbyPlaces(destination);

  const counts = useMemo<Partial<Record<PlaceCategory, number>>>(() => {
    if (!data) return {};
    const map: Partial<Record<PlaceCategory, number>> = {};
    for (const p of data.places) map[p.category] = (map[p.category] ?? 0) + 1;
    return map;
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    if (activeCategory === 'all') return data.places;
    return data.places.filter((p) => p.category === activeCategory);
  }, [data, activeCategory]);

  const filteredIds = useMemo(() => new Set(filtered.map((p) => p.id)), [filtered]);

  const handleCategoryChange = (cat: PlaceCategory | 'all') => {
    setActiveCategory(cat);
    setSelectedPlace(null);
  };

  if (isLoading) {
    return (
      <section id="map" aria-label="Interactive destination map" className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Explore the Area</h2>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 min-w-[90px] flex-shrink-0 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-[400px] w-full rounded-2xl lg:h-[500px]" />
      </section>
    );
  }

  if (isError || !data) {
    return (
      <section id="map" aria-label="Interactive destination map" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Explore the Area</h2>
        <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20">
          <p className="text-sm text-muted-foreground">
            Map unavailable for {destination.split(',')[0]}.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="map" aria-label="Interactive destination map" className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Explore the Area</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {data.places.length} places within {(data.radiusM / 1000).toFixed(1)} km
        </p>
      </div>

      {/* Category filter chips */}
      <div
        className="flex gap-2 overflow-x-auto pb-1"
        role="group"
        aria-label="Filter map by category"
        style={{ scrollbarWidth: 'none' }}
      >
        <button
          type="button"
          onClick={() => handleCategoryChange('all')}
          className={cn(
            'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors',
            activeCategory === 'all'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-muted text-muted-foreground hover:bg-muted/80',
          )}
        >
          All ({data.places.length})
        </button>
        {PLACE_CATEGORIES.filter((c) => (counts[c.value] ?? 0) > 0).map((cat) => (
          <button
            key={cat.value}
            type="button"
            onClick={() => handleCategoryChange(cat.value)}
            className={cn(
              'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors',
              activeCategory === cat.value
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-muted/80',
            )}
          >
            {cat.emoji} {cat.label} ({counts[cat.value]})
          </button>
        ))}
      </div>

      {/* Map + popup */}
      <div className="relative">
        <InteractiveMap
          centerLat={data.lat}
          centerLon={data.lon}
          radiusM={data.radiusM}
          places={data.places}
          filteredIds={filteredIds}
          selectedPlace={selectedPlace}
          onPlaceSelect={setSelectedPlace}
          className="h-[400px] lg:h-[500px]"
        />

        {/* Selected place mini-card floats over the map */}
        <AnimatePresence>
          {selectedPlace && (
            <div className="absolute bottom-4 left-4 right-4 z-[1000]">
              <PlaceMiniCard place={selectedPlace} onClose={() => setSelectedPlace(null)} />
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
