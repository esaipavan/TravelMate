import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { toast } from 'sonner';
import { Heart, CalendarPlus, Clock, Sunrise, Star, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { rv, CARD_VARIANTS, LIST_VARIANTS, LIST_ITEM_VARIANTS } from '@/lib/motion';
import type { Attraction, AttractionCategory } from '../types';

interface Props {
  attractions: Attraction[];
  destination: string;
}

const CATEGORY_META: Record<AttractionCategory, { label: string; cls: string }> = {
  landmark: { label: 'Landmark', cls: 'bg-blue-500/85 text-white' },
  nature: { label: 'Nature', cls: 'bg-emerald-500/85 text-white' },
  museum: { label: 'Museum', cls: 'bg-purple-500/85 text-white' },
  food: { label: 'Food', cls: 'bg-orange-500/85 text-white' },
  shopping: { label: 'Shopping', cls: 'bg-pink-500/85 text-white' },
  entertainment: { label: 'Entertainment', cls: 'bg-red-500/85 text-white' },
  religious: { label: 'Religious', cls: 'bg-amber-500/85 text-white' },
  beach: { label: 'Beach', cls: 'bg-cyan-500/85 text-white' },
  adventure: { label: 'Adventure', cls: 'bg-rose-500/85 text-white' },
};

function durationLabel(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  if (hours === Math.floor(hours)) return `${hours}h`;
  const whole = Math.floor(hours);
  const mins = Math.round((hours - whole) * 60);
  return `${whole}h ${mins}m`;
}

function PopularityBar({ score }: { score: number }) {
  return (
    <div
      className="flex items-center gap-1.5"
      aria-label={`Popularity score ${score} out of 100`}
      title={`Popularity: ${score}/100`}
    >
      <Star className="h-3 w-3 shrink-0 fill-amber-400 text-amber-400" aria-hidden />
      <div className="h-1 w-14 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-amber-400 transition-all"
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-[11px] tabular-nums text-muted-foreground">{score}</span>
    </div>
  );
}

interface CardProps {
  attraction: Attraction;
  isFavourite: boolean;
  onToggleFav: () => void;
}

function AttractionCard({ attraction, isFavourite, onToggleFav }: CardProps) {
  const reduced = useReducedMotion();
  const [imgError, setImgError] = useState(false);
  const cat = CATEGORY_META[attraction.category];

  const handleSave = () => {
    toast.info('Itinerary integration coming in a future sprint', {
      description: `"${attraction.name}" noted — you can plan it manually in the Itinerary tab.`,
      duration: 3500,
    });
  };

  return (
    <motion.article
      className="group flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm transition-shadow hover:shadow-lifted"
      variants={rv(CARD_VARIANTS, reduced)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-40px' }}
      aria-label={attraction.name}
    >
      {/* Image */}
      <div className="relative aspect-[3/2] overflow-hidden bg-muted">
        {!imgError ? (
          <img
            src={attraction.imageUrl}
            alt={attraction.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl text-muted-foreground/30">
            📍
          </div>
        )}

        {/* Category badge */}
        <span
          className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm backdrop-blur-sm ${cat.cls}`}
        >
          {cat.label}
        </span>

        {/* Popularity */}
        <div className="absolute right-3 top-3 rounded-full bg-black/40 px-2.5 py-1.5 backdrop-blur-sm">
          <PopularityBar score={attraction.popularityScore} />
        </div>

        {/* Favourite button */}
        <button
          type="button"
          onClick={onToggleFav}
          aria-label={
            isFavourite
              ? `Remove ${attraction.name} from favourites`
              : `Add ${attraction.name} to favourites`
          }
          aria-pressed={isFavourite}
          className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm transition-colors hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              isFavourite ? 'fill-rose-400 text-rose-400' : 'text-white/80'
            }`}
            aria-hidden
          />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="text-[15px] font-bold leading-snug text-foreground">{attraction.name}</h3>
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {attraction.description}
          </p>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3 shrink-0" aria-hidden />
            <span>{durationLabel(attraction.durationHours)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Sunrise className="h-3 w-3 shrink-0" aria-hidden />
            <span className="line-clamp-1">{attraction.bestTime}</span>
          </div>
        </div>

        {/* Footer: fee + save button */}
        <div className="mt-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Ticket className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
            {attraction.isFree ? (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Free
              </span>
            ) : (
              <span className="text-xs font-semibold text-foreground">
                from ${attraction.entryFeeUSD}
              </span>
            )}
          </div>

          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1.5 rounded-lg px-2.5 text-[11px]"
            onClick={handleSave}
            aria-label={`Save ${attraction.name} to itinerary`}
          >
            <CalendarPlus className="h-3 w-3" aria-hidden />
            Save
          </Button>
        </div>

        {/* Tips (collapsed, shown only when relevant) */}
        {attraction.tips.length > 0 && (
          <details className="group/tips">
            <summary className="cursor-pointer select-none text-[11px] font-semibold uppercase tracking-wide text-primary hover:text-primary/80">
              {attraction.tips.length} Insider Tip{attraction.tips.length !== 1 ? 's' : ''}
            </summary>
            <motion.ul
              className="mt-2 space-y-1"
              variants={rv(LIST_VARIANTS, reduced)}
              initial="hidden"
              animate="show"
            >
              {attraction.tips.map((tip, i) => (
                <motion.li
                  key={i}
                  className="flex items-start gap-2 text-[11px] leading-relaxed text-muted-foreground"
                  variants={rv(LIST_ITEM_VARIANTS, reduced)}
                >
                  <span className="mt-0.5 shrink-0 text-primary">›</span>
                  {tip}
                </motion.li>
              ))}
            </motion.ul>
          </details>
        )}
      </div>
    </motion.article>
  );
}

export function AttractionsSection({ attractions, destination }: Props) {
  const [favourites, setFavourites] = useState<Set<string>>(new Set());

  if (attractions.length === 0) return null;

  const toggleFav = (id: string) => {
    setFavourites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <section
      id="attractions"
      aria-label={`Top attractions in ${destination}`}
      className="space-y-5"
    >
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Top Attractions</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {attractions.length} handpicked highlights — tap ♡ to save your favourites
        </p>
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {attractions.map((a) => (
          <AttractionCard
            key={a.id}
            attraction={a}
            isFavourite={favourites.has(a.id)}
            onToggleFav={() => toggleFav(a.id)}
          />
        ))}
      </div>
    </section>
  );
}
