import { useEffect, useState } from 'react';
import { Heart, Navigation, CalendarPlus, ExternalLink, MapPin, Compass } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SourceTag, UnknownField } from '@/components/shared/SourceTag';
import { getMapSearchUrl, getDirectionsUrl } from '@/lib/mapLinks';
import { usePlaceMedia } from '@/hooks/usePlaceMedia';
import { usePlaceTripPlacements } from '@/features/itinerary/hooks/useItinerary';
import { useTrips } from '@/features/trips/hooks/useTrips';
import { formatLocationHierarchy } from '@/lib/geocode';
import { useDestinationBrief } from '../../hooks/useDestinationBrief';
import { CATEGORY_META, formatDistance, type NearbyPlace, type PlaceCategory } from '../../types';

// Data-source technical names → the honest, user-facing phrase for the
// Source section. Falls back to a generic "map data provider" for any value
// this list doesn't recognise, rather than showing a raw technical string.
const DATA_SOURCE_LABELS: Record<string, string> = {
  openstreetmap: 'OpenStreetMap',
};

interface Props {
  place: NearbyPlace | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isFavorite: boolean;
  onFavorite: () => void;
  onAddToTrip: () => void;
  isBroad?: boolean;
  /** Other already-loaded results from the same search — the Nearby section
   *  reads from these, never a second fetch. */
  relatedPlaces?: NearbyPlace[];
  onSelectRelated?: (place: NearbyPlace) => void;
}

