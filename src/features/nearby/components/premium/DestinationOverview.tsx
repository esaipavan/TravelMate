import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { BedDouble, CalendarPlus, MapPin, Images, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SourceTag } from '@/components/shared/SourceTag';
import { usePlaceGallery } from '@/hooks/usePlaceGallery';
import { cn } from '@/lib/utils';
import { rv, CARD_VARIANTS } from '@/lib/motion';
import { formatLocationHierarchy } from '@/lib/geocode';
import { useDestinationBrief } from '../../hooks/useDestinationBrief';
import type { NearbyResult } from '../../types';

interface Props {
  result: NearbyResult;
}

/**
 * Destination-first header for Explore. Leads a successful search with the
 * place itself — a real photo (Wikipedia, via usePlaceImage; honest gradient
 * when none), honest facts derived from the resolved result, an AI "about"
 * overview that loads progressively (never blocks), and a primary "Plan a trip"
 * action that carries the destination into the trip wizard. The nearby POI
 * list/map render below this, reframed as "explore around" the place.
 */
export function DestinationOverview({ result }: Props) {
  const reduced = useReducedMotion();

  const parts = result.location
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
  const rawName = parts[0] || result.location;
  const locality = result.locationDetail?.locality;
  // The geocoder's locality field (Nominatim's address.city/town/village) is
  // only a trustworthy PRIMARY name when the search itself resolved to that
  // settlement — it matches the raw display-name's first part (e.g.
  // "Mangalagiri" search → locality "Mangalagiri"). For a landmark/POI search
  // ("Charminar", "Ramappa Temple"), Nominatim's address.city is the
  // CONTAINING city ("Hyderabad"), not the searched place — using it as the
  // primary name would silently rename the landmark to its city, exactly the
  // failure mode this whole feature exists to prevent. In that case the raw
  // name wins and the locality is folded into the region line instead.
  const isSettlementMatch = !!locality && rawName.toLowerCase() === locality.toLowerCase();
  const name = isSettlementMatch ? locality : rawName;
  const structuredRegion = formatLocationHierarchy(result.locationDetail, {
    includeLocality: !isSettlementMatch,
  });
  const region =
    structuredRegion ||
    parts
      .slice(1)
      .filter((p) => p.toLowerCase() !== 'india')
      .slice(-2)
      .join(', ');

  const { images } = usePlaceGallery(name);
  const [activeImage, setActiveImage] = useState(0);
  // Reset to the lead (first, most-confident) image whenever the resolved
  // place changes — otherwise a stale index from the previous search could
  // briefly point at the wrong photo before the gallery finishes loading.
  useEffect(() => setActiveImage(0), [name]);
  const heroImage = images[Math.min(activeImage, images.length - 1)];
  const { brief, isLoading: briefLoading } = useDestinationBrief(name);

  const attractionCount = result.places.filter(
    (p) => p.category === 'attractions' || p.category === 'parks',
  ).length;
  const totalPlaces = result.places.length;
  const radiusKm = (result.radiusM / 1000).toFixed(result.radiusM % 1000 === 0 ? 0 : 1);

  const planHref = `/trips/new?destination=${encodeURIComponent(name)}`;
  const hotelsHref = `/hotels?destination=${encodeURIComponent(result.location)}`;

  return (
    <motion.section
      variants={rv(CARD_VARIANTS, reduced)}
      initial="hidden"
      animate="show"
      className="overflow-hidden rounded-2xl border border-border/60 bg-card"
    >
      {/* Hero */}
      <div className="relative h-48 w-full sm:h-60">
        {heroImage ? (
          <img
            key={heroImage}
            src={heroImage}
            alt={name}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/10 to-transparent" />
        )}
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"
          aria-hidden
        />
        {heroImage && (
          <span className="absolute right-3 top-3 rounded-full bg-black/40 px-2 py-1 backdrop-blur-sm">
            <SourceTag kind="verified" label="Verified photo" className="text-white" />
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 p-5">
          <h2 className="text-2xl font-bold text-white drop-shadow-sm sm:text-3xl">{name}</h2>
          {region && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-white/85">
              <MapPin className="h-3.5 w-3.5" aria-hidden />
              {region}
            </p>
          )}
        </div>
      </div>

      {/* Thumbnail strip — only when the SAME verified article yielded more
          than one photo. Horizontal scroll (not a grid) so it works at any
          width down to a narrow phone screen; each thumbnail is a real photo
          from the same source as the hero, never a different destination's
          image. */}
      {images.length > 1 && (
        <div
          className="flex gap-1.5 overflow-x-auto border-b border-border/60 bg-muted/20 p-2.5"
          role="group"
          aria-label={`${images.length} photos of ${name}`}
        >
          {images.slice(0, 5).map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setActiveImage(i)}
              className={cn(
                'h-12 w-12 shrink-0 overflow-hidden rounded-lg ring-2 transition-opacity',
                i === activeImage
                  ? 'ring-primary'
                  : 'opacity-70 ring-transparent hover:opacity-100',
              )}
              aria-label={`Show photo ${i + 1} of ${images.length}`}
              aria-current={i === activeImage}
            >
              <img src={url} alt="" className="h-full w-full object-cover" loading="lazy" />
            </button>
          ))}
          {images.length > 5 && (
            <span className="flex h-12 w-12 shrink-0 items-center justify-center gap-0.5 rounded-lg bg-muted text-xs font-semibold text-muted-foreground">
              <Images className="h-3 w-3" aria-hidden />+{images.length - 5}
            </span>
          )}
        </div>
      )}

      {/* Body */}
      <div className="flex flex-col gap-4 p-5">
        {/* Honest facts — derived only from the resolved result, never invented */}
        <div className="flex flex-wrap gap-2">
          {attractionCount > 0 && (
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">
              🎯 {attractionCount} attraction{attractionCount !== 1 ? 's' : ''} nearby
            </span>
          )}
          {totalPlaces > 0 && (
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              {totalPlaces} place{totalPlaces !== 1 ? 's' : ''} within {radiusKm} km
            </span>
          )}
          {result.scope === 'state' && (
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              Whole-state view
            </span>
          )}
        </div>

        {/* AI overview — labelled, progressive, non-blocking */}
        {(briefLoading || brief) && (
          <div className="rounded-xl border border-border/60 bg-muted/40 p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-foreground/80">About {name}</p>
              <SourceTag kind="ai" />
            </div>
            {briefLoading && !brief ? (
              <div className="space-y-2" aria-hidden>
                <div className="h-3 w-full animate-pulse rounded bg-muted" />
                <div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
                <div className="h-3 w-4/6 animate-pulse rounded bg-muted" />
              </div>
            ) : brief ? (
              <>
                <p className="text-sm leading-relaxed text-foreground/90">{brief.summary}</p>
                {brief.knownFor.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {brief.knownFor.map((k) => (
                      <span
                        key={k}
                        className="inline-flex items-center gap-1 rounded-full bg-background px-2.5 py-0.5 text-xs text-foreground/80"
                      >
                        <Star className="h-3 w-3 text-amber-500" aria-hidden />
                        {k}
                      </span>
                    ))}
                  </div>
                )}
                {brief.bestTime && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground/80">Best time to visit:</span>{' '}
                    {brief.bestTime}
                  </p>
                )}
              </>
            ) : null}
          </div>
        )}

        {/* Actions — Plan-a-trip is the primary path into trip creation */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild className="flex-1 gap-2">
            <Link to={planHref}>
              <CalendarPlus className="h-4 w-4" aria-hidden />
              Plan a trip to {name}
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1 gap-2">
            <Link to={hotelsHref}>
              <BedDouble className="h-4 w-4" aria-hidden />
              Search hotels in {name}
            </Link>
          </Button>
        </div>
      </div>
    </motion.section>
  );
}
