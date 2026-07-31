import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { MapPin, Calendar, ArrowRight, PlaneTakeoff } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { differenceInDays, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { rv, HERO_VARIANTS } from '@/lib/motion';
import { getTripStatus } from '@/utils/tripStatus';
import { formatDateRange } from '@/utils/formatters';
import { useCurrentTrip, useUpcomingTrips } from '../hooks/useDashboard';
import { useDestinationTheme } from '../hooks/useDestinationTheme';
import { useWeather } from '@/features/weather/hooks/useWeather';
import { DestinationImage } from './DestinationImage';

const RING_R = 42;
const RING_CIRC = 2 * Math.PI * RING_R;

function weatherEmoji(code: number): string {
  if (code === 0) return '☀️';
  if (code <= 2) return '🌤️';
  if (code <= 3) return '⛅';
  if (code <= 48) return '🌫️';
  if (code <= 57) return '🌦️';
  if (code <= 67) return '🌧️';
  if (code <= 77) return '❄️';
  if (code <= 82) return '🌨️';
  return '⛈️';
}

interface StatusPillProps {
  label: string;
  variant: 'live' | 'upcoming' | 'neutral';
}

function StatusPill({ label, variant }: StatusPillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
        variant === 'live' && 'bg-emerald-500/20 text-emerald-300',
        variant === 'upcoming' && 'bg-blue-500/20 text-blue-200',
        variant === 'neutral' && 'bg-white/10 text-white/70',
      )}
    >
      {variant === 'live' && (
        <span
          className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400"
          aria-hidden="true"
        />
      )}
      {label}
    </span>
  );
}

interface WeatherBadgeProps {
  temp: number;
  code: number;
}

function WeatherBadge({ temp, code }: WeatherBadgeProps) {
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-black/30 px-3 py-1 text-sm text-white backdrop-blur-sm">
      <span aria-hidden="true">{weatherEmoji(code)}</span>
      <span className="font-semibold tabular-nums">{Math.round(temp)}°C</span>
    </div>
  );
}

interface ProgressRingProps {
  progress: number;
  label: string;
  accent: string;
  reduced: boolean | null;
}

function ProgressRing({ progress, label, accent, reduced }: ProgressRingProps) {
  const clamped = Math.min(Math.max(progress, 0), 1);
  const offset = RING_CIRC * (1 - clamped);

  return (
    <div
      className="relative h-20 w-20 shrink-0"
      aria-label={`Trip progress: ${Math.round(clamped * 100)}%`}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle
          cx="50"
          cy="50"
          r={RING_R}
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="6"
        />
        <motion.circle
          cx="50"
          cy="50"
          r={RING_R}
          fill="none"
          stroke={accent}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={RING_CIRC}
          initial={{ strokeDashoffset: RING_CIRC }}
          animate={{ strokeDashoffset: offset }}
          transition={
            reduced ? { duration: 0 } : { duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.5 }
          }
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-lg font-bold tabular-nums leading-none text-white">
          {Math.round(clamped * 100)}%
        </span>
        <span className="mt-0.5 text-[9px] leading-none text-white/60">{label}</span>
      </div>
    </div>
  );
}

function HeroSkeleton() {
  return <Skeleton className="-mx-4 -mt-4 min-h-[460px] rounded-none lg:-mx-6 lg:-mt-6" />;
}

