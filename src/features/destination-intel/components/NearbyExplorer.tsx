import { useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { rv, LIST_VARIANTS, LIST_ITEM_VARIANTS } from '@/lib/motion';
import { useNearbyPlaces } from '@/features/nearby/hooks/useNearby';
import {
  CATEGORY_META,
  PLACE_CATEGORIES,
  formatDistance,
  travelTime,
} from '@/features/nearby/types';
import type { NearbyPlace, PlaceCategory } from '@/features/nearby/types';

const MAX_VISIBLE = 18;

interface PlaceCardProps {
  place: NearbyPlace;
}

function PlaceCard({ place }: PlaceCardProps) {
  const meta = CATEGORY_META[place.category];
  const dist = formatDistance(place.distance);
  const { walk } = travelTime(place.distance);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + place.address)}`;

  return (
    <div className="flex items-start gap-3 rounded-xl border border-border/50 bg-card p-3.5 transition-colors hover:bg-muted/30">
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-lg',
          meta.gradient,
        )}
      >
        {meta.emoji}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-snug text-foreground">{place.name}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{place.address}</p>
        <div className="mt-1.5 flex items-center gap-2 text-[11px] text-muted-foreground">
          <span>{dist}</span>
          <span aria-hidden>·</span>
          <span>{walk}</span>
          {place.openNow !== undefined && (
            <>
              <span aria-hidden>·</span>
              <span
                className={cn('font-medium', place.openNow ? 'text-emerald-500' : 'text-rose-500')}
              >
                {place.openNow ? 'Open' : 'Closed'}
              </span>
            </>
          )}
        </div>
      </div>
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`View ${place.name} on Google Maps`}
        className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <MapPin className="h-3.5 w-3.5" aria-hidden />
      </a>
    </div>
  );
}

interface Props {
  destination: string;
}

export function NearbyExplorer({ destination }: Props) {
  const reduced = useReducedMotion();
  const [activeCategory, setActiveCategory] = useState<PlaceCategory | 'all'>('all');

  const { data, isLoading, isError } = useNearbyPlaces(destination);

  const counts = useMemo<Partial<Record<PlaceCategory, number>>>(() => {
    if (!data) return {};
    const map: Partial<Record<PlaceCategory, number>> = {};
    for (const p of data.places) map[p.category] = (map[p.category] ?? 0) + 1;
    return map;
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    const places =
      activeCategory === 'all'
        ? data.places
        : data.places.filter((p) => p.category === activeCategory);
    return places.slice(0, MAX_VISIBLE);
  }, [data, activeCategory]);

  if (isLoading) {
    return (
      <section id="nearby" aria-label="Nearby places" className="space-y-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Nearby Places</h2>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 min-w-[90px] flex-shrink-0 rounded-full" />
          ))}
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[72px] rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  if (isError || !data) return null;

  return (
    <section id="nearby" aria-label="Nearby places" className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Nearby Places</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {data.places.length} places within {(data.radiusM / 1000).toFixed(1)} km of{' '}
          {destination.split(',')[0]}
        </p>
      </div>

      {/* Category filter chips */}
      <div
        className="flex gap-2 overflow-x-auto pb-1"
        role="group"
        aria-label="Filter nearby places by category"
        style={{ scrollbarWidth: 'none' }}
      >
        <button
          type="button"
          onClick={() => setActiveCategory('all')}
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
            onClick={() => setActiveCategory(cat.value)}
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

      {/* Place grid */}
      {filtered.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          No places found in this category.
        </p>
      ) : (
        <motion.div
          className="grid gap-2.5 sm:grid-cols-2"
          variants={rv(LIST_VARIANTS, reduced)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
        >
          {filtered.map((place) => (
            <motion.div key={place.id} variants={rv(LIST_ITEM_VARIANTS, reduced)}>
              <PlaceCard place={place} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {data.places.length > MAX_VISIBLE && (
        <p className="text-center text-xs text-muted-foreground">
          Showing {Math.min(filtered.length, MAX_VISIBLE)} of{' '}
          {activeCategory === 'all' ? data.places.length : (counts[activeCategory] ?? 0)} places
        </p>
      )}
    </section>
  );
}
