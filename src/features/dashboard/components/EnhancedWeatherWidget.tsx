import { motion, useReducedMotion } from 'framer-motion';
import {
  Sun,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudSnow,
  Zap,
  Droplets,
  Wind,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { rv, CARD_VARIANTS } from '@/lib/motion';
import { Skeleton } from '@/components/ui/skeleton';
import { useWeather } from '@/features/weather/hooks/useWeather';
import { useCurrentTrip, useUpcomingTrips } from '../hooks/useDashboard';
import type { LucideIcon } from 'lucide-react';

function getWeatherIcon(code: number): LucideIcon {
  if (code <= 2) return Sun;
  if (code <= 3) return Cloud;
  if (code <= 57) return CloudDrizzle;
  if (code <= 67) return CloudRain;
  if (code <= 77) return CloudSnow;
  if (code <= 82) return CloudRain;
  return Zap;
}

function getWeatherLabel(code: number): string {
  if (code === 0) return 'Clear sky';
  if (code <= 2) return 'Mainly clear';
  if (code <= 3) return 'Partly cloudy';
  if (code <= 48) return 'Foggy';
  if (code <= 57) return 'Drizzle';
  if (code <= 67) return 'Rain';
  if (code <= 77) return 'Snow';
  if (code <= 82) return 'Rain showers';
  return 'Thunderstorm';
}

function formatSunTime(isoStr: string): string {
  if (!isoStr) return '--:--';
  try {
    return new Date(isoStr).toLocaleTimeString('en', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '--:--';
  }
}

function WeatherStat({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-xl bg-muted/40 px-1.5 py-2.5">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <span className="text-xs font-semibold tabular-nums text-foreground">{value}</span>
    </div>
  );
}

export function EnhancedWeatherWidget() {
  const reduced = useReducedMotion();
  const { data: currentTrip } = useCurrentTrip();
  const { data: upcomingTrips = [] } = useUpcomingTrips();

  const displayTrip = currentTrip ?? upcomingTrips[0] ?? null;
  const destination = displayTrip?.destination ?? '';
  const { data, isLoading, isError } = useWeather(destination);

  if (!destination) {
    return (
      <motion.section
        aria-label="Weather"
        className="flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-2xl border border-border/50 bg-card p-5"
        variants={rv(CARD_VARIANTS, reduced)}
        initial="hidden"
        animate="show"
      >
        <Sun className="h-8 w-8 text-muted-foreground/40" aria-hidden="true" />
        <p className="text-center text-sm text-muted-foreground">
          Start a trip to see destination weather.
        </p>
      </motion.section>
    );
  }

  if (isLoading) {
    return (
      <motion.section
        aria-label="Weather loading"
        className="space-y-3 rounded-2xl border border-border/50 bg-card p-5"
        variants={rv(CARD_VARIANTS, reduced)}
        initial="hidden"
        animate="show"
      >
        <Skeleton className="h-3 w-32" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-14 w-14 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      </motion.section>
    );
  }

  if (isError || !data) {
    return (
      <motion.section
        aria-label="Weather"
        className="flex min-h-[80px] items-center gap-3 rounded-2xl border border-border/50 bg-card p-5"
        variants={rv(CARD_VARIANTS, reduced)}
        initial="hidden"
        animate="show"
      >
        <Sun className="h-5 w-5 text-muted-foreground/40" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">Weather unavailable for {destination}.</p>
      </motion.section>
    );
  }

  const { current, location } = data;
  const WeatherIcon = getWeatherIcon(current.weathercode);
  const label = getWeatherLabel(current.weathercode);
  const isSun = current.weathercode <= 2;

  return (
    <motion.section
      aria-label={`Weather in ${location.displayName || destination}`}
      className="rounded-2xl border border-border/50 bg-card p-5"
      variants={rv(CARD_VARIANTS, reduced)}
      initial="hidden"
      animate="show"
    >
      {/* Location label */}
      <p className="mb-3 truncate text-xs font-medium text-muted-foreground">
        {location.displayName || destination}
      </p>

      {/* Main display */}
      <div className="mb-4 flex items-center gap-4">
        <motion.div
          className={cn(
            'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl',
            isSun ? 'bg-amber-500/10' : 'bg-muted/50',
          )}
          animate={reduced ? {} : isSun ? { rotate: 360 } : { x: [0, 2, 0, -2, 0] }}
          transition={
            reduced
              ? {}
              : isSun
                ? { duration: 20, repeat: Infinity, ease: 'linear' }
                : { duration: 6, repeat: Infinity, ease: 'easeInOut' }
          }
        >
          <WeatherIcon
            className={cn('h-7 w-7', isSun ? 'text-amber-500' : 'text-muted-foreground')}
            aria-hidden="true"
          />
        </motion.div>
        <div>
          <div className="text-3xl font-bold tabular-nums leading-none text-foreground">
            {Math.round(current.temperature)}°C
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {label} · Feels {Math.round(current.feelsLike)}°C
          </div>
        </div>
      </div>

      {/* Stat grid */}
      <div className="mb-4 grid grid-cols-3 gap-2">
        <WeatherStat icon={Droplets} label="Humidity" value={`${current.humidity}%`} />
        <WeatherStat icon={Wind} label="Wind" value={`${Math.round(current.windspeed)} km/h`} />
        <WeatherStat icon={Eye} label="UV Index" value={String(current.uvIndex)} />
      </div>

      {/* Sunrise / Sunset */}
      <div className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2 text-xs">
        <div className="flex items-center gap-1.5 text-amber-500">
          <span aria-hidden className="text-sm">
            🌅
          </span>
          <span className="font-medium">{formatSunTime(current.sunrise)}</span>
          <span className="text-muted-foreground">Sunrise</span>
        </div>
        <div className="mx-2 h-px flex-1 bg-border/50" aria-hidden="true" />
        <div className="flex items-center gap-1.5 text-orange-400">
          <span className="text-muted-foreground">Sunset</span>
          <span className="font-medium">{formatSunTime(current.sunset)}</span>
          <span aria-hidden className="text-sm">
            🌇
          </span>
        </div>
      </div>
    </motion.section>
  );
}
