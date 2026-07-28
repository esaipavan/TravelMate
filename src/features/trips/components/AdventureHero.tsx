import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  Plus,
  Search,
  SlidersHorizontal,
  X,
  LayoutGrid,
  List,
  Globe2,
  Star,
  PlaneTakeoff,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { rv, rg, CARD_VARIANTS, LIST_VARIANTS, LIST_ITEM_VARIANTS, PRESS } from '@/lib/motion';
import { getTripStatus } from '@/utils/tripStatus';
import { useAnimatedCounter } from '@/features/dashboard/hooks/useAnimatedCounter';
import type { TripRow } from '../types';
import type { FilterStatus, SortKey, ViewMode } from '../types';

const FILTERS: Array<{ value: FilterStatus; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'active', label: '🔴 Live' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'planning', label: 'Planning' },
  { value: 'completed', label: 'Done' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'favourites', label: '♥ Saved' },
];

interface Props {
  trips: TripRow[];
  query: string;
  onQueryChange: (q: string) => void;
  filterStatus: FilterStatus;
  onFilterChange: (f: FilterStatus) => void;
  sortKey: SortKey;
  onSortChange: (s: SortKey) => void;
  viewMode: ViewMode;
  onViewModeChange: (m: ViewMode) => void;
  isLoading: boolean;
}

function StatTile({
  value,
  label,
  icon: Icon,
  color,
  delay,
  reduced,
}: {
  value: number;
  label: string;
  icon: typeof Globe2;
  color: string;
  delay: number;
  reduced: boolean | null;
}) {
  const count = useAnimatedCounter(value, 900, delay);
  return (
    <motion.div className="flex items-center gap-2.5" variants={rv(LIST_ITEM_VARIANTS, reduced)}>
      <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-xl', color)}>
        <Icon className="h-4 w-4" aria-hidden="true" />
      </div>
      <div>
        <div className="text-lg font-bold tabular-nums leading-none text-foreground">{count}</div>
        <div className="mt-0.5 text-[10px] text-muted-foreground">{label}</div>
      </div>
    </motion.div>
  );
}

interface FilterChipProps {
  filter: (typeof FILTERS)[number];
  count: number;
  active: boolean;
  onClick: () => void;
  reduced: boolean | null;
}

