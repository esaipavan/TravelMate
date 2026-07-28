import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { rv, LIST_VARIANTS, LIST_ITEM_VARIANTS } from '@/lib/motion';
import { resolveDestinationTheme } from '@/utils/destinationTheme';
import { getTripStatus } from '@/utils/tripStatus';
import type { TripRow } from '../types';

interface Collection {
  id: string;
  label: string;
  emoji: string;
  accent: string;
  match: (trip: TripRow) => boolean;
}

const COLLECTIONS: Collection[] = [
  {
    id: 'live',
    label: 'Live Now',
    emoji: '🔴',
    accent: '#10B981',
    match: (t) => getTripStatus(t) === 'active',
  },
  {
    id: 'beach',
    label: 'Beach & Coast',
    emoji: '🏖️',
    accent: '#0EA5E9',
    match: (t) => {
      const d = t.destination.toLowerCase() + ' ' + t.title.toLowerCase();
      return [
        'goa',
        'bali',
        'phuket',
        'maldives',
        'miami',
        'cancun',
        'andaman',
        'beach',
        'coast',
        'koh',
        'seaside',
      ].some((k) => d.includes(k));
    },
  },
  {
    id: 'mountains',
    label: 'Mountains',
    emoji: '🏔️',
    accent: '#10B981',
    match: (t) => {
      const d = t.destination.toLowerCase() + ' ' + t.title.toLowerCase();
      return [
        'himachal',
        'manali',
        'shimla',
        'dharamshala',
        'leh',
        'ladakh',
        'mussoorie',
        'nainital',
        'ooty',
        'kodaikanal',
        'mountain',
        'alps',
        'himalayas',
        'hills',
      ].some((k) => d.includes(k));
    },
  },
  {
    id: 'international',
    label: 'International',
    emoji: '✈️',
    accent: '#8B5CF6',
    match: (t) => {
      const d = t.destination.toLowerCase();
      return [
        'paris',
        'london',
        'dubai',
        'singapore',
        'bangkok',
        'tokyo',
        'bali',
        'new york',
        'europe',
        'usa',
        'uk',
        'japan',
        'australia',
        'canada',
        'germany',
        'italy',
        'spain',
        'switzerland',
      ].some((k) => d.includes(k));
    },
  },
  {
    id: 'weekend',
    label: 'Weekend Trips',
    emoji: '🌅',
    accent: '#F59E0B',
    match: (t) => {
      const start = new Date(t.start_date + 'T00:00:00').getTime();
      const end = new Date(t.end_date + 'T00:00:00').getTime();
      const days = Math.round((end - start) / 86_400_000) + 1;
      return days <= 3;
    },
  },
  {
    id: 'favourites',
    label: 'Saved',
    emoji: '⭐',
    accent: '#EF4444',
    match: (t) => t.is_favourite,
  },
];

interface MiniCardProps {
  trip: TripRow;
  reduced: boolean | null;
}

function MiniCard({ trip, reduced }: MiniCardProps) {
  const theme = useMemo(() => resolveDestinationTheme(trip.destination), [trip.destination]);
  const imageUrl = trip.cover_image_url ?? theme.imageUrl;

  return (
    <motion.div
      variants={rv(LIST_ITEM_VARIANTS, reduced)}
      whileHover={reduced ? {} : { y: -3 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className="w-40 shrink-0"
    >
      <Link
        to={`/trips/${trip.id}`}
        aria-label={`Open ${trip.title}`}
        className="block overflow-hidden rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <div className="relative h-24 bg-muted">
          <img
            src={imageUrl}
            alt={trip.destination}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)' }}
            aria-hidden="true"
          />
          <div className="absolute bottom-0 left-0 right-0 p-2">
            <p className="truncate text-[11px] font-semibold leading-tight text-white">
              {trip.title}
            </p>
            <p className="truncate text-[10px] text-white/60">{trip.destination.split(',')[0]}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

interface Props {
  trips: TripRow[];
}

export function TripCollections({ trips }: Props) {
  const reduced = useReducedMotion();

  const matched = useMemo(
    () =>
      COLLECTIONS.map((c) => ({ ...c, trips: trips.filter(c.match) })).filter(
        (c) => c.trips.length > 0,
      ),
    [trips],
  );

  if (matched.length === 0) return null;

  return (
    <section aria-label="Trip collections" className="space-y-6">
      <div className="flex items-center gap-2">
        <h2 className="text-base font-semibold text-foreground">Collections</h2>
      </div>

      <motion.div
        className="space-y-5"
        variants={rv(LIST_VARIANTS, reduced)}
        initial="hidden"
        animate="show"
      >
        {matched.map((collection) => (
          <motion.div key={collection.id} variants={rv(LIST_ITEM_VARIANTS, reduced)}>
            {/* Collection header */}
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg" aria-hidden="true">
                  {collection.emoji}
                </span>
                <h3 className="text-sm font-semibold text-foreground">{collection.label}</h3>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground">
                  {collection.trips.length}
                </span>
              </div>
              <button
                type="button"
                className={cn(
                  'flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary',
                  'outline-none focus-visible:underline',
                )}
                aria-label={`View all ${collection.label}`}
              >
                View all
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </button>
            </div>

            {/* Horizontal scroll */}
            <div className="-mx-4 px-4 lg:-mx-6 lg:px-6">
              <motion.div
                className="flex gap-3 overflow-x-auto pb-2"
                style={{ scrollbarWidth: 'none' }}
                variants={rv(LIST_VARIANTS, reduced)}
              >
                {collection.trips.slice(0, 10).map((trip) => (
                  <MiniCard key={trip.id} trip={trip} reduced={reduced} />
                ))}
              </motion.div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
