import { motion, useReducedMotion } from 'framer-motion';
import {
  Sun,
  CloudRain,
  Wind,
  Thermometer,
  CalendarDays,
  Wallet,
  Bell,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { rv, FADE_VARIANTS, LIST_VARIANTS, LIST_ITEM_VARIANTS } from '@/lib/motion';
import { weatherCodeToEmoji, weatherCodeToLabel } from '@/features/weather/utils';
import { formatCurrency } from '@/utils/formatters';
import { MarkdownMessage } from '@/features/ai/components/MarkdownMessage';
import { useMorningBrief } from '../hooks/useMorningBrief';
import { useSmartAlerts } from '../hooks/useSmartAlerts';
import type { TripRow } from '@/features/trips/types';
import type { SmartAlert } from '../hooks/useSmartAlerts';

const SEVERITY_STYLES: Record<SmartAlert['severity'], string> = {
  info: 'border-blue-500/20 bg-blue-500/5 text-blue-700 dark:text-blue-400',
  warning: 'border-amber-500/20 bg-amber-500/8 text-amber-700 dark:text-amber-400',
  critical: 'border-rose-500/25 bg-rose-500/8 text-rose-700 dark:text-rose-400',
};

function AlertPill({ alert }: { alert: SmartAlert }) {
  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-xl border px-3 py-2.5 text-xs',
        SEVERITY_STYLES[alert.severity],
      )}
      role="alert"
    >
      <span className="mt-px shrink-0 text-sm" aria-hidden>
        {alert.emoji}
      </span>
      <div>
        <p className="font-semibold">{alert.title}</p>
        <p className="mt-0.5 font-normal text-muted-foreground">{alert.description}</p>
      </div>
    </div>
  );
}

