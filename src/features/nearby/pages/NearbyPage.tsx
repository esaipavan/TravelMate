import { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { MapPinOff } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { rv, PAGE_VARIANTS, LIST_VARIANTS, LIST_ITEM_VARIANTS } from '@/lib/motion';
import { useNearbyPlaces } from '../hooks/useNearby';
import { useFavorites } from '../hooks/useFavorites';
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
  const [category, setCategory] = useState<PlaceCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<NearbyPlace | null>(null);

  const qc = useQueryClient();
  const reduced = useReducedMotion();
  const { isFavorite, toggleFavorite } = useFavorites();

  const { data, isLoading, isError, isFetching } = useNearbyPlaces(destination);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  function handleSearch() {
    const q = input.trim();
    if (!q) return;
    setSearch('');
    setCategory('all');
    setSelectedPlace(null);
    if (q === destination) {
      void qc.invalidateQueries({ queryKey: ['nearby', destination] });
    } else {
      setDestination(q);
    }
  }

  function handleRefresh() {
    setSelectedPlace(null);
    void qc.invalidateQueries({ queryKey: ['nearby', destination] });
  }

  function handleExampleClick(dest: string) {
    setInput(dest);
    setDestination(dest);
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

  // ── States ────────────────────────────────────────────────────────────────────

  const showEmpty = !destination;
  const showLoading = destination && isLoading;
  const showError = destination && isError && !isLoading;
  const showResults = !!data && !isError;

  return (
    <motion.div
      variants={rv(PAGE_VARIANTS, reduced)}
      initial="hidden"
      animate="show"
      exit="exit"
      className="flex flex-col gap-5 pb-10"
    >
      {/* ── Search bar ──────────────────────────────────────────────────────── */}
      <ExplorerSearchBar
        value={input}
        onChange={setInput}
        onSearch={handleSearch}
        onRefresh={handleRefresh}
        isLoading={isFetching}
        hasResults={!!data}
        location={data?.location}
      />

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
            <ExplorerEmptyState onExampleClick={handleExampleClick} />
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
        {showError && (
          <motion.div
            key="error"
            variants={rv(PAGE_VARIANTS, reduced)}
            initial="hidden"
            animate="show"
            exit="exit"
            className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border/60 py-20 text-center"
          >
            <MapPinOff className="h-10 w-10 text-muted-foreground opacity-40" aria-hidden="true" />
            <div className="space-y-1">
              <p className="font-semibold text-foreground">Could not load nearby places</p>
              <p className="text-sm text-muted-foreground">
                Check the destination name and try again.
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={handleRefresh}>
              Try again
            </Button>
          </motion.div>
        )}

        {/* ── Results ─────────────────────────────────────────────────────── */}
        {showResults && (
          <motion.div
            key="results"
            variants={rv(PAGE_VARIANTS, reduced)}
            initial="hidden"
            animate="show"
            exit="exit"
            className="flex flex-col gap-5"
          >
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
                  filteredIds={filteredIds}
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
