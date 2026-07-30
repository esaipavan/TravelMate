import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Camera } from 'lucide-react';
import { format } from 'date-fns';
import { rv, LIST_VARIANTS, LIST_ITEM_VARIANTS } from '@/lib/motion';
import { resolveDestinationTheme } from '@/utils/destinationTheme';
import { getTripStatus } from '@/utils/tripStatus';
import { tripDuration } from '@/utils/formatters';
import type { TripRow } from '../types';

interface MemoryCardProps {
  trip: TripRow;
  reduced: boolean | null;
}

function MemoryCard({ trip, reduced }: MemoryCardProps) {
  const theme = useMemo(() => resolveDestinationTheme(trip.destination), [trip.destination]);
  const imageUrl = trip.cover_image_url ?? theme.imageUrl;
  const [imgError, setImgError] = useState(false);
  const year = trip.end_date.slice(0, 4);
  const endFmt = format(new Date(trip.end_date + 'T00:00:00'), 'MMM yyyy');
  const days = tripDuration(trip.start_date, trip.end_date);

  return (
    <motion.div
      variants={rv(LIST_ITEM_VARIANTS, reduced)}
      whileHover={reduced ? {} : { y: -4, scale: 1.02 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className="w-52 shrink-0"
    >
      <Link
        to={`/trips/${trip.id}`}
        aria-label={`View memory: ${trip.title}`}
        className="block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <div className="relative h-36 overflow-hidden rounded-2xl bg-muted">
          {imgError ? (
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${theme.accent}50 0%, ${theme.secondary}30 100%)`,
              }}
              role="img"
              aria-label={trip.destination}
            />
          ) : (
            <img
              src={imageUrl}
              alt={trip.destination}
              className="absolute inset-0 h-full w-full object-cover"
              style={{ filter: 'saturate(0.85)' }}
              loading="lazy"
              onError={() => setImgError(true)}
            />
          )}

          {/* Warm memory overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, transparent 60%), linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.10) 55%)',
            }}
            aria-hidden="true"
          />

          {/* Year badge */}
          <div className="absolute left-2.5 top-2.5 rounded-full bg-black/40 px-2 py-0.5 backdrop-blur-sm">
            <span className="text-[10px] font-bold tabular-nums text-white/90">{year}</span>
          </div>

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <p className="truncate text-xs font-bold leading-tight text-white">{trip.title}</p>
            <div className="mt-1 flex items-center gap-2 text-[10px] text-white/60">
              <span>{trip.destination.split(',')[0]}</span>
              <span>·</span>
              <span>
                {days}d · {endFmt}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

interface Props {
  trips: TripRow[];
}

export function TravelMemoriesPreview({ trips }: Props) {
  const reduced = useReducedMotion();

  const memories = useMemo(
    () =>
      trips
        .filter((t) => getTripStatus(t) === 'completed')
        .sort((a, b) => b.end_date.localeCompare(a.end_date))
        .slice(0, 12),
    [trips],
  );

  if (memories.length === 0) return null;

  return (
    <section aria-label="Travel memories">
      <div className="mb-3 flex items-center gap-2">
        <Camera className="h-4 w-4 text-amber-500" aria-hidden="true" />
        <h2 className="text-base font-semibold text-foreground">Travel Memories</h2>
        <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
          {memories.length} trip{memories.length !== 1 ? 's' : ''}
        </span>
      </div>
      <p className="mb-4 text-xs text-muted-foreground">
        A look back at your completed adventures.
      </p>

      <div className="-mx-4 px-4 lg:-mx-6 lg:px-6">
        <motion.div
          className="flex gap-3 overflow-x-auto pb-2"
          style={{ scrollbarWidth: 'none' }}
          variants={rv(LIST_VARIANTS, reduced)}
          initial="hidden"
          animate="show"
        >
          {memories.map((trip) => (
            <MemoryCard key={trip.id} trip={trip} reduced={reduced} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
