import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowLeft, Heart, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDateRange, tripDuration } from '@/utils/formatters';
import { getTripStatus } from '@/utils/tripStatus';
import { resolveTripCoverImage } from '@/utils/destinationTheme';
import { usePlaceImage } from '@/hooks/usePlaceImage';
import type { TripRow } from '../types';

/* ── Destination gradient themes ──────────────────────────────── */
const DEST_THEMES: Array<{ keys: string[]; from: string; to: string; emoji: string }> = [
  {
    keys: ['beach', 'bali', 'maldives', 'hawaii', 'goa', 'phuket', 'cancun', 'ibiza', 'koh'],
    from: '#0891b2',
    to: '#06b6d4',
    emoji: '🏖️',
  },
  {
    keys: [
      'paris',
      'france',
      'rome',
      'italy',
      'london',
      'spain',
      'amsterdam',
      'prague',
      'greece',
      'portugal',
      'venice',
      'berlin',
      'barcelona',
    ],
    from: '#d97706',
    to: '#f59e0b',
    emoji: '🏛️',
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
    from: '#dc2626',
    to: '#f87171',
    emoji: '🏯',
  },
  {
    keys: ['dubai', 'egypt', 'morocco', 'petra', 'desert', 'jordan'],
    from: '#ea580c',
    to: '#fb923c',
    emoji: '🕌',
  },
  {
    keys: ['mountain', 'alps', 'himalaya', 'nepal', 'everest'],
    from: '#475569',
    to: '#94a3b8',
    emoji: '⛰️',
  },
  {
    keys: ['new york', 'chicago', 'hong kong', 'manhattan'],
    from: '#7c3aed',
    to: '#a78bfa',
    emoji: '🌆',
  },
  {
    keys: ['amazon', 'jungle', 'rainforest', 'tropical', 'costa rica'],
    from: '#16a34a',
    to: '#4ade80',
    emoji: '🌴',
  },
  {
    keys: ['ski', 'snow', 'winter', 'norway', 'finland', 'iceland', 'alaska', 'swiss'],
    from: '#2563eb',
    to: '#60a5fa',
    emoji: '🏔️',
  },
  {
    keys: ['safari', 'africa', 'kenya', 'tanzania', 'wildlife'],
    from: '#ca8a04',
    to: '#facc15',
    emoji: '🦁',
  },
  {
    keys: ['india', 'mumbai', 'delhi', 'rajasthan', 'agra', 'jaipur'],
    from: '#ea580c',
    to: '#fdba74',
    emoji: '🕍',
  },
  {
    keys: ['australia', 'sydney', 'melbourne', 'new zealand'],
    from: '#0d9488',
    to: '#2dd4bf',
    emoji: '🦘',
  },
];

function getDestTheme(destination: string) {
  const d = destination.toLowerCase();
  for (const t of DEST_THEMES) {
    if (t.keys.some((k) => d.includes(k))) return t;
  }
  return { from: '#6366f1', to: '#818cf8', emoji: '✈️' };
}

/* ── Status config ────────────────────────────────────────────── */
const STATUS_LABEL: Record<string, { label: string; dot: string }> = {
  active: { label: 'Live now', dot: 'bg-emerald-400 animate-pulse' },
  upcoming: { label: 'Upcoming', dot: 'bg-blue-400' },
  planning: { label: 'Planning', dot: 'bg-amber-400' },
  completed: { label: 'Completed', dot: 'bg-muted-foreground/60' },
  cancelled: { label: 'Cancelled', dot: 'bg-red-400' },
};

/* ── Props ────────────────────────────────────────────────────── */
interface Props {
  trip: TripRow;
  onEdit: () => void;
  onDelete: () => void;
  onFavToggle: () => void;
  isFavPending: boolean;
}

