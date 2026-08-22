import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  MapPinOff,
  LocateFixed,
  BedDouble,
  ArrowRight,
  ServerCrash,
  Compass,
  Map as MapIcon,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import { rv, PAGE_VARIANTS, LIST_VARIANTS, LIST_ITEM_VARIANTS } from '@/lib/motion';
import { getCurrentCoordinates, GeolocationError } from '@/lib/geolocation';
import { useNearbyPlaces, useNearbyPlacesAtCoords } from '../hooks/useNearby';
import { NearbyError } from '../services/nearby.service';
import { useFavorites } from '../hooks/useFavorites';
import { parseSearchQuery } from '../utils/parseSearchQuery';
import { isTravelRelevant } from '../types';
import type { PlaceCategory, NearbyPlace } from '../types';

// Premium components
import { ExplorerSearchBar } from '../components/premium/ExplorerSearchBar';
import { ExplorerCategoryBar } from '../components/premium/ExplorerCategoryBar';
import { ExplorerSkeleton } from '../components/premium/ExplorerSkeleton';
import { ExplorerEmptyState } from '../components/premium/ExplorerEmptyState';
import { NearbyPlaceCard } from '../components/premium/NearbyPlaceCard';
import { InteractiveMap } from '@/components/shared/InteractiveMap';
import { PlaceDetailPanel } from '../components/premium/PlaceDetailPanel';
import { AIExplorerPanel } from '../components/premium/AIExplorerPanel';