function WeatherCard({
  weather,
  reduced,
}: {
  weather: NonNullable<ReturnType<typeof useMorningBrief>['weather']>;
  reduced: boolean | null;
}) {
  const emoji = weatherCodeToEmoji(weather.current.weathercode, weather.current.isDay);
  const label = weatherCodeToLabel(weather.current.weathercode);

  return (
    <motion.div
      className="from-blue-500/8 flex flex-col gap-3 rounded-2xl border border-border/50 bg-gradient-to-br via-sky-500/5 to-transparent p-4"
      variants={rv(FADE_VARIANTS, reduced)}
      initial="hidden"
      animate="show"
    >
      <div className="flex items-center gap-2">
        <Sun className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Current Weather
        </p>
      </div>
      <div className="flex items-end gap-3">
        <span className="text-5xl leading-none" aria-hidden>
          {emoji}
        </span>
        <div>
          <p className="text-3xl font-black tabular-nums text-foreground">
            {Math.round(weather.current.temperature)}°
          </p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1">
        {[
          { icon: Thermometer, label: 'Feels', value: `${Math.round(weather.current.feelsLike)}°` },
          {
            icon: CloudRain,
            label: 'Rain',
            value: `${weather.forecast[0]?.precipProbabilityMax ?? 0}%`,
          },
          { icon: Wind, label: 'Wind', value: `${Math.round(weather.current.windspeed)} km/h` },
        ].map(({ icon: Icon, label: lbl, value }) => (
          <div key={lbl} className="rounded-lg bg-muted/30 px-2 py-1.5 text-center">
            <Icon className="mx-auto mb-0.5 h-3 w-3 text-muted-foreground" aria-hidden />
            <p className="text-[10px] text-muted-foreground">{lbl}</p>
            <p className="text-xs font-bold tabular-nums text-foreground">{value}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

interface Props {
  trip: TripRow;
}

export function MorningBrief({ trip }: Props) {
  const reduced = useReducedMotion();
  const brief = useMorningBrief(trip);
  const alerts = useSmartAlerts(trip);

  if (brief.isLoading) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Loading morning brief">
        <Skeleton className="h-8 w-56 rounded-xl" />
        <Skeleton className="h-6 w-32 rounded" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </div>
        <Skeleton className="h-20 rounded-2xl" />
      </div>
    );
  }

  const tripContext =
    brief.dayNumber != null
      ? `Day ${brief.dayNumber} of ${brief.totalDays}`
      : brief.totalDays > 0
        ? `${brief.totalDays} day trip`
        : null;

  return (
    <motion.div
      className="space-y-5"
      variants={rv(LIST_VARIANTS, reduced)}
      initial="hidden"
      animate="show"
    >
      {/* Greeting */}
      <motion.div variants={rv(LIST_ITEM_VARIANTS, reduced)} className="space-y-1">
        <h2 className="text-2xl font-black tracking-tight text-foreground">{brief.greeting}! ✨</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5" aria-hidden />
          <span>{brief.formattedDate}</span>
          {tripContext && (
            <>
              <span className="text-muted-foreground/40">·</span>
              <span className="font-medium text-foreground/70">{tripContext}</span>
            </>
          )}
        </div>
      </motion.div>

      {/* AI Summary */}
      {(brief.aiSummary || brief.isAILoading) && (
        <motion.div
          variants={rv(LIST_ITEM_VARIANTS, reduced)}
          className="rounded-2xl border border-primary/15 bg-primary/5 p-4"
        >
          <div className="mb-2 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-primary/70">
              Your Daily Brief
            </span>
          </div>
          {brief.isAILoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              <span>Personalising your morning brief…</span>
            </div>
          ) : (
            <div className="text-sm leading-relaxed text-foreground/90 [&_em]:italic [&_p]:mb-1 [&_strong]:font-semibold">
              <MarkdownMessage content={brief.aiSummary ?? ''} />
            </div>
          )}
        </motion.div>
      )}

      {/* Smart Alerts */}
      {alerts.length > 0 && (
        <motion.div variants={rv(LIST_ITEM_VARIANTS, reduced)} className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Alerts
          </p>
          <div className="space-y-2">
            {alerts.map((alert) => (
              <AlertPill key={alert.id} alert={alert} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Weather + Budget grid */}
      <motion.div variants={rv(LIST_ITEM_VARIANTS, reduced)} className="grid gap-3 sm:grid-cols-2">
        {brief.weather ? (
          <WeatherCard weather={brief.weather} reduced={reduced} />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border/50 p-6 text-center text-sm text-muted-foreground">
            <Sun className="h-5 w-5 opacity-40" aria-hidden />
            <span>Weather unavailable</span>
          </div>
        )}

        {brief.budgetAnalysis ? (
          <div className="from-emerald-500/8 flex flex-col gap-3 rounded-2xl border border-border/50 bg-gradient-to-br via-teal-500/5 to-transparent p-4">
            <div className="flex items-center gap-2">
              <Wallet className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Budget Today
              </p>
            </div>
            <div>
              <p className="text-3xl font-black tabular-nums text-foreground">
                {formatCurrency(brief.budgetAnalysis.remaining, brief.budgetAnalysis.currency)}
              </p>
              <p className="text-sm text-muted-foreground">remaining</p>
            </div>
            <div className="space-y-1.5">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    brief.budgetAnalysis.status === 'over-budget'
                      ? 'bg-rose-500'
                      : brief.budgetAnalysis.status === 'near-limit'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500',
                  )}
                  style={{ width: `${Math.min(100, brief.budgetAnalysis.percentUsed)}%` }}
                  role="progressbar"
                  aria-valuenow={Math.round(brief.budgetAnalysis.percentUsed)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Budget used"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.round(brief.budgetAnalysis.percentUsed)}% of{' '}
                {formatCurrency(brief.budgetAnalysis.totalBudget, brief.budgetAnalysis.currency)}{' '}
                used
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border/50 p-6 text-center text-sm text-muted-foreground">
            <Wallet className="h-5 w-5 opacity-40" aria-hidden />
            <span>No budget set</span>
          </div>
        )}
      </motion.div>

      {/* Today's Schedule */}
      <motion.div variants={rv(LIST_ITEM_VARIANTS, reduced)} className="space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Today&apos;s Schedule
        </p>
        {brief.todayItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/50 py-8 text-center">
            <CalendarDays className="mx-auto mb-2 h-6 w-6 text-muted-foreground/40" aria-hidden />
            <p className="text-sm text-muted-foreground">No activities scheduled for today</p>
          </div>
        ) : (
          <div className="space-y-2">
            {brief.todayItems.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 rounded-xl border border-border/40 bg-card px-3 py-2.5"
              >
                <span className="mt-px w-14 shrink-0 font-mono text-xs text-muted-foreground">
                  {item.start_time ? item.start_time.slice(0, 5) : '—'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                  {item.location_name && (
                    <p className="truncate text-xs text-muted-foreground">{item.location_name}</p>
                  )}
                </div>
                <span className="shrink-0 text-xs capitalize text-muted-foreground/60">
                  {item.category}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Due Reminders */}
      {brief.todayReminders.length > 0 && (
        <motion.div variants={rv(LIST_ITEM_VARIANTS, reduced)} className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Reminders Due
          </p>
          {brief.todayReminders.slice(0, 3).map((rem) => (
            <div
              key={rem.id}
              className="flex items-center gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2.5"
            >
              <Bell
                className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400"
                aria-hidden
              />
              <p className="text-xs font-medium text-foreground">{rem.title}</p>
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
