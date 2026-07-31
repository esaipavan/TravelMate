import { motion, useReducedMotion } from 'framer-motion';
import { CheckCircle2, Droplets, Eye, Thermometer, Wind } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { rv, CARD_VARIANTS, LIST_VARIANTS, LIST_ITEM_VARIANTS } from '@/lib/motion';
import {
  weatherCodeToEmoji,
  weatherCodeToLabel,
  formatForecastDate,
} from '@/features/weather/utils';
import type { ReactNode } from 'react';
import type { WeatherResult } from '@/features/weather/types';

interface Props {
  weather: WeatherResult | null | undefined;
  seasonNote?: string;
  travelTips?: string[];
  isLoading?: boolean;
}

function uvLabel(uv: number): string {
  if (uv <= 2) return 'Low';
  if (uv <= 5) return 'Moderate';
  if (uv <= 7) return 'High';
  if (uv <= 10) return 'Very High';
  return 'Extreme';
}

function WeatherStat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5 p-4">
      <span className="mt-0.5 shrink-0 text-muted-foreground">{icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}

export function WeatherSection({ weather, seasonNote, travelTips, isLoading }: Props) {
  const reduced = useReducedMotion();

  if (isLoading) {
    return (
      <section id="weather" aria-label="Weather information" className="space-y-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Weather</h2>
          {seasonNote && <p className="mt-1 text-sm text-muted-foreground">{seasonNote}</p>}
        </div>
        <Skeleton className="h-44 w-full rounded-2xl" />
        <div className="flex gap-2.5 overflow-x-auto pb-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-32 min-w-[88px] flex-shrink-0 rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  if (!weather) {
    return (
      <section id="weather" aria-label="Weather information" className="space-y-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Weather</h2>
          {seasonNote && <p className="mt-1 text-sm text-muted-foreground">{seasonNote}</p>}
        </div>
        <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20">
          <p className="text-sm text-muted-foreground">
            Weather data is unavailable for this destination.
          </p>
        </div>
      </section>
    );
  }

  const { current, forecast } = weather;
  const currentEmoji = weatherCodeToEmoji(current.weathercode, current.isDay);
  const currentLabel = weatherCodeToLabel(current.weathercode);

  return (
    <section id="weather" aria-label="Weather information" className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Weather</h2>
        {seasonNote && <p className="mt-1 text-sm text-muted-foreground">{seasonNote}</p>}
      </div>

      {/* ── Current weather ──────────────────────────────────────── */}
      <motion.div
        className="overflow-hidden rounded-2xl border border-border/50 bg-card"
        variants={rv(CARD_VARIANTS, reduced)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-40px' }}
      >
        <div className="grid sm:grid-cols-2">
          {/* Left – big temperature */}
          <div className="flex items-center gap-6 border-b border-border/50 p-6 sm:border-b-0 sm:border-r">
            <span className="text-[4rem] leading-none" role="img" aria-label={currentLabel}>
              {currentEmoji}
            </span>
            <div>
              <div className="flex items-end gap-1 leading-none">
                <span className="text-[3.25rem] font-black tabular-nums">
                  {Math.round(current.temperature)}
                </span>
                <span className="mb-1 text-2xl font-light text-muted-foreground">°C</span>
              </div>
              <p className="mt-1 text-base font-semibold">{currentLabel}</p>
              <p className="text-sm text-muted-foreground">
                Feels like {Math.round(current.feelsLike)}°C
              </p>
            </div>
          </div>

          {/* Right – stats 2×2 grid */}
          <div
            className="grid grid-cols-2 divide-x divide-y divide-border/50"
            role="list"
            aria-label="Current weather statistics"
          >
            <div role="listitem">
              <WeatherStat
                icon={<Droplets className="h-4 w-4" aria-hidden />}
                label="Humidity"
                value={`${current.humidity}%`}
              />
            </div>
            <div role="listitem">
              <WeatherStat
                icon={<Wind className="h-4 w-4" aria-hidden />}
                label="Wind"
                value={`${current.windspeed} km/h`}
              />
            </div>
            <div role="listitem">
              <WeatherStat
                icon={<Eye className="h-4 w-4" aria-hidden />}
                label="UV Index"
                value={`${current.uvIndex} · ${uvLabel(current.uvIndex)}`}
              />
            </div>
            <div role="listitem">
              <WeatherStat
                icon={<Thermometer className="h-4 w-4" aria-hidden />}
                label="Feels Like"
                value={`${Math.round(current.feelsLike)}°C`}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Forecast ─────────────────────────────────────────────── */}
      {forecast.length > 0 && (
        <div>
          <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
            {forecast.length}-Day Forecast
          </h3>
          <div
            className="flex gap-2.5 overflow-x-auto pb-2"
            role="list"
            aria-label={`${forecast.length}-day weather forecast`}
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'hsl(var(--border)) transparent' }}
          >
            {forecast.map((d, i) => {
              const { dayLabel, shortDate } = formatForecastDate(d.date);
              const emoji = weatherCodeToEmoji(d.weathercode, true);
              const label = weatherCodeToLabel(d.weathercode);
              return (
                <motion.div
                  key={d.date}
                  role="listitem"
                  aria-label={`${dayLabel} ${shortDate}: ${label}, high ${d.tempMax}°C low ${d.tempMin}°C`}
                  className="flex min-w-[88px] shrink-0 flex-col items-center gap-2 rounded-xl border border-border/50 bg-card p-3 text-center"
                  variants={rv(CARD_VARIANTS, reduced)}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.045 }}
                >
                  <span className="text-xs font-bold text-foreground">{dayLabel}</span>
                  <span className="text-[11px] text-muted-foreground">{shortDate}</span>
                  <span className="text-2xl leading-none" role="img" aria-label={label}>
                    {emoji}
                  </span>
                  <div>
                    <p className="text-sm font-bold">{Math.round(d.tempMax)}°</p>
                    <p className="text-xs text-muted-foreground">{Math.round(d.tempMin)}°</p>
                  </div>
                  {/* Precipitation probability bar */}
                  <div
                    className="h-1 w-full overflow-hidden rounded-full bg-muted"
                    role="progressbar"
                    aria-label={`${d.precipProbabilityMax}% precipitation chance`}
                    aria-valuenow={d.precipProbabilityMax}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className="h-full rounded-full bg-blue-400/70 transition-all"
                      style={{ width: `${d.precipProbabilityMax}%` }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Travel tips ──────────────────────────────────────────── */}
      {travelTips && travelTips.length > 0 && (
        <div>
          <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
            Travel Tips
          </h3>
          <motion.ul
            className="grid gap-2 sm:grid-cols-2"
            variants={rv(LIST_VARIANTS, reduced)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-30px' }}
          >
            {travelTips.map((tip, i) => (
              <motion.li
                key={i}
                className="flex items-start gap-3 rounded-xl border border-primary/15 bg-primary/5 p-3.5 text-sm text-foreground"
                variants={rv(LIST_ITEM_VARIANTS, reduced)}
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                <span>{tip}</span>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      )}
    </section>
  );
}