/* ── TripDetailHero ───────────────────────────────────────────── */
export function TripDetailHero({ trip, onEdit, onDelete, onFavToggle, isFavPending }: Props) {
  const reduced = useReducedMotion();
  const heroRef = useRef<HTMLDivElement>(null);

  /* Parallax: image slides up at 30% scroll speed */
  const { scrollY } = useScroll();
  const imgY = useTransform(scrollY, [0, 500], [0, 120]);

  const theme = getDestTheme(trip.destination);
  const reconciledCover = resolveTripCoverImage(trip.destination, trip.cover_image_url);
  // Non-curated place with no cover → try a real Wikipedia photo; gradient otherwise.
  const { imageUrl: enriched } = usePlaceImage(trip.destination, { enabled: !reconciledCover });
  const cover = reconciledCover ?? enriched;
  const duration = tripDuration(trip.start_date, trip.end_date);
  const status = getTripStatus(trip);
  const statusCfg = STATUS_LABEL[status] ?? STATUS_LABEL['upcoming'];

  return (
    /* Full-bleed breakout from page padding */
    <div ref={heroRef} className="-mx-4 sm:-mx-6">
      <motion.div
        /* layoutId matches PremiumTripCard outer wrapper — ready for shared-layout transition */
        layoutId={!reduced ? `tm-trip-${trip.id}` : undefined}
        layout={!reduced}
        className="relative h-[52vmin] max-h-[520px] min-h-[280px] overflow-hidden"
        initial={reduced ? {} : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* ── Background ── */}
        {cover ? (
          <motion.img
            src={cover}
            alt={trip.destination}
            className="absolute inset-0 h-[130%] w-full object-cover"
            style={reduced ? undefined : { y: imgY, top: '-15%' }}
            initial={reduced ? {} : { scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${theme.from} 0%, ${theme.to} 100%)`,
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="select-none text-[12rem] leading-none opacity-[0.10]" aria-hidden>
                {theme.emoji}
              </span>
            </div>
          </div>
        )}

        {/* ── Depth gradient overlays ── */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/75" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />

        {/* ── Top action bar ── */}
        <motion.div
          className="absolute left-4 right-4 top-4 z-10 flex items-center justify-between sm:left-6 sm:right-6"
          initial={reduced ? {} : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
        >
          {/* Back */}
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full border border-white/10 bg-black/35 text-white backdrop-blur-md hover:bg-black/55"
            aria-label="Back to trips"
          >
            <Link to="/trips">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onFavToggle}
              disabled={isFavPending}
              className="h-9 w-9 rounded-full border border-white/10 bg-black/35 text-white backdrop-blur-md hover:bg-black/55"
              aria-label={trip.is_favourite ? 'Remove from favourites' : 'Add to favourites'}
            >
              <Heart
                className={cn(
                  'h-4 w-4 transition-all duration-200',
                  trip.is_favourite && 'fill-red-400 text-red-400',
                )}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              className="h-9 w-9 rounded-full border border-white/10 bg-black/35 text-white backdrop-blur-md hover:bg-black/55"
              aria-label="Edit trip"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="h-9 w-9 rounded-full border border-white/10 bg-black/35 text-white backdrop-blur-md hover:bg-destructive/70"
              aria-label="Delete trip"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        {/* ── Glassmorphic bottom info panel ── */}
        <motion.div
          className="absolute inset-x-0 bottom-0 px-4 pb-6 pt-24 sm:px-6"
          initial={reduced ? {} : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Status chip */}
          <div className="mb-2 flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-semibold text-white/90 ring-1 ring-white/15 backdrop-blur-md">
              <span className={cn('h-1.5 w-1.5 rounded-full', statusCfg.dot)} aria-hidden />
              {statusCfg.label}
            </span>
          </div>

          {/* Title */}
          <h1 className="line-clamp-2 text-2xl font-bold leading-tight text-white drop-shadow-sm sm:text-3xl">
            {trip.title}
          </h1>

          {/* Meta */}
          <p className="mt-1.5 text-sm font-medium text-white/75">
            {trip.destination}
            <span className="mx-2 text-white/40">·</span>
            {formatDateRange(trip.start_date, trip.end_date)}
            <span className="mx-2 text-white/40">·</span>
            {duration} day{duration !== 1 ? 's' : ''}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
