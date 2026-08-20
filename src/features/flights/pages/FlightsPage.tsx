import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Plane, Trash2, ArrowUpDown, X, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { BookingStatusBadge } from '@/components/shared/BookingStatusBadge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { rv, PAGE_VARIANTS, LIST_VARIANTS, LIST_ITEM_VARIANTS } from '@/lib/motion';
import { formatCurrency } from '@/utils/formatters';
import { FlightSearchBar } from '../components/FlightSearchBar';
import { FlightCard } from '../components/FlightCard';
import { FlightReviewDialog } from '../components/FlightReviewDialog';
import { useFlightSearch } from '../hooks/useFlightSearch';
import { useBookings } from '@/features/hotels/hooks/useBookings';
import { FLIGHT_CABIN_LABEL } from '../types';
import type { Flight, FlightCabin, FlightSearchParams } from '../types';

type SortKey = 'recommended' | 'price-asc' | 'price-desc' | 'fastest' | 'stops';
const MAX_COMPARE = 3;

export default function FlightsPage() {
  const reduced = useReducedMotion();
  const [searchParams] = useSearchParams();

  const [from, setFrom] = useState(searchParams.get('from') ?? '');
  const [to, setTo] = useState(searchParams.get('to') ?? '');
  const [date, setDate] = useState('');
  const [cabin, setCabin] = useState<FlightCabin>('economy');
  const [submitted, setSubmitted] = useState<FlightSearchParams | null>(null);
  const [sort, setSort] = useState<SortKey>('recommended');
  const [compareIds, setCompareIds] = useState<Set<string>>(new Set());
  const [reviewFlight, setReviewFlight] = useState<Flight | null>(null);

  const { drafts: allDrafts, removeDraft } = useBookings();
  const drafts = useMemo(() => allDrafts.filter((d) => d.mode === 'flight'), [allDrafts]);

  const { data: flights = [], isLoading, isFetching, isError } = useFlightSearch(submitted);

  useEffect(() => {
    setCompareIds((prev) => {
      const ids = new Set(flights.map((f) => f.id));
      const next = new Set([...prev].filter((id) => ids.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [flights]);

  function handleSearch() {
    if (!from.trim() || !to.trim()) return;
    setCompareIds(new Set());
    setSubmitted({ from: from.trim(), to: to.trim(), date: date || undefined, cabin });
  }

  const sorted = useMemo(() => {
    const list = [...flights];
    switch (sort) {
      case 'price-asc':
        return list.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return list.sort((a, b) => b.price - a.price);
      case 'fastest':
        return list.sort((a, b) => a.durationMin - b.durationMin);
      case 'stops':
        return list.sort((a, b) => a.stops - b.stops);
      default:
        return list;
    }
  }, [flights, sort]);

  const compareFlights = useMemo(
    () => flights.filter((f) => compareIds.has(f.id)),
    [flights, compareIds],
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
      <PageHeader title="Flights" description="Search, compare and save flights for your trip." />

      <Tabs defaultValue="search">
        <TabsList>
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="saved">
            Saved{drafts.length > 0 ? ` (${drafts.length})` : ''}
          </TabsTrigger>
        </TabsList>

        {/* ── Search & results ─────────────────────────────────────────── */}
        <TabsContent value="search" className="mt-4 flex flex-col gap-5 focus-visible:outline-none">
          <FlightSearchBar
            from={from}
            to={to}
            date={date}
            cabin={cabin}
            onFromChange={setFrom}
            onToChange={setTo}
            onDateChange={setDate}
            onCabinChange={setCabin}
            onSearch={handleSearch}
            isLoading={isFetching}
          />

          {!hasSearched && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/60 py-20 text-center">
              <Plane className="h-10 w-10 text-muted-foreground opacity-40" aria-hidden />
              <div className="space-y-1">
                <p className="font-semibold text-foreground">Find a flight</p>
                <p className="text-sm text-muted-foreground">
                  Enter where you&apos;re flying from and to.
                </p>
              </div>
            </div>
          )}

          {hasSearched && isLoading && (
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-2xl" />
              ))}
            </div>
          )}

          {hasSearched && isError && !isLoading && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/60 py-16 text-center">
              <p className="text-sm text-muted-foreground">
                Couldn&apos;t load flights for that route. Try again.
              </p>
              <Button variant="outline" size="sm" onClick={handleSearch}>
                Try again
              </Button>
            </div>
          )}

          {hasSearched && !isLoading && !isError && sorted.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  {sorted.length} flights
                  <span className="inline-flex items-center gap-1 font-medium text-foreground">
                    {submitted?.from.split(',')[0]}
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    {submitted?.to.split(',')[0]}
                  </span>
                </p>
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ArrowUpDown className="h-3.5 w-3.5" aria-hidden />
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortKey)}
                    aria-label="Sort flights"
                    className="rounded-md border border-border/60 bg-card px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <option value="recommended">Recommended</option>
                    <option value="price-asc">Price: low to high</option>
                    <option value="price-desc">Price: high to low</option>
                    <option value="fastest">Fastest</option>
                    <option value="stops">Fewest stops</option>
                  </select>
                </label>
              </div>

              <motion.div
                variants={rv(LIST_VARIANTS, reduced)}
                initial="hidden"
                animate="show"
                className="grid gap-4 sm:grid-cols-2"
              >
                {sorted.map((flight) => (
                  <motion.div key={flight.id} variants={rv(LIST_ITEM_VARIANTS, reduced)}>
                    <FlightCard
                      flight={flight}
                      selectedForCompare={compareIds.has(flight.id)}
                      onToggleCompare={() => toggleCompare(flight.id)}
                      onSelect={() => setReviewFlight(flight)}
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
              <Plane className="h-10 w-10 text-muted-foreground opacity-40" aria-hidden />
              <p className="text-sm text-muted-foreground">
                No saved flights yet. Select a flight to save a draft.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {drafts.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <Plane className="h-5 w-5 text-primary/70" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-foreground">{d.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{d.subtitle}</p>
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
      {compareFlights.length >= 2 && (
        <motion.div
          initial={reduced ? {} : { y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 p-3 backdrop-blur-sm lg:left-64"
        >
          <div className="mx-auto flex max-w-6xl items-stretch gap-3 overflow-x-auto">
            <div className="flex shrink-0 items-center gap-1.5 pr-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Compare
            </div>
            {compareFlights.map((f) => (
              <div
                key={f.id}
                className="flex min-w-[190px] flex-1 items-center justify-between gap-2 rounded-xl border border-border/60 bg-card px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{f.airline}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {f.departTime}–{f.arriveTime} · {FLIGHT_CABIN_LABEL[f.cabin]} ·{' '}
                    {formatCurrency(f.price, f.currency)}
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 shrink-0"
                  onClick={() => toggleCompare(f.id)}
                  aria-label={`Remove ${f.airline} ${f.flightNumber} from compare`}
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
      <FlightReviewDialog
        flight={reviewFlight}
        date={date}
        passengers={1}
        defaultTripId={searchParams.get('tripId')}
        onOpenChange={(open) => {
          if (!open) setReviewFlight(null);
        }}
        onSaved={() => undefined}
      />
    </motion.div>
  );
}
