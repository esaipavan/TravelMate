import { Link } from 'react-router-dom';
import { Heart, MapPin, CalendarDays } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDateRange, formatCurrency, tripDuration } from '@/utils/formatters';
import { resolveTripCoverImage } from '@/utils/destinationTheme';
import { TripStatusBadge } from './TripStatusBadge';
import { useToggleFavourite } from '../hooks/useTrips';
import type { TripRow } from '../types';

interface TripCardProps {
  trip: TripRow;
}

type DestTheme = { emoji: string; gradient: string };

const DEST_THEMES: Array<{ keys: string[]; emoji: string; rgb: string }> = [
  {
    keys: ['beach', 'bali', 'maldives', 'hawaii', 'goa', 'phuket', 'cancun', 'ibiza', 'koh'],
    emoji: '🏖️',
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
    rgb: '239,68,68',
  },
  {
    keys: ['dubai', 'egypt', 'morocco', 'petra', 'desert', 'jordan'],
    emoji: '🕌',
    rgb: '251,146,60',
  },
  { keys: ['mountain', 'alps', 'himalaya', 'nepal', 'everest'], emoji: '⛰️', rgb: '100,116,139' },
  { keys: ['new york', 'chicago', 'hong kong', 'manhattan'], emoji: '🌆', rgb: '139,92,246' },
  {
    keys: ['amazon', 'jungle', 'rainforest', 'tropical', 'costa rica'],
    emoji: '🌴',
    rgb: '34,197,94',
  },
  {
    keys: ['ski', 'snow', 'winter', 'norway', 'finland', 'iceland', 'alaska', 'swiss'],
    emoji: '🏔️',
    rgb: '59,130,246',
  },
  {
    keys: ['safari', 'africa', 'kenya', 'tanzania', 'wildlife', 'nairobi'],
    emoji: '🦁',
    rgb: '234,179,8',
  },
  {
    keys: ['india', 'mumbai', 'delhi', 'rajasthan', 'agra', 'jaipur'],
    emoji: '🕍',
    rgb: '249,115,22',
  },
  { keys: ['australia', 'sydney', 'melbourne', 'new zealand'], emoji: '🦘', rgb: '20,184,166' },
];

function getDestTheme(destination: string): DestTheme {
  const d = destination.toLowerCase();
  for (const { keys, emoji, rgb } of DEST_THEMES) {
    if (keys.some((k) => d.includes(k))) {
      return {
        emoji,
        gradient: `linear-gradient(135deg, rgba(${rgb},0.22) 0%, rgba(${rgb},0.10) 60%, rgba(${rgb},0.03) 100%)`,
      };
    }
  }
  return {
    emoji: '✈️',
    gradient:
      'linear-gradient(135deg, rgba(99,102,241,0.20) 0%, rgba(129,140,248,0.10) 60%, rgba(165,180,252,0.03) 100%)',
  };
}

export function TripCard({ trip }: TripCardProps) {
  const { mutate: toggle, isPending } = useToggleFavourite();
  const destTheme = getDestTheme(trip.destination);
  // Reconcile the persisted cover against the honest resolver so a legacy
  // guessed image for an unrecognised place falls back to the gradient.
  const cover = resolveTripCoverImage(trip.destination, trip.cover_image_url);

  function handleFavourite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggle({ id: trip.id, isFavourite: !trip.is_favourite });
  }

  const duration = tripDuration(trip.start_date, trip.end_date);

  return (
    <Link
      to={`/trips/${trip.id}`}
      className="group block rounded-xl transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <Card className="h-full overflow-hidden transition-shadow duration-200 group-hover:shadow-md">
        {/* Cover */}
        <div
          className="relative h-36 overflow-hidden"
          style={
            cover
              ? {
                  backgroundImage: `url(${cover})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
              : { background: destTheme.gradient }
          }
        >
          {/* Photo overlay */}
          {cover && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          )}

          {/* Destination emoji watermark */}
          {!cover && (
            <div className="pointer-events-none absolute inset-0 flex items-end justify-end pb-2 pr-3">
              <span
                className="select-none text-[4rem] leading-none opacity-[0.14]"
                aria-hidden="true"
              >
                {destTheme.emoji}
              </span>
            </div>
          )}

          {/* Status badge + favourite */}
          <div className="absolute right-2 top-2 flex items-center gap-1.5">
            <TripStatusBadge trip={trip} />
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
              onClick={handleFavourite}
              disabled={isPending}
              aria-label={trip.is_favourite ? 'Remove from favourites' : 'Add to favourites'}
            >
              <Heart
                className={`h-3.5 w-3.5 transition-colors ${
                  trip.is_favourite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
                }`}
              />
            </Button>
          </div>
        </div>

        {/* Body */}
        <CardContent className="space-y-2 p-4">
          <h3 className="truncate font-semibold leading-none tracking-tight">{trip.title}</h3>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{trip.destination}</span>
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarDays className="h-3 w-3 shrink-0" />
            <span>
              {formatDateRange(trip.start_date, trip.end_date)} · {duration} day
              {duration !== 1 ? 's' : ''}
            </span>
          </div>

          {trip.total_budget != null && (
            <p className="text-sm font-semibold tabular-nums text-foreground">
              {formatCurrency(trip.total_budget, trip.currency)}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