function FilterChip({ filter, count, active, onClick, reduced }: FilterChipProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={rg(PRESS.subtle, reduced)}
      className={cn(
        'flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-medium outline-none transition-colors',
        'focus-visible:ring-2 focus-visible:ring-primary',
        active
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
      aria-pressed={active}
    >
      {filter.label}
      {count > 0 && (
        <span
          className={cn(
            'rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums leading-none',
            active ? 'bg-white/25 text-white' : 'bg-muted text-muted-foreground',
          )}
        >
          {count}
        </span>
      )}
    </motion.button>
  );
}

export function AdventureHero({
  trips,
  query,
  onQueryChange,
  filterStatus,
  onFilterChange,
  sortKey,
  onSortChange,
  viewMode,
  onViewModeChange,
  isLoading,
}: Props) {
  const reduced = useReducedMotion();

  const stats = useMemo(
    () => ({
      total: trips.length,
      active: trips.filter((t) => getTripStatus(t) === 'active').length,
      destinations: new Set(trips.map((t) => t.destination.split(',')[0].trim().toLowerCase()))
        .size,
      favourites: trips.filter((t) => t.is_favourite).length,
    }),
    [trips],
  );

  const counts = useMemo(() => {
    const base: Record<string, number> = {
      all: trips.length,
      favourites: 0,
      upcoming: 0,
      active: 0,
      planning: 0,
      completed: 0,
      cancelled: 0,
    };
    for (const t of trips) {
      const s = getTripStatus(t);
      if (s in base) base[s]++;
      if (t.status in base) base[t.status]++;
      if (t.is_favourite) base['favourites']++;
    }
    return base;
  }, [trips]);

  return (
    <motion.div
      className="mb-6 space-y-6"
      variants={rv(CARD_VARIANTS, reduced)}
      initial="hidden"
      animate="show"
    >
      {/* Title row */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <motion.h1
            className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
            initial={reduced ? {} : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            My Adventures
          </motion.h1>
          <motion.p
            className="mt-1 text-sm text-muted-foreground"
            initial={reduced ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.12, duration: 0.35 }}
          >
            {isLoading
              ? 'Loading your trips…'
              : `${trips.length} trip${trips.length !== 1 ? 's' : ''} · Plan, track and relive every journey`}
          </motion.p>
        </div>

        <motion.div
          initial={reduced ? {} : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', damping: 18, stiffness: 220 }}
          className="hidden shrink-0 sm:block"
        >
          <Button asChild className="border-0 bg-gradient-brand text-white shadow-glow">
            <Link to="/trips/new">
              <Plus className="mr-2 h-4 w-4" />
              New Trip
            </Link>
          </Button>
        </motion.div>
      </div>

      {/* Stats row */}
      {!isLoading && trips.length > 0 && (
        <motion.div
          className="scrollbar-none flex items-center gap-6 overflow-x-auto pb-1"
          variants={rv(LIST_VARIANTS, reduced)}
          initial="hidden"
          animate="show"
        >
          <StatTile
            value={stats.total}
            label="Total Trips"
            icon={PlaneTakeoff}
            color="bg-violet-500/10 text-violet-500"
            delay={0}
            reduced={reduced}
          />
          <div className="h-8 w-px shrink-0 bg-border/50" aria-hidden="true" />
          <StatTile
            value={stats.active}
            label="Live Now"
            icon={Zap}
            color="bg-emerald-500/10 text-emerald-500"
            delay={80}
            reduced={reduced}
          />
          <div className="h-8 w-px shrink-0 bg-border/50" aria-hidden="true" />
          <StatTile
            value={stats.destinations}
            label="Destinations"
            icon={Globe2}
            color="bg-blue-500/10 text-blue-500"
            delay={160}
            reduced={reduced}
          />
          <div className="h-8 w-px shrink-0 bg-border/50" aria-hidden="true" />
          <StatTile
            value={stats.favourites}
            label="Saved"
            icon={Star}
            color="bg-amber-500/10 text-amber-500"
            delay={240}
            reduced={reduced}
          />
        </motion.div>
      )}

      {/* Controls */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              placeholder="Search trips…"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              className="rounded-xl border-border/50 bg-muted/30 pl-9 pr-9 focus-visible:border-primary/60 focus-visible:ring-0"
              aria-label="Search trips"
            />
            <AnimatePresence>
              {query && (
                <motion.button
                  type="button"
                  onClick={() => onQueryChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:text-foreground"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.15 }}
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Sort */}
          <Select value={sortKey} onValueChange={(v) => onSortChange(v as SortKey)}>
            <SelectTrigger
              className="hidden w-[152px] rounded-xl border-border/50 bg-muted/30 sm:flex"
              aria-label="Sort trips"
            >
              <SlidersHorizontal className="mr-2 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-asc">Upcoming first</SelectItem>
              <SelectItem value="date-desc">Latest first</SelectItem>
              <SelectItem value="created-desc">Newest added</SelectItem>
              <SelectItem value="name-asc">Name A–Z</SelectItem>
            </SelectContent>
          </Select>

          {/* View toggle */}
          <div className="flex rounded-full bg-muted/60 p-0.5" role="group" aria-label="View mode">
            {(
              [
                ['grid', LayoutGrid],
                ['list', List],
              ] as const
            ).map(([v, Icon]) => (
              <button
                key={v}
                type="button"
                onClick={() => onViewModeChange(v)}
                aria-pressed={viewMode === v}
                aria-label={`${v} view`}
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full transition-colors',
                  viewMode === v
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>
        </div>

        {/* Filter chips */}
        <div
          className="scrollbar-none flex gap-2 overflow-x-auto pb-1"
          role="group"
          aria-label="Filter by status"
        >
          {FILTERS.map((f) => (
            <FilterChip
              key={f.value}
              filter={f}
              count={counts[f.value] ?? 0}
              active={filterStatus === f.value}
              onClick={() => onFilterChange(f.value)}
              reduced={reduced}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
