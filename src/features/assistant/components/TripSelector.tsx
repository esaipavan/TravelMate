import { motion, useReducedMotion } from 'framer-motion';
import { MapPin, CalendarDays } from 'lucide-react';
import { rv, LIST_VARIANTS, LIST_ITEM_VARIANTS, HOVER, PRESS, rg } from '@/lib/motion';
import { getTripStatus } from '@/utils/tripStatus';
import { formatDateRange } from '@/utils/formatters';
import type { TripRow } from '@/features/trips/types';

interface Props {
  trips: TripRow[];
  selectedTripId: string | null;
  onSelect: (id: string) => void;
}

const STATUS_CHIP: Record<string, { label: string; cls: string }> = {
  active: { label: 'Active', cls: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' },
  upcoming: { label: 'Upcoming', cls: 'bg-blue-500/15    text-blue-600    dark:text-blue-400' },
  completed: { label: 'Completed', cls: 'bg-muted/60       text-muted-foreground' },
  cancelled: { label: 'Cancelled', cls: 'bg-rose-500/15    text-rose-600    dark:text-rose-400' },
};

function sortTrips(trips: TripRow[]): TripRow[] {
  const ORDER = { active: 0, upcoming: 1, completed: 2, cancelled: 3 };
  return [...trips].sort((a, b) => {
    const sa = getTripStatus(a);
    const sb = getTripStatus(b);
    if (ORDER[sa] !== ORDER[sb]) return ORDER[sa] - ORDER[sb];
    if (sa === 'upcoming') return a.start_date.localeCompare(b.start_date);
    return b.end_date.localeCompare(a.end_date);
  });
}

export function TripSelector({ trips, selectedTripId, onSelect }: Props) {
  const reduced = useReducedMotion();
  const sorted = sortTrips(trips);

  if (sorted.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
        Select a trip
      </p>
      <motion.div
        className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        variants={rv(LIST_VARIANTS, reduced)}
        initial="hidden"
        animate="show"
        role="listbox"
        aria-label="Trip selector"
      >
        {sorted.map((trip) => {
          const status = getTripStatus(trip);
          const chip = STATUS_CHIP[status] ?? STATUS_CHIP.upcoming;
          const selected = selectedTripId === trip.id;

          return (
            <motion.button
              key={trip.id}
              role="option"
              aria-selected={selected}
              onClick={() => onSelect(trip.id)}
              className={`flex w-44 shrink-0 flex-col gap-2.5 rounded-2xl border p-3.5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 ${
                selected
                  ? 'border-primary/40 bg-primary/5 shadow-sm shadow-primary/10'
                  : 'border-border/50 bg-card hover:border-primary/20 hover:bg-muted/30'
              }`}
              variants={rv(LIST_ITEM_VARIANTS, reduced)}
              whileHover={rg(HOVER.lift, reduced)}
              whileTap={rg(PRESS.subtle, reduced)}
            >
              <div className="flex items-start justify-between gap-1.5">
                <p className="line-clamp-2 text-xs font-semibold leading-tight text-foreground">
                  {trip.title}
                </p>
                {selected && (
                  <span
                    className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                    aria-hidden
                  />
                )}
              </div>

              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <MapPin className="h-2.5 w-2.5 shrink-0" aria-hidden />
                <span className="truncate">{trip.destination}</span>
              </div>

              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <CalendarDays className="h-2.5 w-2.5 shrink-0" aria-hidden />
                <span className="truncate">{formatDateRange(trip.start_date, trip.end_date)}</span>
              </div>

              <span
                className={`self-start rounded-full px-2 py-0.5 text-[10px] font-semibold ${chip.cls}`}
              >
                {chip.label}
              </span>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
