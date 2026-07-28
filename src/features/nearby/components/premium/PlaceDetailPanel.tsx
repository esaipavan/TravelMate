import { motion, useReducedMotion } from 'framer-motion';
import { X, MapPin, Phone, Globe, Heart, ExternalLink, Navigation, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { rv, CARD_VARIANTS } from '@/lib/motion';
import { CATEGORY_META, formatDistance, travelTime, type NearbyPlace } from '../../types';

interface Props {
  place: NearbyPlace;
  isFavorite: boolean;
  onFavorite: () => void;
  onClose: () => void;
  className?: string;
}

export function PlaceDetailPanel({ place, isFavorite, onFavorite, onClose, className }: Props) {
  const reduced = useReducedMotion();
  const meta = CATEGORY_META[place.category];
  const time = travelTime(place.distance);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lon}`;
  const routeUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`;

  return (
    <motion.div
      variants={rv(CARD_VARIANTS, reduced)}
      initial="hidden"
      animate="show"
      exit="exit"
      className={cn(
        'relative overflow-hidden rounded-2xl border border-border/40 bg-card/95 shadow-2xl backdrop-blur-md',
        className,
      )}
    >
      {/* Gradient accent top bar */}
      <div className={cn('h-1 w-full bg-gradient-to-r', meta.gradient)} aria-hidden="true" />

      {/* Glow */}
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-3xl"
        style={{ background: `${meta.color}18` }}
        aria-hidden="true"
      />

      <div className="p-4">
        {/* Header */}
        <div className="mb-3 flex items-start gap-3">
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-xl shadow-sm',
              meta.gradient,
            )}
            aria-hidden="true"
          >
            {meta.emoji}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-foreground">{place.name}</p>
            <span className="text-[11px] font-medium" style={{ color: meta.color }}>
              {meta.label}
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close detail panel"
            className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Address */}
        {place.address && (
          <p className="mb-3 flex items-start gap-1.5 text-xs text-muted-foreground">
            <MapPin className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
            {place.address}
          </p>
        )}

        {/* Distance + travel */}
        <div className="mb-3 flex flex-wrap gap-1.5">
          <span className="flex items-center gap-1 rounded-full bg-muted/60 px-2.5 py-1 text-[11px] font-semibold text-foreground">
            <Navigation className="h-3 w-3" aria-hidden="true" />
            {formatDistance(place.distance)}
          </span>
          <span className="rounded-full bg-muted/40 px-2.5 py-1 text-[11px] text-muted-foreground">
            🚶 {time.walk}
          </span>
          <span className="rounded-full bg-muted/40 px-2.5 py-1 text-[11px] text-muted-foreground">
            🚗 {time.drive}
          </span>
          {place.openNow === true && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              <Clock className="h-3 w-3" aria-hidden="true" />
              Open now
            </span>
          )}
        </div>

        {/* Opening hours */}
        {place.openingHours && (
          <p className="mb-3 text-[11px] text-muted-foreground">
            <span className="font-medium text-foreground">Hours: </span>
            {place.openingHours}
          </p>
        )}

        {/* Contact */}
        {(place.phone || place.website) && (
          <div className="mb-3 space-y-1">
            {place.phone && (
              <a
                href={`tel:${place.phone}`}
                className="flex items-center gap-2 text-[11px] text-muted-foreground hover:text-foreground"
              >
                <Phone className="h-3 w-3" aria-hidden="true" />
                {place.phone}
              </a>
            )}
            {place.website && (
              <a
                href={place.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 truncate text-[11px] text-indigo-500 hover:text-indigo-400"
              >
                <Globe className="h-3 w-3 shrink-0" aria-hidden="true" />
                {place.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
              </a>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className={cn(
              'flex-1 gap-1.5 text-xs',
              isFavorite && 'border-rose-500/30 bg-rose-500/5 text-rose-500 hover:bg-rose-500/10',
            )}
            onClick={onFavorite}
          >
            <Heart
              className={cn('h-3.5 w-3.5', isFavorite && 'fill-rose-500')}
              aria-hidden="true"
            />
            {isFavorite ? 'Saved' : 'Save'}
          </Button>

          <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-xs" asChild>
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              View
            </a>
          </Button>

          <Button
            size="sm"
            className="flex-1 gap-1.5 bg-gradient-to-r from-indigo-500 to-violet-500 text-xs text-white hover:from-indigo-600 hover:to-violet-600"
            asChild
          >
            <a href={routeUrl} target="_blank" rel="noopener noreferrer">
              <Navigation className="h-3.5 w-3.5" aria-hidden="true" />
              Route
            </a>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
