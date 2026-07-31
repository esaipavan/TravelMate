import { motion, useReducedMotion } from 'framer-motion';
import {
  Map,
  Zap,
  Loader2,
  AlertTriangle,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { rv, LIST_VARIANTS, LIST_ITEM_VARIANTS, FADE_VARIANTS } from '@/lib/motion';
import { formatDate } from '@/utils/formatters';
import { useItineraryOptimizer } from '../hooks/useItineraryOptimizer';
import type { TripRow } from '@/features/trips/types';

const CATEGORY_EMOJI: Record<string, string> = {
  flight: '✈️',
  accommodation: '🏨',
  activity: '🎯',
  dining: '🍽️',
  transport: '🚌',
  shopping: '🛍️',
  sightseeing: '🏛️',
  other: '📌',
};

interface Props {
  trip: TripRow;
}

export function ItineraryOptimizer({ trip }: Props) {
  const reduced = useReducedMotion();
  const { days, selectedDayIndex, setSelectedDayIndex, optimize, result, isOptimizing, isLoading } =
    useItineraryOptimizer(trip);

  if (isLoading) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Loading itinerary optimizer">
        <Skeleton className="h-12 rounded-xl" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  if (days.length === 0) {
    return (
      <motion.div
        className="flex flex-col items-center gap-4 py-16 text-center"
        variants={rv(FADE_VARIANTS, reduced)}
        initial="hidden"
        animate="show"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
          <Map className="h-7 w-7 text-muted-foreground" aria-hidden />
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-foreground">No itinerary yet</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Add activities to your trip itinerary to use the AI optimizer.
          </p>
        </div>
      </motion.div>
    );
  }

  const selectedDay = days[selectedDayIndex];

  return (
    <motion.div
      className="space-y-5"
      variants={rv(LIST_VARIANTS, reduced)}
      initial="hidden"
      animate="show"
    >
      {/* Day selector */}
      <motion.div variants={rv(LIST_ITEM_VARIANTS, reduced)} className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Select Day
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedDayIndex(Math.max(0, selectedDayIndex - 1))}
            disabled={selectedDayIndex === 0}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-card text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
            aria-label="Previous day"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>
          <div className="min-w-0 flex-1 rounded-xl border border-border/50 bg-card px-4 py-2.5 text-center">
            <p className="font-semibold text-foreground">
              {selectedDay ? formatDate(selectedDay.date, 'EEEE, MMM d') : '—'}
            </p>
            {selectedDay && (
              <p className="text-xs text-muted-foreground">
                Day {selectedDayIndex + 1} of {days.length} · {selectedDay.items.length} activities
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setSelectedDayIndex(Math.min(days.length - 1, selectedDayIndex + 1))}
            disabled={selectedDayIndex >= days.length - 1}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-card text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
            aria-label="Next day"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </motion.div>

      {/* Activities for selected day */}
      {selectedDay && (
        <motion.div variants={rv(LIST_ITEM_VARIANTS, reduced)} className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Activities
          </p>
          {selectedDay.items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/50 py-8 text-center text-sm text-muted-foreground">
              No activities planned for this day.
            </div>
          ) : (
            <div className="space-y-2">
              {[...selectedDay.items]
                .sort((a, b) => (a.start_time ?? '').localeCompare(b.start_time ?? ''))
                .map((item, i) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 rounded-xl border border-border/40 bg-card px-3 py-2.5"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm" aria-hidden>
                          {CATEGORY_EMOJI[item.category] ?? '📌'}
                        </span>
                        <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                      </div>
                      {item.location_name && (
                        <p className="ml-6 truncate text-xs text-muted-foreground">
                          {item.location_name}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 font-mono text-xs text-muted-foreground">
                      {item.start_time ? item.start_time.slice(0, 5) : '—'}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Optimize button */}
      <motion.div variants={rv(LIST_ITEM_VARIANTS, reduced)}>
        <Button
          onClick={optimize}
          disabled={isOptimizing || !selectedDay || selectedDay.items.length === 0}
          className="w-full gap-2"
          aria-busy={isOptimizing}
        >
          {isOptimizing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Optimizing your day…
            </>
          ) : (
            <>
              <Zap className="h-4 w-4" aria-hidden />
              Optimise This Day with AI
            </>
          )}
        </Button>
      </motion.div>

      {/* Results */}
      {result && (
        <motion.div
          className="space-y-4"
          variants={rv(LIST_VARIANTS, reduced)}
          initial="hidden"
          animate="show"
        >
          {result.warnings.length > 0 && (
            <motion.div variants={rv(LIST_ITEM_VARIANTS, reduced)} className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Warnings
              </p>
              {result.warnings.map((w, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3"
                >
                  <AlertTriangle
                    className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400"
                    aria-hidden
                  />
                  <p className="text-sm text-foreground">{w}</p>
                </div>
              ))}
            </motion.div>
          )}

          {result.reorderHint && (
            <motion.div
              variants={rv(LIST_ITEM_VARIANTS, reduced)}
              className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3"
            >
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-primary/70">
                Order Recommendation
              </p>
              <p className="text-sm text-foreground">{result.reorderHint}</p>
            </motion.div>
          )}

          {result.suggestions.length > 0 && (
            <motion.div variants={rv(LIST_ITEM_VARIANTS, reduced)} className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Suggestions
              </p>
              {result.suggestions.map((s, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex items-start gap-2.5 rounded-xl border border-border/50 bg-card px-4 py-3',
                  )}
                >
                  <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  <p className="text-sm text-foreground">{s}</p>
                </div>
              ))}
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
