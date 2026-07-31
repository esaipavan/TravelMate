import { motion, useReducedMotion } from 'framer-motion';
import { Loader2, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { rv, LIST_VARIANTS, LIST_ITEM_VARIANTS } from '@/lib/motion';
import {
  useDestinationRecommendations,
  type AIRecommendation,
} from '../hooks/useDestinationRecommendations';
import type { TripRow } from '@/features/trips/types';
import type { DestinationOverview } from '../types';

interface Props {
  trip: TripRow;
  overview: DestinationOverview;
}

const CATEGORY_STYLES: Record<AIRecommendation['category'], { badge: string; label: string }> = {
  experience: {
    badge: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    label: 'Experience',
  },
  food: {
    badge: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    label: 'Food & Drink',
  },
  culture: {
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    label: 'Culture',
  },
  nature: {
    badge: 'bg-green-500/10 text-green-600 dark:text-green-400',
    label: 'Nature',
  },
  budget: {
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    label: 'Budget Tip',
  },
  adventure: {
    badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    label: 'Adventure',
  },
};

function RecommendationCard({
  rec,
  index,
  reduced,
}: {
  rec: AIRecommendation;
  index: number;
  reduced: boolean | null;
}) {
  const style = CATEGORY_STYLES[rec.category];

  return (
    <motion.div
      variants={rv(LIST_ITEM_VARIANTS, reduced)}
      transition={{ delay: index * 0.05 }}
      className="flex flex-col gap-3 rounded-2xl border border-border/50 bg-card p-4"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-2xl leading-none" role="img" aria-label={rec.category}>
          {rec.emoji}
        </span>
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
            style.badge,
          )}
        >
          {style.label}
        </span>
      </div>

      <div className="space-y-1">
        <h3 className="text-sm font-semibold leading-snug text-foreground">{rec.title}</h3>
        <p className="text-xs leading-relaxed text-muted-foreground">{rec.description}</p>
      </div>

      {rec.bestFor && (
        <div className="mt-auto pt-1">
          <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
            Best for: {rec.bestFor}
          </span>
        </div>
      )}
    </motion.div>
  );
}

export function SmartRecommendations({ trip, overview }: Props) {
  const reduced = useReducedMotion();
  const { data: recs, isLoading, isError } = useDestinationRecommendations(trip, overview);

  return (
    <section id="recommendations" aria-label="AI-powered recommendations" className="space-y-5">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
          <Sparkles className="h-4 w-4 text-primary" aria-hidden />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Smart Recommendations</h2>
          <p className="text-sm text-muted-foreground">
            AI-curated picks for {overview.destination}
          </p>
        </div>
        {isLoading && (
          <Loader2
            className="ml-auto h-4 w-4 animate-spin text-muted-foreground"
            aria-label="Generating recommendations…"
          />
        )}
      </div>

      {isLoading && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      )}

      {isError && (
        <div className="flex h-28 items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20">
          <p className="text-sm text-muted-foreground">
            AI recommendations unavailable right now. Check back soon.
          </p>
        </div>
      )}

      {recs && recs.length > 0 && (
        <motion.div
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          variants={rv(LIST_VARIANTS, reduced)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
        >
          {recs.map((rec, i) => (
            <RecommendationCard key={i} rec={rec} index={i} reduced={reduced} />
          ))}
        </motion.div>
      )}
    </section>
  );
}
