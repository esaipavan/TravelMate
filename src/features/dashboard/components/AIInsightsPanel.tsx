import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Sparkles,
  Sun,
  CloudRain,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  Plane,
  ArrowRight,
} from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { rv, CARD_VARIANTS } from '@/lib/motion';
import { formatCurrency } from '@/utils/formatters';
import { getTripStatus } from '@/utils/tripStatus';
import { useCurrentTrip, useDashboardStats, useUpcomingTrips } from '../hooks/useDashboard';
import { useWeather } from '@/features/weather/hooks/useWeather';
import type { LucideIcon } from 'lucide-react';

interface Insight {
  type: 'good' | 'warn' | 'info' | 'tip';
  icon: LucideIcon;
  title: string;
  body: string;
}

const ICON_COLOR: Record<Insight['type'], string> = {
  good: 'text-emerald-500',
  warn: 'text-amber-500',
  info: 'text-blue-500',
  tip: 'text-violet-500',
};

const ICON_BG: Record<Insight['type'], string> = {
  good: 'bg-emerald-500/10',
  warn: 'bg-amber-500/10',
  info: 'bg-blue-500/10',
  tip: 'bg-violet-500/10',
};

const TIPS = [
  'Carry a reusable water bottle to stay hydrated on the go.',
  'Use offline maps in case of poor connectivity in remote areas.',
  'Keep digital copies of your passport and important documents.',
  'Try local street food for an authentic culinary experience.',
  'Respect local customs and dress codes when visiting temples.',
  'Book popular attractions in advance to skip long queues.',
  'Use public transport for a more immersive local experience.',
];

export function AIInsightsPanel() {
  const reduced = useReducedMotion();
  const { data: currentTrip } = useCurrentTrip();
  const { data: upcomingTrips = [] } = useUpcomingTrips();
  const { data: stats } = useDashboardStats();

  const displayTrip = currentTrip ?? upcomingTrips[0] ?? null;
  const { data: weather } = useWeather(displayTrip?.destination ?? '');

  const insights: Insight[] = [];

  // 1. Weather
  if (weather) {
    const code = weather.current.weathercode;
    const temp = Math.round(weather.current.temperature);
    const isRainy = code >= 51 && code <= 82;
    const isClear = code <= 2;
    insights.push({
      type: isRainy ? 'warn' : 'good',
      icon: isRainy ? CloudRain : Sun,
      title: 'Weather Today',
      body: isRainy
        ? `${temp}°C with rain expected. Pack an umbrella!`
        : `${temp}°C and ${isClear ? 'clear skies' : 'partly cloudy'}. Great for exploring.`,
    });
  }

  // 2. Budget
  if (stats && stats.totalBudget > 0) {
    const pct = stats.totalExpenses / stats.totalBudget;
    const remaining = stats.totalBudget - stats.totalExpenses;
    const isOver = pct > 1;
    const isHigh = pct > 0.85;
    insights.push({
      type: isOver || isHigh ? 'warn' : 'good',
      icon: isOver || isHigh ? TrendingDown : TrendingUp,
      title: 'Budget Insight',
      body: isOver
        ? `Over budget by ${formatCurrency(Math.abs(remaining), stats.homeCurrency)}.`
        : isHigh
          ? `${Math.round(pct * 100)}% used — review your spending soon.`
          : `On track! ${formatCurrency(remaining, stats.homeCurrency)} remaining.`,
    });
  }

  // 3. Trip status
  if (displayTrip) {
    const status = getTripStatus(displayTrip);
    if (status === 'active') {
      const daysLeft = Math.max(
        0,
        differenceInDays(parseISO(displayTrip.end_date + 'T00:00:00'), new Date()),
      );
      insights.push({
        type: 'info',
        icon: Plane,
        title: 'Journey Progress',
        body: `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left in ${displayTrip.destination}. Make every moment count!`,
      });
    } else if (status === 'upcoming') {
      const daysUntil = Math.max(
        0,
        differenceInDays(parseISO(displayTrip.start_date + 'T00:00:00'), new Date()),
      );
      insights.push({
        type: 'info',
        icon: Plane,
        title: 'Upcoming Trip',
        body: `${daysUntil} day${daysUntil !== 1 ? 's' : ''} until you depart for ${displayTrip.destination}. All packed?`,
      });
    }
  }

  // 4. Rotating tip
  insights.push({
    type: 'tip',
    icon: Lightbulb,
    title: 'Travel Tip',
    body: TIPS[new Date().getDay() % TIPS.length],
  });

  const visible = insights.slice(0, 4);

  return (
    <motion.section
      aria-label="Smart insights"
      className="rounded-2xl border border-border/50 bg-card p-5"
      variants={rv(CARD_VARIANTS, reduced)}
      initial="hidden"
      animate="show"
    >
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-foreground">Smart Insights</h2>
      </div>

      <div className="space-y-3">
        {visible.map((ins, i) => {
          const Icon = ins.icon;
          return (
            <motion.div
              key={i}
              className="flex items-start gap-3"
              initial={reduced ? {} : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 + i * 0.07, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <div
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                  ICON_BG[ins.type],
                )}
              >
                <Icon className={cn('h-4 w-4', ICON_COLOR[ins.type])} aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground">{ins.title}</p>
                <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{ins.body}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 border-t border-border/50 pt-3">
        <Link
          to="/assistant"
          className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary"
        >
          Chat with AI companion
          <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </div>
    </motion.section>
  );
}
