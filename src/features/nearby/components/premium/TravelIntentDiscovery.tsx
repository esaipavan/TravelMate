import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { rv, FADE_VARIANTS } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { TRAVEL_INTENTS } from '../../data/travelIntents';

interface Props {
  /** Seeds a search with the tapped place string — same handler as the
   *  example-destination buttons, so intent picks flow through the existing
   *  geocode → places pipeline. */
  onPlacePick: (place: string) => void;
}

/**
 * "Start from a vibe" — lets users begin discovery from a travel intent
 * (beaches, hill stations, villages…) instead of a place they already know.
 * Picking an intent reveals real example places; picking one runs a search.
 */
export function TravelIntentDiscovery({ onPlacePick }: Props) {
  const reduced = useReducedMotion();
  const [activeIntentId, setActiveIntentId] = useState<string | null>(null);
  const activeIntent = TRAVEL_INTENTS.find((i) => i.id === activeIntentId) ?? null;

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        No destination yet? Start from a vibe
      </p>

      {/* Intent chips */}
      <div className="flex flex-wrap justify-center gap-2">
        {TRAVEL_INTENTS.map((intent) => {
          const isActive = intent.id === activeIntentId;
          return (
            <button
              key={intent.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => setActiveIntentId(isActive ? null : intent.id)}
              className={cn(
                'flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                isActive
                  ? 'border-indigo-400/60 bg-indigo-500/10 text-foreground'
                  : 'border-border/60 bg-card/60 text-foreground hover:border-indigo-400/50 hover:bg-indigo-500/5',
              )}
            >
              <span aria-hidden="true">{intent.emoji}</span>
              {intent.label}
            </button>
          );
        })}
      </div>

      {/* Example places for the chosen intent */}
      <AnimatePresence mode="wait">
        {activeIntent && (
          <motion.div
            key={activeIntent.id}
            variants={rv(FADE_VARIANTS, reduced)}
            initial="hidden"
            animate="show"
            exit="exit"
            className="space-y-2 rounded-2xl border border-border/50 bg-muted/20 p-4"
          >
            <p className="text-sm text-muted-foreground">{activeIntent.blurb}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {activeIntent.places.map((place) => (
                <button
                  key={place}
                  type="button"
                  onClick={() => onPlacePick(place)}
                  className="rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs text-foreground transition-colors hover:border-indigo-400/50 hover:bg-indigo-500/5"
                >
                  {place}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
