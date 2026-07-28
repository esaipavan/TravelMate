import { motion, useReducedMotion } from 'framer-motion';
import { MapPin, Phone, Globe, Heart, ExternalLink, Clock, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';
import { rv, LIST_ITEM_VARIANTS, CARD_VARIANTS, rg, HOVER, PRESS } from '@/lib/motion';
import { CATEGORY_META, formatDistance, travelTime, type NearbyPlace } from '../../types';

interface Props {
  place: NearbyPlace;
  isSelected: boolean;
  isFavorite: boolean;
  onSelect: () => void;
  onFavorite: (e: React.MouseEvent) => void;
  staggered?: boolean;
}

export function NearbyPlaceCard({
  place,
  isSelected,
  isFavorite,
  onSelect,
  onFavorite,
  staggered = false,
}: Props) {
  const reduced = useReducedMotion();
  const meta = CATEGORY_META[place.category];
  const time = travelTime(place.distance);

  return (
    <motion.div
      variants={rv(staggered ? LIST_ITEM_VARIANTS : CARD_VARIANTS, reduced)}
      {...(!staggered && {
        initial: 'hidden',
        whileInView: 'show',
        viewport: { once: true, margin: '-10px' },
      })}
      whileHover={rg(HOVER.lift, reduced)}
      whileTap={rg(PRESS.subtle, reduced)}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
      aria-pressed={isSelected}
      className={cn(
        'group relative flex cursor-pointer gap-3 overflow-hidden rounded-2xl border bg-card/60 p-3 backdrop-blur-sm transition-shadow hover:shadow-md',
        isSelected
          ? 'border-indigo-500/50 shadow-[0_0_0_2px_rgba(99,102,241,0.3)]'
          : 'border-border/40',
      )}
    >
      {/* Category gradient thumbnail */}
      <div
        className={cn(
          'flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-2xl shadow-sm',
          meta.gradient,
        )}
        aria-hidden="true"
      >
        {meta.emoji}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-sm font-semibold text-foreground" title={place.name}>
            {place.name}
          </p>
          {/* Favorite button */}
          <button
            onClick={onFavorite}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            className="shrink-0 rounded-full p-1 text-muted-foreground transition-colors hover:text-rose-500"
          >
            <Heart
              className={cn('h-3.5 w-3.5', isFavorite && 'fill-rose-500 text-rose-500')}
              aria-hidden="true"
            />
          </button>
        </div>

        {place.address && (
          <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
            {place.address}
          </p>
        )}

        {/* Distance + travel time */}
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className="flex items-center gap-1 rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-foreground">
            <Navigation className="h-2.5 w-2.5" aria-hidden="true" />
            {formatDistance(place.distance)}
          </span>
          <span className="rounded-full bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground">
            🚶 {time.walk}
          </span>
          <span className="rounded-full bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground">
            🚗 {time.drive}
          </span>
          {place.openNow === true && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
              <Clock className="h-2.5 w-2.5" aria-hidden="true" />
              Open
            </span>
          )}
        </div>

        {/* Contact info */}
        <div className="mt-1 flex items-center gap-2">
          {place.phone && (
            <a
              href={`tel:${place.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
              aria-label={`Call ${place.name}`}
            >
              <Phone className="h-2.5 w-2.5" aria-hidden="true" />
              <span className="max-w-24 truncate">{place.phone}</span>
            </a>
          )}
          {place.website && (
            <a
              href={place.website}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-indigo-500"
              aria-label={`Visit ${place.name} website`}
            >
              <Globe className="h-2.5 w-2.5" aria-hidden="true" />
              Website
            </a>
          )}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lon}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground hover:text-indigo-500"
            aria-label={`Open ${place.name} in Google Maps`}
          >
            <ExternalLink className="h-2.5 w-2.5" aria-hidden="true" />
            Maps
          </a>
        </div>
      </div>

      {/* Selected indicator */}
      {isSelected && (
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-inset ring-indigo-500/30"
          aria-hidden="true"
        />
      )}
    </motion.div>
  );
}
