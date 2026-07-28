import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { differenceInDays, parseISO } from 'date-fns';
import { CalendarDays, Clock, CreditCard, Globe, Thermometer } from 'lucide-react';
import { resolveDestinationImageUrl } from '@/utils/destinationTheme';
import { rv, HERO_VARIANTS, FADE_VARIANTS } from '@/lib/motion';
import type { ReactNode } from 'react';
import type { DestinationOverview, WeatherData } from '../types';

interface Props {
  overview: DestinationOverview;
  weather: WeatherData;
  startDate: string;
  endDate: string;
}

function Chip({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 backdrop-blur-sm">
      <span className="text-white/70">{icon}</span>
      <span className="whitespace-nowrap text-xs font-medium text-white/90">{label}</span>
    </div>
  );
}

export function DestinationHero({ overview, weather, startDate, endDate }: Props) {
  const reduced = useReducedMotion();
  const imageUrl = useMemo(
    () => resolveDestinationImageUrl(overview.destination),
    [overview.destination],
  );

  const today = new Date();
  const start = parseISO(startDate + 'T00:00:00');
  const end = parseISO(endDate + 'T00:00:00');
  const daysUntil = differenceInDays(start, today);
  const tripNights = differenceInDays(end, start);

  return (
    <section
      aria-label={`Destination overview for ${overview.destination}`}
      className="relative overflow-hidden rounded-2xl"
      style={{ height: 'clamp(460px, 58vh, 700px)' }}
    >
      {/* Hero image */}
      <motion.div
        className="absolute inset-0"
        variants={rv(HERO_VARIANTS, reduced)}
        initial="hidden"
        animate="show"
      >
        <img
          src={imageUrl}
          alt={`${overview.destination}, ${overview.country}`}
          className="h-full w-full object-cover"
          loading="eager"
          fetchPriority="high"
        />
      </motion.div>

      {/* Gradient layers */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/45 via-transparent to-transparent" />

      {/* ── Top bar ─────────────────────────────────────────────── */}
      <motion.div
        className="absolute left-5 right-5 top-5 flex items-center justify-between sm:left-8 sm:top-7"
        variants={rv(FADE_VARIANTS, reduced)}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.35 }}
      >
        {/* Country chip */}
        <div className="flex items-center gap-2 rounded-full bg-black/30 px-3 py-1.5 backdrop-blur-sm">
          <span className="text-base leading-none" role="img" aria-label={overview.country}>
            {overview.flagEmoji}
          </span>
          <span className="text-xs font-medium text-white/90">{overview.country}</span>
        </div>

        {/* Live weather teaser */}
        <div className="flex items-center gap-2 rounded-full bg-black/30 px-3.5 py-1.5 backdrop-blur-sm">
          <span className="text-base leading-none" aria-hidden>
            {weather.current.icon}
          </span>
          <span className="text-sm font-bold text-white">{weather.current.temp}°C</span>
          <span className="hidden text-xs text-white/70 sm:inline">
            {weather.current.condition}
          </span>
        </div>
      </motion.div>

      {/* ── Bottom content ───────────────────────────────────────── */}
      <div className="absolute inset-x-0 bottom-0 px-5 pb-6 sm:px-8 sm:pb-8">
        {/* Destination name */}
        <motion.h1
          className="font-extrabold leading-none tracking-tight text-white drop-shadow-lg"
          style={{ fontSize: 'clamp(2.8rem, 8vw, 5.5rem)' }}
          variants={rv(FADE_VARIANTS, reduced)}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.1 }}
        >
          {overview.destination}
        </motion.h1>

        {/* Description */}
        <motion.p
          className="mt-3 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-[15px]"
          variants={rv(FADE_VARIANTS, reduced)}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.2 }}
        >
          {overview.description}
        </motion.p>

        {/* Travel style tags */}
        <motion.div
          className="mt-3 flex flex-wrap gap-1.5"
          variants={rv(FADE_VARIANTS, reduced)}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.28 }}
        >
          {overview.travelStyles.map((style) => (
            <span
              key={style}
              className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-white/80 backdrop-blur-sm"
            >
              {style}
            </span>
          ))}
        </motion.div>

        {/* Key facts + countdown */}
        <motion.div
          className="mt-4 flex flex-wrap items-center gap-2"
          variants={rv(FADE_VARIANTS, reduced)}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.36 }}
        >
          <Chip
            icon={<CalendarDays className="h-3 w-3" aria-hidden />}
            label={overview.bestSeason}
          />
          <Chip
            icon={<Thermometer className="h-3 w-3" aria-hidden />}
            label={`${overview.avgTempLow}–${overview.avgTempHigh}°C`}
          />
          <Chip icon={<Clock className="h-3 w-3" aria-hidden />} label={overview.timezoneOffset} />
          <Chip
            icon={<CreditCard className="h-3 w-3" aria-hidden />}
            label={`${overview.currencyCode} (${overview.currencySymbol})`}
          />
          <Chip icon={<Globe className="h-3 w-3" aria-hidden />} label={overview.language} />

          {/* Trip countdown */}
          {daysUntil > 0 && (
            <div className="ml-auto rounded-full bg-primary/80 px-3.5 py-1.5 backdrop-blur-sm">
              <span className="text-xs font-semibold text-primary-foreground">
                {daysUntil}d away · {tripNights} night{tripNights !== 1 ? 's' : ''}
              </span>
            </div>
          )}
          {daysUntil === 0 && (
            <div className="ml-auto rounded-full bg-emerald-500/85 px-3.5 py-1.5 backdrop-blur-sm">
              <span className="text-xs font-bold text-white">Trip starts today!</span>
            </div>
          )}
          {daysUntil < 0 && daysUntil > -tripNights && (
            <div className="ml-auto rounded-full bg-emerald-600/75 px-3.5 py-1.5 backdrop-blur-sm">
              <span className="text-xs font-semibold text-white">
                In progress · {tripNights + daysUntil}d remaining
              </span>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
