import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { rv, CARD_VARIANTS } from '@/lib/motion';
import { CATEGORY_META, formatDistance, type NearbyPlace, type PlaceCategory } from '../../types';

interface Props {
  places: NearbyPlace[];
  location: string;
  radiusM: number;
}

interface Insight {
  type: 'success' | 'warning' | 'info';
  title: string;
  body: string;
}

const ICON_MAP = {
  success: { Icon: CheckCircle2, color: '#10b981', bg: 'bg-emerald-500/10' },
  warning: { Icon: AlertTriangle, color: '#f59e0b', bg: 'bg-amber-500/10' },
  info: { Icon: Info, color: '#6366f1', bg: 'bg-indigo-500/10' },
};

function buildInsights(places: NearbyPlace[], location: string, radiusM: number): Insight[] {
  const insights: Insight[] = [];
  if (places.length === 0) return insights;

  const byCategory: Partial<Record<PlaceCategory, NearbyPlace[]>> = {};
  for (const p of places) {
    (byCategory[p.category] ??= []).push(p);
  }

  const closest = (cat: PlaceCategory) => byCategory[cat]?.[0];

  // Overview
  const categories = Object.keys(byCategory) as PlaceCategory[];
  insights.push({
    type: 'success',
    title: `${places.length} places found`,
    body: `Discovered ${places.length} places across ${categories.length} categories within ${radiusM / 1000} km of ${location.split(',')[0]}.`,
  });

  // Hospital / medical nearby — safety highlight
  const nearestHospital = closest('hospitals');
  if (nearestHospital) {
    insights.push({
      type: 'info',
      title: 'Medical services nearby',
      body: `Nearest hospital: ${nearestHospital.name} — ${formatDistance(nearestHospital.distance)} away. Good to know for emergencies.`,
    });
  }

  // ATM highlight
  const nearestAtm = closest('atms');
  if (nearestAtm) {
    insights.push({
      type: 'info',
      title: 'ATM accessible',
      body: `${nearestAtm.name} is ${formatDistance(nearestAtm.distance)} away — convenient for cash needs.`,
    });
  }

  // Dining options
  const restaurantCount = byCategory['restaurants']?.length ?? 0;
  if (restaurantCount >= 5) {
    insights.push({
      type: 'success',
      title: `Great dining scene`,
      body: `${restaurantCount} restaurants found. Closest: ${closest('restaurants')?.name} at ${formatDistance(closest('restaurants')?.distance ?? 0)}.`,
    });
  }

  // Attractions
  const attractionCount = byCategory['attractions']?.length ?? 0;
  if (attractionCount > 0) {
    insights.push({
      type: 'info',
      title: `${attractionCount} attraction${attractionCount > 1 ? 's' : ''} nearby`,
      body: `Start with ${closest('attractions')?.name}${closest('attractions') ? ` (${formatDistance(closest('attractions')!.distance)})` : ''}.`,
    });
  }

  // No restaurants — travel safety
  if (restaurantCount === 0 && places.length > 0) {
    insights.push({
      type: 'warning',
      title: 'Limited dining options',
      body: 'No restaurants found in this area. Consider bringing food or expanding the search radius.',
    });
  }

  return insights.slice(0, 3);
}

export function AIExplorerPanel({ places, location, radiusM }: Props) {
  const reduced = useReducedMotion();
  const insights = useMemo(
    () => buildInsights(places, location, radiusM),
    [places, location, radiusM],
  );

  // Top pick per visible category
  const topPicks = useMemo(() => {
    const byCategory: Partial<Record<PlaceCategory, NearbyPlace>> = {};
    for (const p of places) {
      if (!byCategory[p.category]) byCategory[p.category] = p;
    }
    return Object.values(byCategory).slice(0, 4);
  }, [places]);

  return (
    <motion.div
      variants={rv(CARD_VARIANTS, reduced)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-20px' }}
      className="relative overflow-hidden rounded-2xl border border-border/40 bg-card/60 p-4 backdrop-blur-sm"
    >
      {/* Glow */}
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-3xl"
        style={{ background: 'rgba(139,92,246,0.12)' }}
        aria-hidden="true"
      />

      {/* Header */}
      <div className="mb-3 flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 text-white">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
        </div>
        <p className="text-xs font-semibold text-foreground">Location Insights</p>
      </div>

      {/* Insights */}
      <div className="space-y-2.5">
        {insights.map((insight, i) => {
          const { Icon, color, bg } = ICON_MAP[insight.type];
          return (
            <div key={i} className="flex gap-2.5">
              <div
                className={cn(
                  'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md',
                  bg,
                )}
              >
                <Icon className="h-3 w-3" style={{ color }} aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-foreground">{insight.title}</p>
                <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">
                  {insight.body}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Top picks strip */}
      {topPicks.length > 0 && (
        <div className="mt-3 border-t border-border/40 pt-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Closest per category
          </p>
          <div className="space-y-1">
            {topPicks.map((p) => {
              const m = CATEGORY_META[p.category];
              return (
                <div key={p.id} className="flex items-center gap-2">
                  <span className="text-sm" aria-hidden="true">
                    {m.emoji}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[11px] text-foreground">
                    {p.name}
                  </span>
                  <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
                    {formatDistance(p.distance)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}
