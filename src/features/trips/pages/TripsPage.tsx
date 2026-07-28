import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { rv, PAGE_VARIANTS } from '@/lib/motion';
import { getTripStatus } from '@/utils/tripStatus';
import { ErrorState } from '@/components/shared/ErrorState';
import { AdventureHero } from '../components/AdventureHero';
import { TripGalleryCard } from '../components/TripGalleryCard';
import { TripTimelineRow } from '../components/TripTimelineRow';
import { TripsSkeleton } from '../components/TripsSkeleton';
import { TripsEmptyState } from '../components/TripsEmptyState';
import { TripCollections } from '../components/TripCollections';
import { TravelMemoriesPreview } from '../components/TravelMemoriesPreview';
import { useTrips } from '../hooks/useTrips';
import type { TripRow } from '../types';
import type { FilterStatus, SortKey, ViewMode } from '../types';

/* ── Sort helper ──────────────────────────────────────────────── */
function sortTrips(trips: TripRow[], sort: SortKey): TripRow[] {
  return [...trips].sort((a, b) => {
    switch (sort) {
      case 'date-asc':
        return a.start_date.localeCompare(b.start_date);
      case 'date-desc':
        return b.start_date.localeCompare(a.start_date);
      case 'created-desc':
        return b.created_at.localeCompare(a.created_at);
      case 'name-asc':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });
}

/* ── Grid stagger container ───────────────────────────────────── */
const GRID_CONTAINER = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};

/* ── Page ─────────────────────────────────────────────────────── */
export default function TripsPage() {
  const { data: trips, isLoading, isError, refetch } = useTrips();
  const reduced = useReducedMotion();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sort, setSort] = useState<SortKey>('date-asc');
  const [view, setView] = useState<ViewMode>('grid');

  const allTrips = useMemo(() => trips ?? [], [trips]);

  /* Filtered + sorted */
  const filtered = useMemo(() => {
    let result = allTrips;

    if (filterStatus === 'favourites') {
      result = result.filter((t) => t.is_favourite);
    } else if (filterStatus === 'upcoming') {
      result = result.filter((t) => getTripStatus(t) === 'upcoming');
    } else if (filterStatus !== 'all') {
      result = result.filter((t) => t.status === filterStatus);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (t) => t.title.toLowerCase().includes(q) || t.destination.toLowerCase().includes(q),
      );
    }

    return sortTrips(result, sort);
  }, [allTrips, filterStatus, search, sort]);

  const hasAnyTrips = allTrips.length > 0;
  const isFiltered = search.trim() !== '' || filterStatus !== 'all';

  function clearFilters() {
    setSearch('');
    setFilterStatus('all');
  }

  return (
    <motion.div
      className="relative space-y-10 pb-32"
      variants={rv(PAGE_VARIANTS, reduced)}
      initial="hidden"
      animate="show"
    >
      {/* ── Hero: title + stats + search + filters ─────────────── */}
      <AdventureHero
        trips={allTrips}
        query={search}
        onQueryChange={setSearch}
        filterStatus={filterStatus}
        onFilterChange={setFilterStatus}
        sortKey={sort}
        onSortChange={setSort}
        viewMode={view}
        onViewModeChange={setView}
        isLoading={isLoading}
      />

      {/* ── Content ─────────────────────────────────────────────── */}
      {isLoading ? (
        <TripsSkeleton view={view} />
      ) : isError ? (
        <ErrorState
          title="Couldn't load your trips"
          message="There was a problem fetching your trips. Check your connection and try again."
          onRetry={() => void refetch()}
        />
      ) : !hasAnyTrips ? (
        <TripsEmptyState hasTrips={false} />
      ) : filtered.length === 0 ? (
        <TripsEmptyState hasTrips={true} onClearFilters={isFiltered ? clearFilters : undefined} />
      ) : (
        <>
          {/* Result count */}
          <AnimatePresence mode="wait">
            <motion.p
              key={`${filterStatus}-${search}-${filtered.length}`}
              className="text-xs font-medium text-muted-foreground"
              initial={reduced ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {filtered.length} of {allTrips.length} trip{allTrips.length !== 1 ? 's' : ''}
              {isFiltered && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="ml-2 rounded text-primary underline-offset-2 hover:underline"
                >
                  Clear filters
                </button>
              )}
            </motion.p>
          </AnimatePresence>

          {/* Grid / List */}
          <AnimatePresence mode="wait">
            {view === 'grid' ? (
              <motion.div
                key="grid"
                className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
                variants={reduced ? undefined : GRID_CONTAINER}
                initial="hidden"
                animate="show"
                exit={reduced ? {} : { opacity: 0, transition: { duration: 0.18 } }}
              >
                <AnimatePresence>
                  {filtered.map((trip, i) => (
                    <TripGalleryCard key={trip.id} trip={trip} index={i} />
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                key="list"
                className="space-y-3"
                initial={reduced ? {} : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduced ? {} : { opacity: 0, transition: { duration: 0.18 } }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                <AnimatePresence>
                  {filtered.map((trip, i) => (
                    <TripTimelineRow key={trip.id} trip={trip} index={i} />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* ── Collections (only when there are trips) ────────────── */}
      {!isLoading && hasAnyTrips && !isFiltered && <TripCollections trips={allTrips} />}

      {/* ── Travel memories ────────────────────────────────────── */}
      {!isLoading && hasAnyTrips && !isFiltered && <TravelMemoriesPreview trips={allTrips} />}

      {/* ── FAB ────────────────────────────────────────────────── */}
      <motion.div
        className="fixed bottom-28 right-4 z-40 lg:bottom-6 lg:right-6"
        initial={reduced ? {} : { scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.35, type: 'spring', damping: 16, stiffness: 220 }}
      >
        <Link
          to="/trips/new"
          aria-label="Create new trip"
          className={[
            'group flex items-center gap-2.5 rounded-full bg-gradient-brand',
            'px-4 py-3 text-white shadow-glow',
            'transition-shadow duration-200 hover:shadow-[0_12px_40px_-8px_rgba(99,102,241,0.55)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          ].join(' ')}
        >
          <Plus className="h-5 w-5 shrink-0" />
          <span className="hidden max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold transition-all duration-300 group-hover:max-w-[80px] lg:block">
            New Trip
          </span>
        </Link>
      </motion.div>
    </motion.div>
  );
}