export function TripCommandHero() {
  const reduced = useReducedMotion();
  const { data: currentTrip, isLoading: loadingCurr } = useCurrentTrip();
  const { data: upcomingTrips = [], isLoading: loadingUp } = useUpcomingTrips();

  const displayTrip = currentTrip ?? upcomingTrips[0] ?? null;
  const destination = displayTrip?.destination ?? '';
  const theme = useDestinationTheme(destination || 'travel');
  const { data: weather } = useWeather(destination);

  if (loadingCurr || loadingUp) return <HeroSkeleton />;

  // Countdown + progress
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let progress = 0;
  let countdownN = 0;
  let countdownL = '';
  let tripStatus: 'live' | 'upcoming' | 'neutral' = 'neutral';

  if (displayTrip) {
    const st = getTripStatus(displayTrip);
    const startDate = parseISO(displayTrip.start_date + 'T00:00:00');
    const endDate = parseISO(displayTrip.end_date + 'T00:00:00');

    if (st === 'active') {
      tripStatus = 'live';
      countdownN = Math.max(0, differenceInDays(endDate, today));
      countdownL = countdownN === 1 ? 'day left' : 'days left';
      const total = Math.max(1, differenceInDays(endDate, startDate) + 1);
      const elapsed = Math.max(0, differenceInDays(today, startDate));
      progress = elapsed / total;
    } else if (st === 'upcoming') {
      tripStatus = 'upcoming';
      countdownN = Math.max(0, differenceInDays(startDate, today));
      countdownL = countdownN === 1 ? 'day until departure' : 'days until departure';
      progress = 0;
    }
  }

  const noTrip = !displayTrip;

  return (
    <motion.div
      className="relative -mx-4 -mt-4 min-h-[460px] overflow-hidden lg:-mx-6 lg:-mt-6"
      variants={rv(HERO_VARIANTS, reduced)}
      initial="hidden"
      animate="show"
    >
      {/* Background image — prefer the URL stored in the DB so all pages agree */}
      <DestinationImage
        src={displayTrip?.cover_image_url ?? theme.imageUrl}
        alt={destination || 'Travel destination'}
        fallbackAccent={theme.accent}
      />

      {/* Dark gradient overlay */}
      <div
        className="absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            'linear-gradient(to top, rgba(0,0,0,0.90) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.10) 100%)',
        }}
      />

      {/* Content */}
      <div className="relative flex h-full min-h-[460px] flex-col justify-between p-6 lg:p-8">
        {/* Top row: status + weather */}
        <div className="flex items-start justify-between">
          {displayTrip ? (
            <StatusPill
              label={tripStatus === 'live' ? 'Live trip' : 'Upcoming'}
              variant={tripStatus}
            />
          ) : (
            <StatusPill label="Plan your next trip" variant="neutral" />
          )}

          {weather && (
            <WeatherBadge temp={weather.current.temperature} code={weather.current.weathercode} />
          )}
        </div>

        {/* Bottom row: destination info + ring or CTA */}
        {noTrip ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl">
                Where to next?
              </h1>
              <p className="mt-2 text-sm text-white/60">
                Plan your next adventure and start exploring.
              </p>
            </div>
            <Link
              to="/trips/new"
              className={cn(
                'inline-flex shrink-0 items-center gap-2 rounded-2xl px-5 py-3',
                'bg-card text-sm font-semibold text-foreground shadow-lg',
                'transition-transform hover:scale-[1.03] active:scale-[0.97]',
              )}
            >
              <PlaneTakeoff className="h-4 w-4" aria-hidden="true" />
              Plan a trip
            </Link>
          </div>
        ) : (
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              {/* Destination */}
              <div className="mb-1 flex items-center gap-1.5 text-xs text-white/60">
                <MapPin className="h-3 w-3" aria-hidden="true" />
                <span className="truncate font-medium uppercase tracking-wide">
                  {displayTrip.destination}
                </span>
              </div>

              <h1 className="truncate text-3xl font-bold leading-tight text-white sm:text-4xl">
                {displayTrip.title}
              </h1>

              {/* Dates */}
              <div className="mt-2 flex items-center gap-1.5 text-xs text-white/60">
                <Calendar className="h-3 w-3" aria-hidden="true" />
                <span>{formatDateRange(displayTrip.start_date, displayTrip.end_date)}</span>
              </div>

              {/* Countdown */}
              <div className="mt-3 flex items-center gap-3">
                <span
                  className="text-4xl font-bold tabular-nums leading-none text-white"
                  aria-label={`${countdownN} ${countdownL}`}
                >
                  {countdownN}
                </span>
                <span className="text-sm leading-snug text-white/60">{countdownL}</span>
              </div>

              {/* CTA */}
              <Link
                to={`/trips/${displayTrip.id}`}
                className={cn(
                  'mt-4 inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold',
                  'border border-white/20 bg-white/10 text-white backdrop-blur-sm',
                  'transition-colors hover:bg-white/20',
                )}
              >
                Continue Journey
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>

            {/* Progress ring */}
            {tripStatus === 'live' && (
              <ProgressRing
                progress={progress}
                label="done"
                accent={theme.accent}
                reduced={reduced}
              />
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