function GallerySection({
  images,
  isLoading,
  name,
  category,
}: {
  images: string[];
  isLoading: boolean;
  name: string;
  category: PlaceCategory;
}) {
  const [active, setActive] = useState(0);
  useEffect(() => setActive(0), [name]);
  const meta = CATEGORY_META[category];
  const hero = images[Math.min(active, images.length - 1)];

  return (
    <div className="relative -mx-6 -mt-6 sm:-mx-6">
      <div className="relative h-48 w-full overflow-hidden bg-muted sm:h-64">
        {hero ? (
          <img
            key={hero}
            src={hero}
            alt={`${name}${meta ? ` — ${meta.label}` : ''}`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div
            className={cn(
              'flex h-full w-full items-center justify-center bg-gradient-to-br text-5xl',
              meta?.gradient ?? 'from-muted to-muted/60',
            )}
            aria-hidden="true"
          >
            {isLoading ? null : (meta?.emoji ?? '📍')}
          </div>
        )}
        {hero && (
          <span className="absolute right-3 top-3 rounded-full bg-black/40 px-2 py-1 backdrop-blur-sm">
            <SourceTag kind="verified" label="Verified photo" className="text-white" />
          </span>
        )}
      </div>
      {images.length > 1 && (
        <div
          className="flex gap-1.5 overflow-x-auto border-b border-border/60 bg-muted/20 p-2.5"
          role="group"
          aria-label={`${images.length} photos of ${name}`}
        >
          {images.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                'h-12 w-12 shrink-0 overflow-hidden rounded-lg ring-2 transition-opacity',
                i === active ? 'ring-primary' : 'opacity-70 ring-transparent hover:opacity-100',
              )}
              aria-label={`Show photo ${i + 1} of ${images.length}`}
              aria-current={i === active}
            >
              <img src={url} alt="" className="h-full w-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function PlaceDetailSheet({
  place,
  open,
  onOpenChange,
  isFavorite,
  onFavorite,
  onAddToTrip,
  isBroad = false,
  relatedPlaces = [],
  onSelectRelated,
}: Props) {
  // Every hook below must run even when `place` is briefly null during the
  // dialog's close animation — guard with `?? ''`/`?? undefined` inline
  // rather than an early return, so hook order never changes.
  const meta = place ? CATEGORY_META[place.category] : undefined;
  const {
    images,
    description,
    isLoading: mediaLoading,
    isFetched: mediaFetched,
  } = usePlaceMedia(place?.name, {
    enabled: open && !!place,
    knownTitle: place?.wikipediaTitle,
  });
  // Only try the AI-advisory fallback once Wikipedia has genuinely had its
  // chance and found no verified description — never fire both in parallel
  // (that would waste an AI call whenever Wikipedia was about to succeed).
  const { brief, isLoading: briefLoading } = useDestinationBrief(
    open && place && mediaFetched && !description ? place.name : undefined,
  );
  const { data: placements } = usePlaceTripPlacements(place, { enabled: open });
  const { data: trips } = useTrips();

  if (!place || !meta) return null;

  const mapsUrl = getMapSearchUrl(place.lat, place.lon);
  const routeUrl = getDirectionsUrl(place.lat, place.lon);
  const hierarchyLine = formatLocationHierarchy(place.locationDetail, { includeLocality: true });
  const dataSourceLabel = place.dataSource
    ? (DATA_SOURCE_LABELS[place.dataSource] ?? place.dataSource)
    : null;

  const nearby = relatedPlaces
    .filter((p) => p.id !== place.id)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5);

  const placementSummary =
    placements && placements.length > 0
      ? placements.length === 1
        ? `${trips?.find((t) => t.id === placements[0].tripId)?.title ?? 'a trip'} · Day ${placements[0].dayNumber}`
        : `${placements.length} trips`
      : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-2xl gap-0 overflow-y-auto p-0 sm:rounded-2xl">
        <GallerySection
          images={images}
          isLoading={mediaLoading}
          name={place.name}
          category={place.category}
        />

        <div className="space-y-6 p-6">
          {/* ── Identity ─────────────────────────────────────────────── */}
          <div className="space-y-2">
            <DialogTitle className="text-2xl font-bold leading-tight text-foreground">
              {place.name}
            </DialogTitle>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
                style={{ background: meta.color }}
              >
                {meta.emoji} {meta.label}
              </span>
              {hierarchyLine && (
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {hierarchyLine}
                </span>
              )}
            </div>
            {placementSummary && (
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                ✓ Added to {placementSummary}
              </p>
            )}
          </div>

          {/* ── Actions ──────────────────────────────────────────────── */}
          <div className="flex flex-wrap gap-2">
            <Button asChild className="flex-1 gap-1.5">
              <a href={routeUrl} target="_blank" rel="noopener noreferrer">
                <Navigation className="h-4 w-4" aria-hidden="true" />
                Route
              </a>
            </Button>
            <Button variant="outline" className="flex-1 gap-1.5" onClick={onAddToTrip}>
              <CalendarPlus className="h-4 w-4" aria-hidden="true" />
              Add to Trip
            </Button>
            <Button
              variant="outline"
              className={cn(
                'flex-1 gap-1.5',
                isFavorite && 'border-rose-500/30 bg-rose-500/5 text-rose-500 hover:bg-rose-500/10',
              )}
              onClick={onFavorite}
            >
              <Heart className={cn('h-4 w-4', isFavorite && 'fill-rose-500')} aria-hidden="true" />
              {isFavorite ? 'Saved' : 'Save'}
            </Button>
          </div>

          {/* ── About ────────────────────────────────────────────────── */}
          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground/70">
              About
            </h3>
            {description ? (
              <div className="space-y-1.5">
                <p className="text-sm leading-relaxed text-foreground/90">{description.text}</p>
                <a
                  href={description.wikipediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <SourceTag kind="verified" label="Verified from Wikipedia" />
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              </div>
            ) : brief ? (
              <div className="space-y-1.5">
                <p className="text-sm leading-relaxed text-foreground/90">{brief.summary}</p>
                <SourceTag kind="ai" />
              </div>
            ) : briefLoading || mediaLoading ? (
              <div className="space-y-2" aria-hidden="true">
                <div className="h-3 w-full animate-pulse rounded bg-muted" />
                <div className="h-3 w-4/6 animate-pulse rounded bg-muted" />
              </div>
            ) : (
              <SourceTag kind="unknown" label="No description available for this location" />
            )}
          </section>

          {/* ── Location ─────────────────────────────────────────────── */}
          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground/70">
              Location
            </h3>
            <div className="space-y-1 rounded-xl bg-muted/40 p-3 text-sm">
              {place.address && <p className="text-foreground/90">{place.address}</p>}
              <p className="font-mono text-xs tabular-nums text-muted-foreground">
                {place.lat.toFixed(5)}, {place.lon.toFixed(5)}
              </p>
              {!isBroad && (
                <p className="text-xs text-muted-foreground">
                  {formatDistance(place.distance)} away
                </p>
              )}
            </div>
            <Button variant="outline" size="sm" className="gap-1.5" asChild>
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                Open in Maps
              </a>
            </Button>
          </section>

          {/* ── Visitor information ──────────────────────────────────── */}
          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground/70">
              Visitor Information
            </h3>
            <div className="space-y-2">
              {place.openingHours ? (
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-muted-foreground">
                    <span className="font-medium text-foreground">Hours: </span>
                    {place.openingHours}
                  </span>
                  <SourceTag kind="verified" />
                </div>
              ) : (
                <UnknownField label="Hours" />
              )}
              {place.phone || place.website ? (
                <div className="space-y-1">
                  {place.phone && (
                    <a
                      href={`tel:${place.phone}`}
                      className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      {place.phone}
                    </a>
                  )}
                  {place.website && (
                    <a
                      href={place.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 truncate text-xs text-indigo-500 hover:text-indigo-400"
                    >
                      {place.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                    </a>
                  )}
                </div>
              ) : (
                <UnknownField label="Contact" />
              )}
            </div>
          </section>

          {/* ── Nearby ───────────────────────────────────────────────── */}
          {nearby.length > 0 && (
            <section className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground/70">
                Nearby
              </h3>
              <div className="space-y-1.5">
                {nearby.map((p) => {
                  const pMeta = CATEGORY_META[p.category];
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => onSelectRelated?.(p)}
                      disabled={!onSelectRelated}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted/60 disabled:cursor-default disabled:hover:bg-transparent"
                    >
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-sm"
                        style={{ background: pMeta.color }}
                        aria-hidden="true"
                      >
                        {pMeta.emoji}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-foreground">
                          {p.name}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {pMeta.label} · {formatDistance(p.distance)}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── Source ───────────────────────────────────────────────── */}
          <section className="space-y-1.5 border-t border-border/60 pt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground/70">
              Source
            </h3>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <Compass className="h-3 w-3 shrink-0" aria-hidden="true" />
                Place data
                {dataSourceLabel ? `: Verified from ${dataSourceLabel}` : ': source unknown'}
              </li>
              {images.length > 0 && (
                <li className="flex items-center gap-1.5">
                  <Compass className="h-3 w-3 shrink-0" aria-hidden="true" />
                  Photos: Verified from Wikipedia
                </li>
              )}
              {description ? (
                <li className="flex items-center gap-1.5">
                  <Compass className="h-3 w-3 shrink-0" aria-hidden="true" />
                  About: Verified from Wikipedia
                </li>
              ) : brief ? (
                <li className="flex items-center gap-1.5">
                  <Compass className="h-3 w-3 shrink-0" aria-hidden="true" />
                  About: AI advisory — not independently verified
                </li>
              ) : null}
              <li className="flex items-center gap-1.5">
                <Compass className="h-3 w-3 shrink-0" aria-hidden="true" />
                Distance: derived from coordinates (straight-line)
              </li>
            </ul>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
