import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { differenceInDays, parseISO } from 'date-fns';
import { MapPin, Calendar, ArrowRight, Plane, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { formatDateRange } from '@/utils/formatters';
import { getTripStatus } from '@/utils/tripStatus';
import { resolveTripCoverImage } from '@/utils/destinationTheme';
import type { UpcomingTrip } from '../types';

/* ── Countdown hook ───────────────────────────────────────────── */
interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function useCountdown(isoDateStr: string | null): Countdown | null {
  const [left, setLeft] = useState<Countdown | null>(null);

  useEffect(() => {
    if (!isoDateStr) return;
    const compute = () => {
      const now = Date.now();
      const target = new Date(isoDateStr + 'T00:00:00').getTime();
      const diff = target - now;
      if (diff <= 0) {
        setLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setLeft({
        days: Math.floor(diff / 86_400_000),
        hours: Math.floor((diff % 86_400_000) / 3_600_000),
        minutes: Math.floor((diff % 3_600_000) / 60_000),
        seconds: Math.floor((diff % 60_000) / 1_000),
      });
    };
    compute();
    const id = setInterval(compute, 1_000);
    return () => clearInterval(id);
  }, [isoDateStr]);

  return left;
}

/* ── Progress ring ────────────────────────────────────────────── */
function ProgressRing({ pct }: { pct: number }) {
  const reduced = useReducedMotion();
  const size = 68;
  const sw = 5;
  const r = (size - sw) / 2;
  const cx = size / 2;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0 -rotate-90"
        aria-hidden
      >
        <defs>
          <linearGradient id="tm-progress-ring" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(221,83%,53%)" />
            <stop offset="100%" stopColor="hsl(262,83%,58%)" />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={sw}
          className="text-muted/30"
        />
        {/* Arc */}
        <motion.circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke="url(#tm-progress-ring)"
          strokeWidth={sw}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: pct / 100 }}
          transition={
            reduced ? { duration: 0 } : { duration: 1.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }
          }
        />
      </svg>
      <span className="relative z-10 text-xs font-bold tabular-nums text-foreground">{pct}%</span>
    </div>
  );
}

