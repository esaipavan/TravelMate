import { motion, useReducedMotion } from 'framer-motion';
import { CheckCircle2, Droplets, Eye, Thermometer, Wind } from 'lucide-react';
import { rv, CARD_VARIANTS, LIST_VARIANTS, LIST_ITEM_VARIANTS } from '@/lib/motion';
import type { ReactNode } from 'react';
import type { WeatherData } from '../types';

interface Props {
  weather: WeatherData;
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

export function WeatherSection({ weather }: Props) {
  const reduced = useReducedMotion();
  const { current, forecast, seasonNote, recommendations } = weather;

  return (
    <section id="weather" aria-label="Weather information" className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Weather</h2>
        <p className="mt-1 text-sm text-muted-foreground">{seasonNote}</p>
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
            <span className="text-[4rem] leading-none" role="img" aria-label={current.condition}>
              {current.icon}
            </span>
            <div>
              <div className="flex items-end gap-1 leading-none">
                <span className="text-[3.25rem] font-black tabular-nums">{current.temp}</span>
                <span className="mb-1 text-2xl font-light text-muted-foreground">°C</span>
              </div>
              <p className="mt-1 text-base font-semibold">{current.condition}</p>
              <p className="text-sm text-muted-foreground">Feels like {current.feelsLike}°C</p>
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
                value={`${current.windKmh} km/h`}
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
                value={`${current.feelsLike}°C`}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── 7-day forecast ───────────────────────────────────────── */}
      <div>
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
          7-Day Forecast
        </h3>
        <div
          className="flex gap-2.5 overflow-x-auto pb-2"
          role="list"
          aria-label="7-day weather forecast"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'hsl(var(--border)) transparent' }}
        >
          {forecast.map((d, i) => (
            <motion.div
              key={d.dateStr}
              role="listitem"
              aria-label={`${d.dayLabel} ${d.dateStr}: ${d.condition}, high ${d.high}°C low ${d.low}°C`}
              className="flex min-w-[88px] shrink-0 flex-col items-center gap-2 rounded-xl border border-border/50 bg-card p-3 text-center"
              variants={rv(CARD_VARIANTS, reduced)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              transition={{ delay: i * 0.045 }}
            >
              <span className="text-xs font-bold text-foreground">{d.dayLabel}</span>
              <span className="text-[11px] text-muted-foreground">{d.dateStr}</span>
              <span className="text-2xl leading-none" role="img" aria-label={d.condition}>
                {d.icon}
              </span>
              <div>
                <p className="text-sm font-bold">{d.high}°</p>
                <p className="text-xs text-muted-foreground">{d.low}°</p>
              </div>
              {/* Precipitation bar */}
              <div
                className="h-1 w-full overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-label={`${d.precipPct}% precipitation chance`}
                aria-valuenow={d.precipPct}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full bg-blue-400/70 transition-all"
                  style={{ width: `${d.precipPct}%` }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Travel tips ──────────────────────────────────────────── */}
      {recommendations.length > 0 && (
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
            {recommendations.map((tip, i) => (
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
