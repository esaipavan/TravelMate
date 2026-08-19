import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { rv, LIST_VARIANTS, LIST_ITEM_VARIANTS } from '@/lib/motion';
import type { AIInsight, InsightCategory } from '../types';

interface Props {
  destination: string;
  insights: AIInsight[];
}

const CATEGORY_STYLES: Record<InsightCategory, { badge: string; label: string }> = {
  timing: {
    badge: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
    label: 'Timing',
  },
  money: {
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    label: 'Money',
  },
  culture: {
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    label: 'Culture',
  },
  food: {
    badge: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    label: 'Food & Drink',
  },
  safety: {
    badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    label: 'Safety',
  },
  experience: {
    badge: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    label: 'Experience',
  },
};

function InsightCard({
  insight,
  index,
  reduced,
}: {
  insight: AIInsight;
  index: number;
  reduced: boolean | null;
}) {
  const style = CATEGORY_STYLES[insight.category];

  return (
    <motion.div
      variants={rv(LIST_ITEM_VARIANTS, reduced)}
      transition={{ delay: index * 0.05 }}
      className="flex flex-col gap-3 rounded-2xl border border-border/50 bg-card p-4"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-2xl leading-none" role="img" aria-label={style.label}>
          {insight.emoji}
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
        <h3 className="text-sm font-semibold leading-snug text-foreground">{insight.title}</h3>
        <p className="text-xs leading-relaxed text-muted-foreground">{insight.body}</p>
      </div>
    </motion.div>
  );
}

export function SmartRecommendations({ destination, insights }: Props) {
  const reduced = useReducedMotion();

  return (
    <section id="recommendations" aria-label="Local insights" className="space-y-5">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
          <Sparkles className="h-4 w-4 text-primary" aria-hidden />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Local Insights</h2>
          <p className="text-sm text-muted-foreground">Insider tips for {destination}</p>
        </div>
      </div>

      {insights.length > 0 ? (
        <motion.div
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          variants={rv(LIST_VARIANTS, reduced)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
        >
          {insights.map((insight, i) => (
            <InsightCard key={insight.id} insight={insight} index={i} reduced={reduced} />
          ))}
        </motion.div>
      ) : (
        <div className="flex h-28 items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20">
          <p className="text-sm text-muted-foreground">
            No local insights available for this destination yet.
          </p>
        </div>
      )}
    </section>
  );
}