/* ── Countdown display ────────────────────────────────────────── */
function CountdownDisplay({ cd }: { cd: Countdown }) {
  const units: Array<{ v: number; label: string }> = [
    { v: cd.days, label: 'd' },
    { v: cd.hours, label: 'h' },
    { v: cd.minutes, label: 'm' },
  ];

  return (
    <div className="flex items-center gap-2">
      {units.map(({ v, label }) => (
        <div key={label} className="flex items-baseline gap-0.5">
          <span className="text-lg font-bold tabular-nums leading-none text-foreground">
            {String(v).padStart(2, '0')}
          </span>
          <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Gradient fallback for cover ──────────────────────────────── */
const GRADIENTS = [
  'from-blue-500 to-cyan-400',
  'from-violet-500 to-purple-400',
  'from-emerald-500 to-teal-400',
  'from-rose-500 to-pink-400',
  'from-amber-500 to-orange-400',
];
function gradientForTrip(id: string) {
  return GRADIENTS[id.charCodeAt(0) % GRADIENTS.length];
}

/* ── Props ────────────────────────────────────────────────────── */
interface Props {
  trip: UpcomingTrip | null;
  isLoading: boolean;
  _isActive?: boolean;
}

/* ── CurrentTripCard ──────────────────────────────────────────── */
export function CurrentTripCard({ trip, isLoading }: Props) {
  const reduced = useReducedMotion();

  /* Countdown — only active for upcoming trips */
  const status = trip ? getTripStatus(trip) : null;
  const countdownDate = status === 'upcoming' ? (trip?.start_date ?? null) : null;
  const cd = useCountdown(countdownDate);

  /* ── Loading state ── */
  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-3xl border border-border/40 bg-card shadow-float">
        <Skeleton className="h-40 w-full rounded-none" />
        <div className="space-y-3 p-6">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      </div>
    );
  }

  /* ── Empty state ── */
  if (!trip) {
    return (
      <motion.div
        className="relative overflow-hidden rounded-3xl border border-dashed border-border/60 bg-muted/20 p-8 text-center"
        initial={reduced ? {} : { opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.04]">
          <Plane className="h-48 w-48 rotate-12 text-primary" />
        </div>
        <div className="relative space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand shadow-glow">
            <Plane className="h-7 w-7 text-white" />
          </div>
          <div className="space-y-1.5">
            <p className="text-lg font-semibold text-foreground">No trips planned</p>
            <p className="text-sm text-muted-foreground">Start planning your next adventure.</p>
          </div>
          <Button asChild size="sm" className="border-0 bg-gradient-brand text-white shadow-glow">
            <Link to="/trips/new">
              <Sparkles className="mr-2 h-4 w-4" />
              Create a trip
            </Link>
          </Button>
        </div>
      </motion.div>
    );
  }

  /* ── Trip data ── */
  const today = parseISO(new Date().toISOString().split('T')[0] + 'T00:00:00');
  const start = parseISO(trip.start_date + 'T00:00:00');
  const end = parseISO(trip.end_date + 'T00:00:00');
  const totalDays = differenceInDays(end, start) + 1;
  const daysPassed = Math.max(0, differenceInDays(today, start));
  const daysLeft = Math.max(0, differenceInDays(end, today));
  const progress =
    status === 'active' ? Math.min(100, Math.round((daysPassed / totalDays) * 100)) : 0;
  const gradient = gradientForTrip(trip.id);
  const cover = resolveTripCoverImage(trip.destination, trip.cover_image_url);
  const isActive = status === 'active';
  const isUpcoming = status === 'upcoming';

  /* ── Filled card ── */
  return (
    <motion.div
      className="group relative overflow-hidden rounded-3xl border border-border/40 bg-card shadow-float"
      whileHover={
        reduced
          ? {}
          : {
              y: -4,
              boxShadow: '0 28px 70px -12px rgba(0,0,0,0.15), 0 6px 20px -6px rgba(0,0,0,0.08)',
            }
      }
      transition={{ type: 'spring', damping: 20, stiffness: 260 }}
    >
      {/* Glass reflection sweep on hover */}
      <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-3xl">
        <div
          className="absolute inset-y-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent transition-all duration-700"
          style={{ left: '-80%' }}
          onMouseEnter={() => {}}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-3xl group-hover:[&>div]:!left-[140%]">
        <div
          className="absolute inset-y-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent transition-all duration-700"
          style={{ left: '-80%' }}
        />
      </div>

      {/* Cover / gradient header */}
      <div className="relative h-36 overflow-hidden">
        {cover ? (
          <img
            src={cover}
            alt={trip.destination}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className={cn('h-full w-full bg-gradient-to-br', gradient)}>
            <div className="absolute inset-0 flex items-end p-4">
              <Plane className="h-12 w-12 rotate-12 text-white/20" />
            </div>
          </div>
        )}

        {/* Layered depth overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-card/70" />

        {/* Live status chip */}
        <div className="absolute left-4 top-4">
          <Badge
            className={cn(
              'border-0 text-[10px] font-semibold uppercase tracking-wide text-white shadow-md',
              isActive && 'bg-emerald-500',
              isUpcoming && 'bg-primary',
              !isActive && !isUpcoming && 'bg-muted-foreground',
            )}
          >
            {isActive && (
              <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            )}
            {isActive ? 'Live' : isUpcoming ? 'Upcoming' : (status ?? '')}
          </Badge>
        </div>

        {/* Progress ring overlaid on cover (active trips) */}
        {isActive && (
          <div className="absolute bottom-3 right-4 rounded-2xl bg-card/80 p-1.5 ring-1 ring-white/10 backdrop-blur-md">
            <ProgressRing pct={progress} />
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="space-y-3 p-5">
        <div className="space-y-1">
          <h3 className="line-clamp-1 text-xl font-bold tracking-tight text-foreground">
            {trip.title}
          </h3>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span>{trip.destination}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          <span>{formatDateRange(trip.start_date, trip.end_date)}</span>
          <span className="mx-1 text-border">·</span>
          <span>
            {totalDays} day{totalDays !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Active trip: progress text */}
        {isActive && (
          <div className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-foreground">
                Day {daysPassed + 1} of {totalDays}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold tabular-nums text-primary">{progress}%</span>
              <p className="text-[10px] text-muted-foreground">complete</p>
            </div>
          </div>
        )}

        {/* Upcoming trip: countdown */}
        {isUpcoming && cd && (
          <div className="rounded-xl bg-primary/5 px-3 py-2 ring-1 ring-primary/10">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-primary/70">
              Departing in
            </p>
            <CountdownDisplay cd={cd} />
          </div>
        )}

        <Button asChild variant="outline" size="sm" className="group/btn w-full">
          <Link to={`/trips/${trip.id}`}>
            View trip
            <ArrowRight className="ml-2 h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}
