import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  hasTrips: boolean;
  onClearFilters?: () => void;
}

function GlobeIllustration() {
  const reduced = useReducedMotion();

  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="h-44 w-44" aria-hidden>
      <defs>
        <radialGradient id="tm-globe-fill" cx="50%" cy="42%" r="58%">
          <stop offset="0%" stopColor="hsl(221,83%,53%)" stopOpacity="0.08" />
          <stop offset="100%" stopColor="hsl(262,83%,58%)" stopOpacity="0.03" />
        </radialGradient>
        <linearGradient id="tm-path-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(221,83%,53%)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="hsl(262,83%,58%)" stopOpacity="0.5" />
        </linearGradient>
      </defs>

      {/* Globe body */}
      <circle
        cx="100"
        cy="100"
        r="76"
        fill="url(#tm-globe-fill)"
        stroke="hsl(221,83%,53%)"
        strokeOpacity="0.2"
        strokeWidth="1.2"
      />

      {/* Latitude lines */}
      <ellipse
        cx="100"
        cy="100"
        rx="76"
        ry="28"
        fill="none"
        stroke="hsl(221,83%,53%)"
        strokeOpacity="0.1"
        strokeWidth="1"
      />
      <ellipse
        cx="100"
        cy="100"
        rx="76"
        ry="58"
        fill="none"
        stroke="hsl(221,83%,53%)"
        strokeOpacity="0.08"
        strokeWidth="1"
      />

      {/* Longitude lines */}
      <ellipse
        cx="100"
        cy="100"
        rx="26"
        ry="76"
        fill="none"
        stroke="hsl(221,83%,53%)"
        strokeOpacity="0.1"
        strokeWidth="1"
      />
      <ellipse
        cx="100"
        cy="100"
        rx="58"
        ry="76"
        fill="none"
        stroke="hsl(221,83%,53%)"
        strokeOpacity="0.07"
        strokeWidth="1"
      />

      {/* Equator */}
      <line
        x1="24"
        y1="100"
        x2="176"
        y2="100"
        stroke="hsl(221,83%,53%)"
        strokeOpacity="0.1"
        strokeWidth="1"
      />

      {/* Flight path arc */}
      <path
        d="M 38,138 Q 100,28 162,138"
        fill="none"
        stroke="url(#tm-path-grad)"
        strokeWidth="1.5"
        strokeDasharray="5 4"
      />

      {/* Destination markers */}
      <circle cx="38" cy="138" r="4" fill="hsl(221,83%,53%)" fillOpacity="0.6" />
      <circle cx="162" cy="138" r="4" fill="hsl(262,83%,58%)" fillOpacity="0.6" />

      {/* Pulse rings on markers */}
      <circle
        cx="38"
        cy="138"
        r="8"
        fill="none"
        stroke="hsl(221,83%,53%)"
        strokeOpacity="0.25"
        strokeWidth="1"
      />
      <circle
        cx="162"
        cy="138"
        r="8"
        fill="none"
        stroke="hsl(262,83%,58%)"
        strokeOpacity="0.25"
        strokeWidth="1"
      />

      {/* Animated plane along arc */}
      <motion.g
        animate={
          reduced
            ? {}
            : {
                x: [0, 32, 62, 62, 32, 0],
                y: [0, -48, -28, -28, -48, 0],
              }
        }
        transition={
          reduced
            ? {}
            : {
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
                times: [0, 0.25, 0.5, 0.5, 0.75, 1],
              }
        }
      >
        {/* Plane icon (simple geometric) */}
        <g transform="translate(30, 130)">
          <polygon points="0,-5 10,2 0,0 -10,2" fill="hsl(221,83%,53%)" fillOpacity="0.85" />
          <polygon points="0,0 4,5 0,3 -4,5" fill="hsl(221,83%,53%)" fillOpacity="0.6" />
        </g>
      </motion.g>
    </svg>
  );
}

export function TripsEmptyState({ hasTrips, onClearFilters }: Props) {
  const reduced = useReducedMotion();

  if (hasTrips) {
    return (
      <motion.div
        className="flex flex-col items-center gap-5 rounded-3xl border border-dashed border-border/60 bg-muted/10 py-16 text-center"
        initial={reduced ? {} : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50">
          <svg
            className="h-7 w-7 text-muted-foreground"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>
        <div className="space-y-1">
          <p className="text-base font-semibold text-foreground">No trips match your filters</p>
          <p className="text-sm text-muted-foreground">Try adjusting your search or filter.</p>
        </div>
        {onClearFilters && (
          <Button variant="outline" size="sm" onClick={onClearFilters}>
            Clear filters
          </Button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      className="flex flex-col items-center gap-6 py-16 text-center"
      initial={reduced ? {} : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Illustration */}
      <motion.div
        animate={reduced ? {} : { y: [0, -6, 0] }}
        transition={reduced ? {} : { duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <GlobeIllustration />
      </motion.div>

      {/* Copy */}
      <div className="max-w-xs space-y-2">
        <h3 className="text-xl font-bold tracking-tight text-foreground">Your adventures await</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Plan trips, track budgets, capture memories — all in one place.
        </p>
      </div>

      {/* CTA */}
      <motion.div
        initial={reduced ? {} : { opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.25, type: 'spring', damping: 16, stiffness: 200 }}
      >
        <Button asChild className="border-0 bg-gradient-brand text-white shadow-glow">
          <Link to="/trips/new">
            <Plus className="mr-2 h-4 w-4" />
            Create your first trip
          </Link>
        </Button>
      </motion.div>
    </motion.div>
  );
}
