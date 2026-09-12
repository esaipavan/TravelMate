import { useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { differenceInDays, parseISO } from 'date-fns';
import { CalendarDays, Clock, CreditCard, Globe, Thermometer } from 'lucide-react';
import { resolveDestinationImageUrl, isGenericTempleCover } from '@/utils/destinationTheme';
import { usePlaceGallery } from '@/hooks/usePlaceGallery';
import { rv, HERO_VARIANTS, FADE_VARIANTS } from '@/lib/motion';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import type { WeatherResult } from '@/features/weather/types';
import type { DestinationOverview } from '../types';

interface Props {
  overview: DestinationOverview;
  weather: WeatherResult | null | undefined;
  startDate: string;
  endDate: string;
}

function wmoEmoji(code: number, isDay: boolean): string {
  if (code === 0) return isDay ? '☀️' : '🌙';
  if (code <= 3) return isDay ? '⛅' : '🌙';
  if (code <= 48) return '🌫️';
  if (code <= 57) return '🌦️';
  if (code <= 67) return '🌧️';
  if (code <= 77) return '❄️';
  if (code <= 82) return '🌦️';
  if (code <= 86) return '🌨️';
  return '⛈️';
}

function wmoLabel(code: number): string {
  if (code === 0) return 'Clear sky';
  if (code <= 3) return 'Partly cloudy';
  if (code <= 48) return 'Foggy';
  if (code <= 57) return 'Drizzle';
  if (code <= 67) return 'Rain';
  if (code <= 77) return 'Snow';
  if (code <= 82) return 'Rain showers';
  if (code <= 86) return 'Snow showers';
  return 'Thunderstorm';
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
  const [activeImage, setActiveImage] = useState(0);
  const curated = useMemo(
    () => resolveDestinationImageUrl(overview.destination),
    [overview.destination],
  );
  // No curated image, or only the generic temple-gopuram stand-in → try real,
  // place-specific Wikipedia photos (e.g. the actual Tirumala temple for
  // Tirupati). Gallery (not just a single image) so this hero can show more
  // than one real photo when Wikipedia has them, same verified source
  // DestinationOverview already uses — never a guessed image.
  const wantsRealPhoto = !curated || isGenericTempleCover(curated);
  const { images } = usePlaceGallery(overview.destination, { enabled: wantsRealPhoto });
  const enriched = images[Math.min(activeImage, images.length - 1)];
  const imageUrl = wantsRealPhoto ? (enriched?.url ?? curated) : curated;
  // The thumbnail strip only ever applies to the enriched (Wikipedia) photos
  // — a curated cover is a single hand-picked image, not a gallery.
  const showGallery = wantsRealPhoto && images.length > 1;

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
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${overview.destination}, ${overview.country}`}
            className="h-full w-full object-cover"
            loading="eager"
            fetchPriority="high"
          />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background:
                'linear-gradient(135deg, rgba(99,102,241,0.75) 0%, rgba(139,92,246,0.55) 100%)',
            }}
            role="img"
            aria-label={`${overview.destination}, ${overview.country}`}
          />
        )}
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
        {weather?.current && (
          <div className="flex items-center gap-2 rounded-full bg-black/30 px-3.5 py-1.5 backdrop-blur-sm">
            <span className="text-base leading-none" aria-hidden>
              {wmoEmoji(weather.current.weathercode, weather.current.isDay ?? true)}
            </span>
            <span className="text-sm font-bold text-white">
              {Math.round(weather.current.temperature)}°C
            </span>
            <span className="hidden text-xs text-white/70 sm:inline">
              {wmoLabel(weather.current.weathercode)}
            </span>
          </div>
        )}
      </motion.div>

      {/* ── Photo strip — only when the SAME verified Wikipedia article
          yielded more than one real photo (never shown for a single-image
          curated cover). Positioned clear of the top bar above and the
          dense bottom content panel below. ── */}
      {showGallery && (
        <motion.div
          className="absolute right-5 top-16 z-10 flex gap-1.5 sm:right-8 sm:top-20"
          variants={rv(FADE_VARIANTS, reduced)}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.4 }}
          role="group"
          aria-label={`${images.length} photos of ${overview.destination}`}
        >
          {images.slice(0, 5).map((img, i) => (
            <button
              key={img.url}
              type="button"
              onClick={() => setActiveImage(i)}
              className={cn(
                'h-9 w-9 shrink-0 overflow-hidden rounded-lg ring-2 backdrop-blur-sm transition-opacity',
                i === activeImage ? 'ring-white' : 'opacity-70 ring-white/30 hover:opacity-100',
              )}
              aria-label={`Show photo ${i + 1} of ${images.length}`}
              aria-current={i === activeImage}
            >
              <img src={img.url} alt="" className="h-full w-full object-cover" loading="lazy" />
            </button>
          ))}
        </motion.div>
      )}

      {/* Source attribution for the enriched photo — lets a user confirm
          where a verified image actually came from, not just trust a badge. */}
      {wantsRealPhoto && enriched && (
        <a
          href={enriched.wikipediaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'absolute z-10 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-medium text-white/80 backdrop-blur-sm transition-colors hover:bg-black/60 hover:text-white',
            showGallery
              ? 'right-5 top-28 sm:right-8 sm:top-32'
              : 'right-5 top-16 sm:right-8 sm:top-20',
          )}
          title={`View source: ${enriched.wikipediaTitle} on Wikipedia`}
        >
          Photo: Wikipedia
        </a>
      )}

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
