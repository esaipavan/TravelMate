import { motion, useReducedMotion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { rv, FADE_VARIANTS, CARD_VARIANTS } from '@/lib/motion';
import { TravelIntentDiscovery } from './TravelIntentDiscovery';
import type { PlaceCategory } from '../../types';

// India-first example destinations (this is an India-only product, so foreign
// examples like "Paris"/"Tokyo" would only ever hit the "location not found"
// state). Each is a well-known Indian destination that reliably geocodes and
// has strong nearby-POI coverage — verified against the live geocode → Geoapify
// pipeline these chips feed. Deliberately diverse: heritage, beach, hills, and
// a river city.
const EXAMPLES = [
  'Jaipur, Rajasthan',
  'Goa',
  'Manali, Himachal Pradesh',
  'Varanasi, Uttar Pradesh',
];

// Friendly entry points into the existing, real Geoapify categories — no
// new/invented category exists here. "Food" and "Cafes" intentionally both
// map to 'restaurants' (Geoapify's `catering.*` taxonomy covers both), since
// that's a legitimate real category, not a fabricated distinct one.
const SHORTCUTS: { emoji: string; label: string; category: PlaceCategory }[] = [
  { emoji: '🍴', label: 'Food', category: 'restaurants' },
  { emoji: '🏨', label: 'Hotels', category: 'hotels' },
  { emoji: '📍', label: 'Attractions', category: 'attractions' },
  { emoji: '☕', label: 'Cafes', category: 'restaurants' },
  { emoji: '🛍', label: 'Shopping', category: 'shopping' },
];

interface Props {
  onExampleClick: (destination: string) => void;
  onCategoryShortcut: (category: PlaceCategory) => void;
}

export function ExplorerEmptyState({ onExampleClick, onCategoryShortcut }: Props) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      variants={rv(FADE_VARIANTS, reduced)}
      initial="hidden"
      animate="show"
      className="flex flex-col items-center gap-8 py-16 text-center"
    >
      {/* Layered map icon */}
      <motion.div
        variants={rv(CARD_VARIANTS, reduced)}
        initial="hidden"
        animate="show"
        className="relative"
      >
        <div className="absolute inset-0 rounded-3xl bg-indigo-500/10 blur-2xl" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl border border-border/40 bg-card/60 shadow-xl backdrop-blur-sm">
          <div className="bg-gradient-premium flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg">
            <MapPin className="h-7 w-7" aria-hidden="true" />
          </div>
        </div>
        {/* Decorative satellites */}
        <div className="absolute -right-3 top-2 flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-card/80 text-sm shadow-sm">
          🍽️
        </div>
        <div className="absolute -left-3 bottom-2 flex h-7 w-7 items-center justify-center rounded-full border border-border/60 bg-card/80 text-sm shadow-sm">
          🏨
        </div>
        <div className="absolute -top-2 left-1/2 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full border border-border/60 bg-card/80 text-sm shadow-sm">
          🎯
        </div>
      </motion.div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground">
          Start anywhere — no destination needed
        </h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          Search any city, town, village, or landmark, tap Near Me for what's around you, or pick a
          vibe below to discover places without a fixed destination.
        </p>
      </div>

      {/* Travel-intent discovery — the "no destination yet" entry point. */}
      <TravelIntentDiscovery onPlacePick={onExampleClick} />

      {/* Category shortcuts — tap a category to search it near you, or near
          whatever you've already typed in the search box. */}
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Browse a category
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {SHORTCUTS.map(({ emoji, label, category }) => (
            <button
              key={label}
              onClick={() => onCategoryShortcut(category)}
              className="flex items-center gap-1.5 rounded-full border border-border/60 bg-card/60 px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-indigo-400/50 hover:bg-indigo-500/5"
            >
              <span aria-hidden="true">{emoji}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Example destinations */}
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Or try a destination
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => onExampleClick(ex)}
              className="rounded-full border border-border/60 bg-muted/40 px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:border-indigo-400/50 hover:bg-indigo-500/5 hover:text-foreground"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {/* Feature chips */}
      <div className="flex flex-wrap justify-center gap-2">
        {['🗺️ Interactive Map', '⭐ Favorites', '🤖 AI Insights', '🧭 Travel Time'].map((f) => (
          <span
            key={f}
            className="rounded-full border border-border/50 bg-muted/30 px-3 py-1 text-xs text-muted-foreground"
          >
            {f}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
