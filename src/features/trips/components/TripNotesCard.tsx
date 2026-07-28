import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { BookOpen, MapPin, ArrowRight } from 'lucide-react';
import type { TripRow } from '../types';

interface Props {
  trip: TripRow;
}

export function TripNotesCard({ trip }: Props) {
  const reduced = useReducedMotion();

  /* When no notes, show a contextual map/location card */
  if (!trip.notes) {
    return (
      <motion.div
        className="flex flex-col gap-4 overflow-hidden rounded-2xl border border-border/40 bg-card p-5 shadow-card"
        initial={reduced ? {} : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        whileHover={reduced ? {} : { y: -3, boxShadow: '0 12px 36px -8px rgba(0,0,0,0.10)' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10">
              <MapPin className="h-4 w-4 text-emerald-500" />
            </div>
            <span className="text-sm font-semibold text-foreground">Location</span>
          </div>
          <Link
            to={`/trips/${trip.id}/itinerary`}
            className="hover:bg-primary/8 flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-primary transition-colors"
          >
            Itinerary
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

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
      </motion.div>
    );
  }

  return (
    <motion.div
      className="flex flex-col gap-4 rounded-2xl border border-border/40 bg-card p-5 shadow-card"
      initial={reduced ? {} : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.28, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileHover={reduced ? {} : { y: -3, boxShadow: '0 12px 36px -8px rgba(0,0,0,0.10)' }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10">
            <BookOpen className="h-4 w-4 text-amber-500" />
          </div>
          <span className="text-sm font-semibold text-foreground">Notes</span>
        </div>
      </div>
      <p className="line-clamp-5 text-sm leading-relaxed text-muted-foreground">{trip.notes}</p>
    </motion.div>
  );
}
