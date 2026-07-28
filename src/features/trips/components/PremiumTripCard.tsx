import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Heart, MapPin, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDateRange, formatCurrency, tripDuration } from '@/utils/formatters';
import { getTripStatus } from '@/utils/tripStatus';
import { differenceInDays, parseISO } from 'date-fns';
import { useToggleFavourite } from '../hooks/useTrips';
import type { TripRow } from '../types';

/* ── Destination themes ───────────────────────────────────────── */
interface DestTheme {
  emoji: string;
  category: string;
  rgb: string;
}

const DEST_THEMES: Array<{ keys: string[]; emoji: string; category: string; rgb: string }> = [
  {
    keys: ['beach', 'bali', 'maldives', 'hawaii', 'goa', 'phuket', 'cancun', 'ibiza', 'koh'],
    emoji: '🏖️',
    category: 'Beach',
    rgb: '6,182,212',
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
      'florence',
      'berlin',
      'barcelona',
      'europe',
    ],
    emoji: '🏛️',
    category: 'Europe',
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
    emoji: '🏯',
    category: 'Asia',
    rgb: '239,68,68',
  },
  {
    keys: ['dubai', 'egypt', 'morocco', 'petra', 'desert', 'jordan'],
    emoji: '🕌',
    category: 'Middle East',
    rgb: '251,146,60',
  },
  {
    keys: ['mountain', 'alps', 'himalaya', 'nepal', 'everest'],
    emoji: '⛰️',
    category: 'Nature',
    rgb: '100,116,139',
  },
  {
    keys: ['new york', 'chicago', 'hong kong', 'manhattan'],
    emoji: '🌆',
    category: 'City',
    rgb: '139,92,246',
  },
  {
    keys: ['amazon', 'jungle', 'rainforest', 'tropical', 'costa rica'],
    emoji: '🌴',
    category: 'Jungle',
    rgb: '34,197,94',
  },
  {
    keys: ['ski', 'snow', 'winter', 'norway', 'finland', 'iceland', 'alaska', 'swiss'],
    emoji: '🏔️',
    category: 'Winter',
    rgb: '59,130,246',
  },
  {
    keys: ['safari', 'africa', 'kenya', 'tanzania', 'wildlife', 'nairobi'],
    emoji: '🦁',
    category: 'Safari',
    rgb: '234,179,8',
  },
  {
    keys: ['india', 'mumbai', 'delhi', 'rajasthan', 'agra', 'jaipur'],
    emoji: '🕍',
    category: 'India',
    rgb: '249,115,22',
  },
  {
    keys: ['australia', 'sydney', 'melbourne', 'new zealand'],
    emoji: '🦘',
    category: 'Oceania',
    rgb: '20,184,166',
  },
];

function getDestTheme(destination: string): DestTheme {
  const d = destination.toLowerCase();
  for (const { keys, emoji, category, rgb } of DEST_THEMES) {
    if (keys.some((k) => d.includes(k))) return { emoji, category, rgb };
  }
  return { emoji: '✈️', category: 'Travel', rgb: '99,102,241' };
}

/* ── Status chip ──────────────────────────────────────────────── */
function StatusChip({ status }: { status: string }) {
  const isActive = status === 'active';
  const cfg: Record<string, { label: string; cls: string }> = {
    active: { label: 'Live', cls: 'bg-emerald-500 text-white' },
    upcoming: { label: 'Upcoming', cls: 'bg-primary text-white' },
    planning: { label: 'Planning', cls: 'bg-amber-500/90 text-white' },
    completed: { label: 'Done', cls: 'bg-muted-foreground/20 text-muted-foreground' },
    cancelled: { label: 'Cancelled', cls: 'bg-destructive/20 text-destructive' },
  };
  const { label, cls } = cfg[status] ?? cfg['upcoming'];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        cls,
      )}
    >
      {isActive && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />}
      {label}
    </span>
  );
}

/* ── Props ────────────────────────────────────────────────────── */
interface Props {
  trip: TripRow;
  index: number;
}

