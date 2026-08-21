import { memo } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { MapPin, CalendarDays, Heart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDateRange, formatCurrency, tripDuration } from '@/utils/formatters';
import { getTripStatus } from '@/utils/tripStatus';
import { useTripCover } from '@/hooks/useTripCover';
import { differenceInDays, parseISO } from 'date-fns';
import { useToggleFavourite } from '../hooks/useTrips';
import type { TripRow } from '../types';

/* Destination theme — mini version for thumbnail */
const DEST_THEMES: Array<{ keys: string[]; rgb: string }> = [
  { keys: ['beach', 'bali', 'maldives', 'hawaii', 'goa', 'phuket', 'cancun'], rgb: '6,182,212' },
  {
    keys: [
      'paris',
      'france',
      'rome',
      'italy',
      'london',
      'spain',
      'amsterdam',
      'europe',
      'prague',
      'greece',
      'portugal',
      'venice',
      'florence',
      'berlin',
      'barcelona',
    ],
    rgb: '245,158,11',
  },
  {
    keys: [
      'tokyo',
      'japan',
      'osaka',
      'kyoto',
      'korea',
      'china',
      'singapore',
      'bangkok',
      'vietnam',
      'taiwan',
    ],
    rgb: '239,68,68',
  },
  { keys: ['dubai', 'egypt', 'morocco', 'petra', 'desert', 'jordan'], rgb: '251,146,60' },
  { keys: ['mountain', 'alps', 'himalaya', 'nepal', 'everest'], rgb: '100,116,139' },
  { keys: ['new york', 'chicago', 'hong kong', 'manhattan'], rgb: '139,92,246' },
  { keys: ['amazon', 'jungle', 'rainforest', 'tropical', 'costa rica'], rgb: '34,197,94' },
  { keys: ['safari', 'africa', 'kenya', 'tanzania', 'wildlife', 'nairobi'], rgb: '234,179,8' },
  { keys: ['india', 'mumbai', 'delhi', 'rajasthan', 'agra', 'jaipur'], rgb: '249,115,22' },
  { keys: ['australia', 'sydney', 'melbourne', 'new zealand'], rgb: '20,184,166' },
];

function thumbGradient(destination: string): string {
  const d = destination.toLowerCase();
  for (const { keys, rgb } of DEST_THEMES) {
    if (keys.some((k) => d.includes(k))) {
      return `linear-gradient(135deg, rgba(${rgb},0.6) 0%, rgba(${rgb},0.3) 100%)`;
    }
  }
  return 'linear-gradient(135deg, rgba(99,102,241,0.5) 0%, rgba(129,140,248,0.3) 100%)';
}

const STATUS_STRIPE: Record<string, string> = {
  active: 'bg-emerald-500',
  upcoming: 'bg-primary',
  planning: 'bg-amber-500',
  completed: 'bg-muted-foreground/40',
  cancelled: 'bg-destructive/60',
};

interface Props {
  trip: TripRow;
  index: number;
}

export const TripTimelineRow = memo(function TripTimelineRow({ trip, index }: Props) {
  const reduced = useReducedMotion();
  const { mutate: toggle, isPending } = useToggleFavourite();
  const status = getTripStatus(trip);
  const gradient = thumbGradient(trip.destination);
  const cover = useTripCover(trip.destination, trip.cover_image_url);
  const duration = tripDuration(trip.start_date, trip.end_date);

  const today = parseISO(new Date().toISOString().split('T')[0] + 'T00:00:00');
  const start = parseISO(trip.start_date + 'T00:00:00');
  const daysAway = differenceInDays(start, today);

  function handleFavourite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggle({ id: trip.id, isFavourite: !trip.is_favourite });
  }

  return (
    <motion.div
      layout={!reduced}
      layoutId={!reduced ? `tm-trip-list-${trip.id}` : undefined}
      initial={reduced ? {} : { opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={reduced ? {} : { opacity: 0, x: -12, scale: 0.97 }}
      transition={
        reduced ? { duration: 0 } : { duration: 0.35, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }
      }
    >
      <Link
        to={`/trips/${trip.id}`}
        className="group block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <motion.div
          className="flex items-center gap-4 rounded-2xl border border-border/40 bg-card p-4 shadow-card"
          whileHover={
            reduced
              ? {}
              : {
                  y: -3,
                  boxShadow: '0 12px 36px -8px rgba(0,0,0,0.12), 0 4px 12px -4px rgba(0,0,0,0.06)',
                }
          }
          whileTap={reduced ? {} : { scale: 0.99 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        >
          {/* Status stripe */}
          <div
            className={cn('h-14 w-1.5 shrink-0 rounded-full', STATUS_STRIPE[status] ?? 'bg-muted')}
          />

          {/* Thumbnail */}
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl">
            {cover ? (
              <img
                src={cover}
                alt={trip.destination}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="h-full w-full" style={{ background: gradient }} />
            )}
          </div>

          {/* Trip info */}
          <div className="min-w-0 flex-1 space-y-0.5">
            <p className="truncate font-semibold leading-snug text-foreground">{trip.title}</p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{trip.destination}</span>
            </p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="h-3 w-3 shrink-0" />
              <span>
                {formatDateRange(trip.start_date, trip.end_date)} · {duration} day
                {duration !== 1 ? 's' : ''}
              </span>
            </p>
            {trip.total_budget != null && (
              <p className="text-xs font-semibold tabular-nums text-foreground">
                {formatCurrency(trip.total_budget, trip.currency)}
              </p>
            )}
          </div>

          {/* Right: days-away or arrow */}
          <div className="flex shrink-0 flex-col items-end gap-2">
            {status === 'upcoming' && daysAway > 0 ? (
              <div className="text-right">
                <p className="text-lg font-bold tabular-nums leading-none text-foreground">
                  {daysAway}
                </p>
                <p className="text-[10px] text-muted-foreground">days</p>
              </div>
            ) : (
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            )}

            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 rounded-full bg-muted/50 hover:bg-muted"
              onClick={handleFavourite}
              disabled={isPending}
              aria-label={trip.is_favourite ? 'Remove from favourites' : 'Add to favourites'}
            >
              <Heart
                className={cn(
                  'h-3.5 w-3.5 transition-all duration-200',
                  trip.is_favourite
                    ? 'scale-110 fill-red-500 text-red-500'
                    : 'text-muted-foreground',
                )}
              />
            </Button>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
});
