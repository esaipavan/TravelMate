import { Link } from 'react-router-dom';
import { BookOpen, MapPin, ArrowRight } from 'lucide-react';
import { WidgetCard } from '@/components/shared/WidgetCard';
import type { TripRow } from '../types';

interface Props {
  trip: TripRow;
}

export function TripNotesCard({ trip }: Props) {
  /* When no notes, show a contextual map/location card */
  if (!trip.notes) {
    return (
      <WidgetCard
        icon={MapPin}
        iconClassName="bg-emerald-500/10 text-emerald-500"
        title="Location"
        headerAction={
          <Link
            to={`/trips/${trip.id}/itinerary`}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
          >
            Itinerary
            <ArrowRight className="h-3 w-3" />
          </Link>
        }
      >
        {/* Decorative map placeholder */}
        <div className="relative flex min-h-[88px] flex-1 items-center justify-center overflow-hidden rounded-xl bg-muted/30">
          {/* Simple SVG grid representing a map */}
          <svg
            viewBox="0 0 200 100"
            className="absolute inset-0 h-full w-full opacity-20"
            aria-hidden
          >
            <defs>
              <pattern
                id="td-map-grid"
                x="0"
                y="0"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="200" height="100" fill="url(#td-map-grid)" />
            <circle cx="100" cy="50" r="6" fill="currentColor" fillOpacity="0.4" />
            <circle
              cx="100"
              cy="50"
              r="12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeOpacity="0.25"
            />
          </svg>
          <div className="relative text-center">
            <MapPin className="mx-auto mb-1 h-5 w-5 text-muted-foreground/60" />
            <p className="text-xs text-muted-foreground">{trip.destination}</p>
          </div>
        </div>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard icon={BookOpen} iconClassName="bg-amber-500/10 text-amber-500" title="Notes">
      <p className="line-clamp-5 text-sm leading-relaxed text-muted-foreground">{trip.notes}</p>
    </WidgetCard>
  );
}