export default function NearbyPage() {
  const [input, setInput] = useState('');
  const [destination, setDestination] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [category, setCategory] = useState<PlaceCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<NearbyPlace | null>(null);

  const qc = useQueryClient();
  const reduced = useReducedMotion();
  const { isFavorite, toggleFavorite } = useFavorites();

  const stringQuery = useNearbyPlaces(destination);
  const coordsQuery = useNearbyPlacesAtCoords(coords);
  const { data, isLoading, isError, isFetching, error } = coords ? coordsQuery : stringQuery;

  // ── Handlers ─────────────────────────────────────────────────────────────────

  async function handleNearMe() {
    setLocationError(null);
    setIsLocating(true);
    setSelectedPlace(null);
    setSearch('');
    setDestination('');
    try {
      const c = await getCurrentCoordinates();
      setInput('');
      setCoords(c);
    } catch (err) {
      setCoords(null);
      setLocationError(
        err instanceof GeolocationError ? err.message : 'Could not determine your location.',
      );
    } finally {
      setIsLocating(false);
    }
  }

  function handleSearch() {
    const q = input.trim();
    if (!q) return;
    setSearch('');
    setSelectedPlace(null);
    setLocationError(null);

    const parsed = parseSearchQuery(q);
    setCategory(parsed.categoryIntent ?? 'all');

    if (parsed.useCurrentLocation) {
      void handleNearMe();
      return;
    }

    setCoords(null);
    if (parsed.location === destination) {
      void qc.invalidateQueries({ queryKey: ['nearby', destination] });
    } else {
      setDestination(parsed.location);
    }
  }

  function handleRefresh() {
    setSelectedPlace(null);
    if (coords) {
      void qc.invalidateQueries({ queryKey: ['nearby-coords', coords.lat, coords.lon] });
    } else {
      void qc.invalidateQueries({ queryKey: ['nearby', destination] });
    }
  }

  // Category shortcut tapped from the empty state: search whatever the user
  // has already typed, filtered to that category — or Near Me if nothing's
  // typed yet, since a bare category tap has no location to go on otherwise.
  function handleCategoryShortcut(cat: PlaceCategory) {
    setSearch('');
    setSelectedPlace(null);
    setLocationError(null);
    setCategory(cat);

    const q = input.trim();
    if (!q) {
      void handleNearMe();
      return;
    }

    setCoords(null);
    if (q === destination) {
      void qc.invalidateQueries({ queryKey: ['nearby', destination] });
    } else {
      setDestination(q);
    }
  }

  function handleExampleClick(dest: string) {
    setInput(dest);
    setDestination(dest);
    setCoords(null);
    setLocationError(null);
    setSearch('');
    setCategory('all');
    setSelectedPlace(null);
  }

  function handlePlaceSelect(place: NearbyPlace | null) {
    setSelectedPlace((prev) => (prev?.id === place?.id ? null : place));
  }

  // ── Derived data ──────────────────────────────────────────────────────────────

  const counts = useMemo<Partial<Record<PlaceCategory, number>>>(() => {
    if (!data) return {};
    const map: Partial<Record<PlaceCategory, number>> = {};
    for (const p of data.places) {
      map[p.category] = (map[p.category] ?? 0) + 1;
    }
    return map;
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    let result = data.places;
    if (category !== 'all') result = result.filter((p) => p.category === category);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q),
      );
    }
    return result;
  }, [data, category, search]);

  const filteredIds = useMemo(() => new Set(filtered.map((p) => p.id)), [filtered]);

  // Which markers the map shows. The result LIST is discovery-first (ranked by
  // CATEGORY_PRIORITY); the map should match that intent in its default view.
  // Only in the default Explore view — category "All" and no text search — do we
  // limit the map to travel-relevant places (via the existing isTravelRelevant
  // helper), so utilities (hospitals/ATMs/fuel/pharmacies) don't bury attractions
  // under a wall of pins. Utilities are never removed: they stay in the list, in
  // the chips, and on the map when their chip is selected (that path uses
  // filteredIds unchanged). If a destination has no travel-relevant places, fall
  // back to filteredIds so the map is never blank. When a category is selected or
  // a search is active, this is exactly filteredIds — current behavior preserved.
  const mapVisibleIds = useMemo(() => {
    if (!data || category !== 'all' || search.trim()) return filteredIds;
    const discovery = new Set(
      data.places.filter((p) => isTravelRelevant(p.category)).map((p) => p.id),
    );
    return discovery.size > 0 ? discovery : filteredIds;
  }, [data, category, search, filteredIds]);

  // ── States ────────────────────────────────────────────────────────────────────

  const hasQuery = !!destination || !!coords;
  const showEmpty = !hasQuery && !isLocating;
  const showLoading = (hasQuery && isLoading) || isLocating;
  const showError = hasQuery && isError && !isLoading;
  // Distinguish "the destination itself couldn't be recognised" (geocoding
  // rejected it) from "the location was fine but the places provider failed".
  // Only the former is a genuine location problem; the latter is a service
  // hiccup and must NOT read as "location not found".
  const isNotFound = error instanceof NearbyError && error.kind === 'not_found';
  const showResults = !!data && !isError;
  // Geocoding succeeded and returned a real location, but the provider had no
  // usable nearby places for it — a distinct, honest state (not a filter issue).
  const showResolvedButEmpty = showResults && data.places.length === 0;
  // Whole-state search: the center is the state-polygon centroid, so a per-place
  // walk/drive ETA (which reads as "from you") is anchored to a point no traveller
  // stands at. Distances stay (the state banner already frames them); the ETA
  // chips are suppressed downstream. Point-like places and Near Me are unaffected.
  const isBroad = !!data && data.scope === 'state';

  return (
    <motion.div
      variants={rv(PAGE_VARIANTS, reduced)}
      initial="hidden"
      animate="show"
      exit="exit"
      className="flex flex-col gap-5 pb-10"
    >
      <PageHeader title="Explore" description="Find places anywhere" />

      {/* ── Search bar ──────────────────────────────────────────────────────── */}
      <ExplorerSearchBar
        value={input}
        onChange={setInput}
        onSearch={handleSearch}
        onRefresh={handleRefresh}
        onNearMe={() => void handleNearMe()}
        isLoading={isFetching}
        isLocating={isLocating}
        hasResults={!!data}
        location={data?.location}
      />

      {locationError && (
        <p className="text-xs text-muted-foreground" role="status">
          {locationError}
        </p>
      )}

      <AnimatePresence mode="wait">
        {/* ── Empty state ─────────────────────────────────────────────────── */}
        {showEmpty && (
          <motion.div
            key="empty"
            variants={rv(PAGE_VARIANTS, reduced)}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            <ExplorerEmptyState
              onExampleClick={handleExampleClick}
              onCategoryShortcut={handleCategoryShortcut}
            />
          </motion.div>
        )}

        {/* ── Skeleton ────────────────────────────────────────────────────── */}
        {showLoading && (
          <motion.div
            key="loading"
            variants={rv(PAGE_VARIANTS, reduced)}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            <ExplorerSkeleton />
          </motion.div>
        )}

        {/* ── Error ───────────────────────────────────────────────────────── */}
        {/* Two genuinely different failures, no longer collapsed into one
            message: the destination couldn't be recognised (isNotFound), or the
            place resolved but the provider failed (service issue). */}
        {showError && (
          <motion.div
            key="error"
            variants={rv(PAGE_VARIANTS, reduced)}
            initial="hidden"
            animate="show"
            exit="exit"
            className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border/60 py-20 text-center"
          >
            {isNotFound ? (
              <>
                <MapPinOff
                  className="h-10 w-10 text-muted-foreground opacity-40"
                  aria-hidden="true"
                />
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">Location not found</p>
                  <p className="text-sm text-muted-foreground">
                    Try a city, town, landmark, or destination in India — or use Near Me.
                  </p>
                </div>
              </>
            ) : (
              <>
                <ServerCrash
                  className="h-10 w-10 text-muted-foreground opacity-40"
                  aria-hidden="true"
                />
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">
                    Nearby places couldn't be loaded right now
                  </p>
                  <p className="text-sm text-muted-foreground">
                    This is a temporary issue with the places service, not a problem with your
                    destination. Please try again in a moment.
                  </p>
                </div>
              </>
            )}
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handleRefresh}>
                Try again
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => void handleNearMe()}
                className="gap-1.5"
              >
                <LocateFixed className="h-3.5 w-3.5" aria-hidden="true" />
                Near me
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── Resolved, but the provider had no nearby places ─────────────── */}
        {/* Distinct from both "location not found" and "filters exclude all":
            the location is real and shown, there just aren't usable nearby
            places in our data. Honest wording + real next actions (no invented
            POIs, no unrelated fallback imagery). */}
        {showResolvedButEmpty && (
          <motion.div
            key="resolved-empty"
            variants={rv(PAGE_VARIANTS, reduced)}
            initial="hidden"
            animate="show"
            exit="exit"
            className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border/60 py-16 text-center"
          >
            <Compass className="h-10 w-10 text-muted-foreground opacity-40" aria-hidden="true" />
            <div className="space-y-1">
              <p className="font-semibold text-foreground">
                We found {data.location.split(',')[0]}, but no nearby places yet
              </p>
              <p className="mx-auto max-w-md text-sm text-muted-foreground">
                <span className="text-foreground/80">{data.location}</span> — there aren't enough
                nearby places in our current data for this area. Try a larger nearby city, or search
                from your own location.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button asChild size="sm" variant="outline" className="gap-1.5">
                <Link to={`/hotels?destination=${encodeURIComponent(data.location)}`}>
                  <BedDouble className="h-3.5 w-3.5" aria-hidden="true" />
                  Search hotels in {data.location.split(',')[0]}
                </Link>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => void handleNearMe()}
                className="gap-1.5"
              >
                <LocateFixed className="h-3.5 w-3.5" aria-hidden="true" />
                Near me
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── Results ─────────────────────────────────────────────────────── */}
        {showResults && !showResolvedButEmpty && (
          <motion.div
            key="results"
            variants={rv(PAGE_VARIANTS, reduced)}
            initial="hidden"
            animate="show"
            exit="exit"
            className="flex flex-col gap-5"
          >
            {/* Whole-state scope notice. When the destination resolved to an
                entire Indian state, its coordinates are the state centroid, so
                these results are a broad, state-wide view rather than a tight
                "nearby" one. Reframe the results honestly and point the user at
                a narrower query — without changing the resolved coordinates or
                substituting a city (see geocoding-scope audit). */}
            {data.scope === 'state' && (
              <div
                role="status"
                className="flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/40 px-4 py-3"
              >
                <MapIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-foreground">
                    Exploring around {data.location.split(',')[0]}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    This is a whole-state destination. Search for a city or town for closer nearby
                    places.
                  </p>
                </div>
              </div>
            )}

            {/* Category bar */}
            <ExplorerCategoryBar
              active={category}
              onChange={(cat) => {
                setCategory(cat);
                setSelectedPlace(null);
              }}
              counts={counts}
              total={data.places.length}
            />

            {/* Discovery → hotels: search stays in this discovered place */}
            <Link
              to={`/hotels?destination=${encodeURIComponent(data.location)}`}
              className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3 transition-colors hover:bg-accent"
            >
              <span className="flex items-center gap-2.5 text-sm">
                <BedDouble className="h-4 w-4 text-primary" aria-hidden />
                <span className="font-medium text-foreground">
                  Search hotels in {data.location.split(',')[0]}
                </span>
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden />
            </Link>

            {/* Main workspace: list + map */}
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
              {/* ── Left column: AI panel + place list ────────────────────── */}
              <div className="flex flex-col gap-4 lg:w-96 lg:shrink-0">
                {/* AI insights panel */}
                <AIExplorerPanel
                  places={data.places}
                  location={data.location}
                  radiusM={data.radiusM}
                />

                {/* Place count label */}
                <p className="text-xs text-muted-foreground">
                  {filtered.length === 0
                    ? 'No places match your filters'
                    : `${filtered.length} place${filtered.length !== 1 ? 's' : ''}${category !== 'all' || search ? ' matching filters' : ` within ${(data.radiusM / 1000).toFixed(1)} km`}`}
                </p>

                {/* No results within filters */}
                {filtered.length === 0 && (
                  <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/60 py-10 text-center">
                    <p className="text-sm font-medium text-foreground">
                      No results match your filters
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setCategory('all');
                        setSearch('');
                      }}
                    >
                      Clear filters
                    </Button>
                  </div>
                )}

                {/* Place cards */}
                {filtered.length > 0 && (
                  <motion.div
                    variants={rv(LIST_VARIANTS, reduced)}
                    initial="hidden"
                    animate="show"
                    className="flex flex-col gap-2.5"
                  >
                    {filtered.map((place) => (
                      <motion.div key={place.id} variants={rv(LIST_ITEM_VARIANTS, reduced)}>
                        <NearbyPlaceCard
                          place={place}
                          isSelected={selectedPlace?.id === place.id}
                          isFavorite={isFavorite(place.id)}
                          onSelect={() => handlePlaceSelect(place)}
                          onFavorite={(e) => {
                            e.stopPropagation();
                            toggleFavorite(place.id);
                          }}
                          isBroad={isBroad}
                          staggered
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* ── Right column: Map + detail panel ──────────────────────── */}
              <div className="relative flex-1">
                {/* Map */}
                <InteractiveMap
                  centerLat={data.lat}
                  centerLon={data.lon}
                  radiusM={data.radiusM}
                  places={data.places}
                  filteredIds={mapVisibleIds}
                  selectedPlace={selectedPlace}
                  onPlaceSelect={handlePlaceSelect}
                  className="h-64 lg:sticky lg:top-20 lg:h-[calc(100vh-8rem)]"
                />

                {/* Floating detail panel — absolutely positioned inside map column */}
                <AnimatePresence>
                  {selectedPlace && (
                    <div className="absolute bottom-4 left-4 right-4 z-[1000]">
                      <PlaceDetailPanel
                        place={selectedPlace}
                        isFavorite={isFavorite(selectedPlace.id)}
                        onFavorite={() => toggleFavorite(selectedPlace.id)}
                        onClose={() => setSelectedPlace(null)}
                        isBroad={isBroad}
                      />
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
