import { motion, useReducedMotion } from 'framer-motion';
import { Utensils, Coffee, Sun, Moon, MapPin, Loader2, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { rv, LIST_VARIANTS, LIST_ITEM_VARIANTS, FADE_VARIANTS } from '@/lib/motion';
import { formatDistance } from '@/features/nearby/types';
import { useFoodGuide } from '../hooks/useFoodGuide';
import type { TripRow } from '@/features/trips/types';
import type { MealTime } from '../hooks/useFoodGuide';

const MEAL_TABS: {
  value: MealTime;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { value: 'breakfast', label: 'Breakfast', icon: Coffee },
  { value: 'lunch', label: 'Lunch', icon: Sun },
  { value: 'dinner', label: 'Dinner', icon: Moon },
];

const PRICE_COLOR: Record<string, string> = {
  $: 'text-emerald-600 dark:text-emerald-400',
  $$: 'text-amber-600 dark:text-amber-400',
  $$$: 'text-rose-600 dark:text-rose-400',
};

interface Props {
  trip: TripRow;
}

export function FoodGuide({ trip }: Props) {
  const reduced = useReducedMotion();
  const { restaurants, foodIntel, suggestions, mealTime, setMealTime, isLoading, isAILoading } =
    useFoodGuide(trip);

  if (isLoading) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Loading food guide">
        <Skeleton className="h-10 rounded-xl" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-5"
      variants={rv(LIST_VARIANTS, reduced)}
      initial="hidden"
      animate="show"
    >
      {/* Meal time selector */}
      <motion.div variants={rv(LIST_ITEM_VARIANTS, reduced)}>
        <div
          className="flex rounded-xl border border-border/50 bg-muted/30 p-1"
          role="tablist"
          aria-label="Select meal time"
        >
          {MEAL_TABS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              role="tab"
              aria-selected={mealTime === value}
              onClick={() => setMealTime(value)}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all',
                mealTime === value
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
              {label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* AI Suggestions */}
      <motion.div variants={rv(LIST_ITEM_VARIANTS, reduced)} className="space-y-3">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {mealTime.charAt(0).toUpperCase() + mealTime.slice(1)} Picks
          </p>
        </div>

        {isAILoading ? (
          <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-card p-4 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
            <span>
              Finding the best {mealTime} options in {trip.destination}…
            </span>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border/50 py-8 text-center">
            <Utensils className="h-6 w-6 text-muted-foreground/40" aria-hidden />
            <p className="text-sm text-muted-foreground">No suggestions available.</p>
          </div>
        ) : (
          <motion.div
            className="space-y-3"
            variants={rv(LIST_VARIANTS, reduced)}
            initial="hidden"
            animate="show"
          >
            {suggestions.map((s, i) => (
              <motion.div
                key={i}
                variants={rv(LIST_ITEM_VARIANTS, reduced)}
                className="rounded-2xl border border-border/50 bg-card p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-2xl leading-none" aria-hidden>
                    {s.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-foreground">{s.name}</p>
                      <span
                        className={cn(
                          'shrink-0 text-xs font-bold',
                          PRICE_COLOR[s.priceRange] ?? 'text-muted-foreground',
                        )}
                      >
                        {s.priceRange}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs capitalize text-muted-foreground/70">
                      {s.type.replace(/_/g, ' ')}
                    </p>
                    <p className="mt-1.5 text-sm text-muted-foreground">{s.description}</p>
                    {s.tip && (
                      <p className="mt-1.5 text-xs italic text-muted-foreground/70">💡 {s.tip}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Local Dishes */}
      {foodIntel?.dishes && foodIntel.dishes.length > 0 && (
        <motion.div variants={rv(LIST_ITEM_VARIANTS, reduced)} className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Local Specialties
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {foodIntel.dishes.slice(0, 6).map((dish) => (
              <div
                key={dish.name}
                className="flex items-start gap-3 rounded-xl border border-border/40 bg-card px-3 py-2.5"
              >
                <span className="text-xl leading-none" aria-hidden>
                  {dish.emoji}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-foreground">{dish.name}</p>
                    {dish.mustTry && (
                      <span className="rounded-full bg-rose-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase text-rose-600 dark:text-rose-400">
                        Must try
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{dish.priceRange}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Nearby Restaurants */}
      {restaurants.length > 0 && (
        <motion.div variants={rv(LIST_ITEM_VARIANTS, reduced)} className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Nearby Restaurants
          </p>
          <div className="space-y-2">
            {restaurants.slice(0, 6).map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-3 rounded-xl border border-border/40 bg-card px-3 py-2.5"
              >
                <span className="text-xl" aria-hidden>
                  🍽️
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{r.name}</p>
                  {r.address && (
                    <p className="truncate text-xs text-muted-foreground">{r.address}</p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" aria-hidden />
                  {formatDistance(r.distance)}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Water Safety note */}
      {foodIntel?.waterSafety && foodIntel.waterSafety !== 'safe' && (
        <motion.div
          variants={rv(FADE_VARIANTS, reduced)}
          initial="hidden"
          animate="show"
          className="flex items-center gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2.5"
        >
          <span className="text-base" aria-hidden>
            💧
          </span>
          <p className="text-xs text-amber-700 dark:text-amber-400">
            {foodIntel.waterSafety === 'bottled'
              ? 'Drink bottled water only — tap water is not safe for tourists.'
              : 'Use filtered water. Avoid ice from unknown sources.'}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