/* ── PremiumTripCard ──────────────────────────────────────────── */
export function PremiumTripCard({ trip, index }: Props) {
  const reduced = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  /* 3-D tilt */
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const sp = { damping: 20, stiffness: 200 };
  const rotY = useSpring(useTransform(mx, [0, 1], [-6, 6]), sp);
  const rotX = useSpring(useTransform(my, [0, 1], [6, -6]), sp);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };
  const onMouseLeave = () => {
    mx.set(0.5);
    my.set(0.5);
    setHovered(false);
  };
  const onMouseEnter = () => setHovered(true);

  /* Favourite */
  const { mutate: toggle, isPending } = useToggleFavourite();
  const handleFavourite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle({ id: trip.id, isFavourite: !trip.is_favourite });
  };

  /* Computed status + progress */
  const status = getTripStatus(trip);
  const theme = getDestTheme(trip.destination);
  const duration = tripDuration(trip.start_date, trip.end_date);

  const today = parseISO(new Date().toISOString().split('T')[0] + 'T00:00:00');
  const start = parseISO(trip.start_date + 'T00:00:00');
  const end = parseISO(trip.end_date + 'T00:00:00');
  const totalDays = differenceInDays(end, start) + 1;
  const daysPassed = Math.max(0, differenceInDays(today, start));
  const progress =
    status === 'active' ? Math.min(100, Math.round((daysPassed / totalDays) * 100)) : 0;

  /* Cover gradient (when no image) */
  const coverGradient = `linear-gradient(135deg,
    rgba(${theme.rgb},0.55) 0%,
    rgba(${theme.rgb},0.28) 55%,
    rgba(${theme.rgb},0.10) 100%)`;

  /* Card entrance variants */
  const ITEM = {
    hidden: { opacity: 0, y: 24, scale: 0.96 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring' as const,
        damping: 22,
        stiffness: 110,
        delay: index * 0.055,
      },
    },
  };

  return (
    <motion.div
      variants={reduced ? undefined : ITEM}
      layout={!reduced}
      layoutId={!reduced ? `tm-trip-${trip.id}` : undefined}
    >
      <div
        ref={wrapRef}
        style={{ perspective: '900px' }}
        onMouseMove={reduced ? undefined : onMouseMove}
        onMouseLeave={onMouseLeave}
        onMouseEnter={onMouseEnter}
      >
        <Link
          to={`/trips/${trip.id}`}
          className="block rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <motion.div
            className="group relative h-[280px] overflow-hidden rounded-3xl border border-border/25 shadow-float"
            style={reduced ? undefined : { rotateX: rotX, rotateY: rotY }}
            whileHover={
              reduced
                ? {}
                : {
                    y: -8,
                    boxShadow:
                      '0 32px 72px -12px rgba(0,0,0,0.18), 0 8px 24px -6px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.06)',
                  }
            }
            whileTap={reduced ? {} : { scale: 0.98 }}
            transition={{ type: 'spring', damping: 18, stiffness: 260 }}
          >
            {/* ── Cover ── */}
            {trip.cover_image_url ? (
              <img
                src={trip.cover_image_url}
                alt={trip.destination}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0" style={{ background: coverGradient }}>
                {/* Destination emoji watermark */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <span className="select-none text-[7rem] leading-none opacity-[0.12]" aria-hidden>
                    {theme.emoji}
                  </span>
                </div>
              </div>
            )}

            {/* ── Gradient depth overlay ── */}
            <div className="to-background/92 pointer-events-none absolute inset-0 bg-gradient-to-b from-black/15 via-transparent" />

            {/* ── Top row: destination badge + favourite ── */}
            <div className="pointer-events-none absolute left-3 right-3 top-3 flex items-start justify-between">
              {/* Destination category badge */}
              <motion.div
                className="pointer-events-none flex items-center gap-1.5 rounded-full bg-background/70 px-2.5 py-1 text-[11px] font-semibold text-foreground/80 ring-1 ring-border/20 backdrop-blur-md"
                initial={reduced ? {} : { opacity: 0, x: -8, scale: 0.85 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{
                  delay: 0.15 + index * 0.04,
                  type: 'spring',
                  damping: 18,
                  stiffness: 200,
                }}
              >
                <span aria-hidden>{theme.emoji}</span>
                <span>{theme.category}</span>
              </motion.div>

              {/* Favourite button */}
              <div className="pointer-events-auto">
                <motion.div
                  whileHover={reduced ? {} : { scale: 1.15 }}
                  whileTap={reduced ? {} : { scale: 0.9 }}
                >
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full bg-background/65 backdrop-blur-md hover:bg-background/90"
                    onClick={handleFavourite}
                    disabled={isPending}
                    aria-label={trip.is_favourite ? 'Remove from favourites' : 'Add to favourites'}
                  >
                    <Heart
                      className={cn(
                        'h-4 w-4 transition-all duration-200',
                        trip.is_favourite ? 'fill-red-500 text-red-500' : 'text-foreground/70',
                      )}
                    />
                  </Button>
                </motion.div>
              </div>
            </div>

            {/* ── Glass reflection sweep ── */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
              <div
                className="absolute inset-y-0 w-2/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent transition-all duration-700"
                style={{ left: hovered ? '140%' : '-80%' }}
              />
            </div>

            {/* ── Glassmorphism info panel ── */}
            <div className="from-background/92 absolute inset-x-0 bottom-0 rounded-b-3xl bg-gradient-to-t via-background/55 to-transparent px-4 pb-4 pt-10 backdrop-blur-[6px]">
              {/* Status chip */}
              <div className="mb-1.5">
                <StatusChip status={status} />
              </div>

              {/* Title */}
              <h3 className="mb-1 line-clamp-1 text-base font-bold tracking-tight text-foreground">
                {trip.title}
              </h3>

              {/* Destination + dates */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-foreground/70">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {trip.destination}
                </span>
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-3 w-3 shrink-0" />
                  {formatDateRange(trip.start_date, trip.end_date)}
                  <span className="text-foreground/40">·</span>
                  {duration}d
                </span>
              </div>

              {/* Budget */}
              {trip.total_budget != null && (
                <p className="mt-1 text-sm font-bold tabular-nums text-foreground">
                  {formatCurrency(trip.total_budget, trip.currency)}
                </p>
              )}
            </div>

            {/* ── Progress bar (active trips only) ── */}
            {status === 'active' && (
              <div className="absolute inset-x-0 bottom-0 h-[3px] bg-muted/30">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-400"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: progress / 100 }}
                  style={{ transformOrigin: 'left' }}
                  transition={
                    reduced
                      ? { duration: 0 }
                      : { duration: 1.2, delay: 0.3 + index * 0.04, ease: [0.16, 1, 0.3, 1] }
                  }
                />
              </div>
            )}
          </motion.div>
        </Link>
      </div>
    </motion.div>
  );
}
