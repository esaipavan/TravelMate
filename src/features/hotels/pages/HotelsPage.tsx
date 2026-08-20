import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { BedDouble, Hotel as HotelIcon, Trash2, ArrowUpDown, Star, X } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { BookingStatusBadge } from '@/components/shared/BookingStatusBadge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { rv, PAGE_VARIANTS, LIST_VARIANTS, LIST_ITEM_VARIANTS } from '@/lib/motion';
import { formatCurrency } from '@/utils/formatters';
import { usePlaceImage } from '@/hooks/usePlaceImage';
import { resolveDestinationTheme } from '@/utils/destinationTheme';
import { HotelSearchBar } from '../components/HotelSearchBar';
import { HotelCard } from '../components/HotelCard';
import { BookingReviewDialog } from '../components/BookingReviewDialog';
import { useHotelSearch } from '../hooks/useHotelSearch';
import { useBookings } from '../hooks/useBookings';
import type { Hotel, HotelSearchParams } from '../types';

type SortKey = 'recommended' | 'price-asc' | 'price-desc' | 'rating';
const MAX_COMPARE = 3;

export default function HotelsPage() {
  const reduced = useReducedMotion();
  const [searchParams] = useSearchParams();

  const [input, setInput] = useState(searchParams.get('destination') ?? '');
  const [guests, setGuests] = useState(2);
  const [submitted, setSubmitted] = useState<HotelSearchParams | null>(
    searchParams.get('destination')
      ? { destination: searchParams.get('destination')!, guests: 2 }
      : null,
  );
  const [sort, setSort] = useState<SortKey>('recommended');
  const [compareIds, setCompareIds] = useState<Set<string>>(new Set());
  const [reviewHotel, setReviewHotel] = useState<Hotel | null>(null);

  const { drafts: allDrafts, removeDraft } = useBookings();
  const drafts = useMemo(() => allDrafts.filter((d) => d.mode === 'hotel'), [allDrafts]);

  const { data: hotels = [], isLoading, isFetching, isError } = useHotelSearch(submitted);

  // Honest destination hero image (real Wikipedia photo when recognised, else gradient).
  const heroDest = submitted?.destination ?? '';
  const { imageUrl: heroImage } = usePlaceImage(heroDest, { enabled: !!heroDest });

  // Keep compare selection in sync with the current result set.
  useEffect(() => {
    setCompareIds((prev) => {
      const ids = new Set(hotels.map((h) => h.id));
      const next = new Set([...prev].filter((id) => ids.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [hotels]);

  function handleSearch() {
    const destination = input.trim();
    if (!destination) return;
    setCompareIds(new Set());
    setSubmitted({ destination, guests });
  }

  const sorted = useMemo(() => {
    const list = [...hotels];
    switch (sort) {
      case 'price-asc':
        return list.sort((a, b) => a.pricePerNight - b.pricePerNight);
      case 'price-desc':
        return list.sort((a, b) => b.pricePerNight - a.pricePerNight);
      case 'rating':
        return list.sort((a, b) => b.rating - a.rating);
      default:
        return list;
    }
  }, [hotels, sort]);

  const compareHotels = useMemo(
    () => hotels.filter((h) => compareIds.has(h.id)),
    [hotels, compareIds],
  );

  function toggleCompare(id: string) {
    setCompareIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < MAX_COMPARE) next.add(id);
      return next;
    });
  }

  const hasSearched = !!submitted;

  return (
    <motion.div
      variants={rv(PAGE_VARIANTS, reduced)}
      initial="hidden"
      animate="show"
      exit="exit"
      className="flex flex-col gap-5 pb-28"
    >
      <PageHeader
        title="Hotels"
        description="Search, compare and save stays — all inside your trip."
      />

      <Tabs defaultValue="search">
        <TabsList>
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="saved">
            Saved{drafts.length > 0 ? ` (${drafts.length})` : ''}
          </TabsTrigger>
        </TabsList>

        {/* ── Search & results ─────────────────────────────────────────── */}
        <TabsContent value="search" className="mt-4 flex flex-col gap-5 focus-visible:outline-none">
          <HotelSearchBar
            value={input}
            onChange={setInput}
            guests={guests}
            onGuestsChange={setGuests}
            onSearch={handleSearch}
            isLoading={isFetching}
          />

          {/* Destination hero — honest imagery (real photo when recognised) */}
          {hasSearched && (
            <div className="relative h-32 overflow-hidden rounded-2xl">
              {heroImage ? (
                <img src={heroImage} alt={heroDest} className="h-full w-full object-cover" />
              ) : (
                <div
                  className="h-full w-full"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(99,102,241,0.55) 0%, rgba(139,92,246,0.4) 100%)',
                  }}
                  role="img"
                  aria-label={heroDest}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <p className="absolute bottom-3 left-4 text-lg font-bold text-white">
                Stays in {heroDest.split(',')[0]}
              </p>
            </div>
          )}

          {/* Empty (no search yet) */}
          {!hasSearched && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/60 py-20 text-center">
              <HotelIcon className="h-10 w-10 text-muted-foreground opacity-40" aria-hidden />
              <div className="space-y-1">
                <p className="font-semibold text-foreground">Find your stay</p>
                <p className="text-sm text-muted-foreground">
                  Search any city, area, or a place you discovered.
                </p>
              </div>
            </div>
          )}

          {/* Loading */}
          {hasSearched && isLoading && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-2xl" />
              ))}
            </div>
          )}

          {/* Error */}
          {hasSearched && isError && !isLoading && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/60 py-16 text-center">
              <p className="text-sm text-muted-foreground">
                Couldn&apos;t load hotels for that place. Try another destination.
              </p>
              <Button variant="outline" size="sm" onClick={handleSearch}>
                Try again
              </Button>
            </div>
          )}

          {/* Results */}
          {hasSearched && !isLoading && !isError && sorted.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {sorted.length} stays in {heroDest.split(',')[0]}
                </p>
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ArrowUpDown className="h-3.5 w-3.5" aria-hidden />
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortKey)}
                    aria-label="Sort hotels"
                    className="rounded-md border border-border/60 bg-card px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <option value="recommended">Recommended</option>
                    <option value="price-asc">Price: low to high</option>
                    <option value="price-desc">Price: high to low</option>
                    <option value="rating">Top rated</option>
                  </select>
                </label>
              </div>

              <motion.div
                variants={rv(LIST_VARIANTS, reduced)}
                initial="hidden"
                animate="show"
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                {sorted.map((hotel) => (
                  <motion.div key={hotel.id} variants={rv(LIST_ITEM_VARIANTS, reduced)}>
                    <HotelCard
                      hotel={hotel}
                      selectedForCompare={compareIds.has(hotel.id)}
                      onToggleCompare={() => toggleCompare(hotel.id)}
                      onSelect={() => setReviewHotel(hotel)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}
        </TabsContent>

        {/* ── Saved drafts ─────────────────────────────────────────────── */}
        <TabsContent value="saved" className="mt-4 focus-visible:outline-none">
          {drafts.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/60 py-20 text-center">
              <BedDouble className="h-10 w-10 text-muted-foreground opacity-40" aria-hidden />
              <p className="text-sm text-muted-foreground">
                No saved bookings yet. Select a hotel to save a draft.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {drafts.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4"
                >
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                    style={{
                      background: `linear-gradient(135deg, ${resolveDestinationTheme(d.destination).accent}40 0%, ${resolveDestinationTheme(d.destination).secondary}22 100%)`,
                    }}
                  >
                    <BedDouble className="h-5 w-5 text-foreground/40" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-foreground">{d.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {d.destination.split(',')[0]} · {d.subtitle}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-bold tabular-nums text-foreground">
                      {formatCurrency(d.total, d.currency)}
                    </p>
                    <BookingStatusBadge status={d.status} />
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 shrink-0 text-muted-foreground"
                    onClick={() => void removeDraft(d.id)}
                    aria-label={`Remove ${d.title}`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ── Compare tray ─────────────────────────────────────────────────── */}
      {compareHotels.length >= 2 && (
        <motion.div
          initial={reduced ? {} : { y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 p-3 backdrop-blur-sm lg:left-64"
        >
          <div className="mx-auto flex max-w-6xl items-stretch gap-3 overflow-x-auto">
            <div className="flex shrink-0 items-center gap-1.5 pr-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Compare
            </div>
            {compareHotels.map((h) => (
              <div
                key={h.id}
                className="flex min-w-[180px] flex-1 items-center justify-between gap-2 rounded-xl border border-border/60 bg-card px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{h.name}</p>
                  <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Star className="h-2.5 w-2.5 fill-current text-amber-500" aria-hidden />
                    {h.rating.toFixed(1)} · {formatCurrency(h.pricePerNight, h.currency)}/night
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 shrink-0"
                  onClick={() => toggleCompare(h.id)}
                  aria-label={`Remove ${h.name} from compare`}
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                </Button>
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 self-center"
              onClick={() => setCompareIds(new Set())}
            >
              Clear
            </Button>
          </div>
        </motion.div>
      )}

      {/* ── Booking review dialog ───────────────────────────────────────── */}
      <BookingReviewDialog
        hotel={reviewHotel}
        checkIn=""
        checkOut=""
        guests={guests}
        defaultTripId={searchParams.get('tripId')}
        onOpenChange={(open) => {
          if (!open) setReviewHotel(null);
        }}
        onSaved={() => undefined}
      />
    </motion.div>
  );
}
