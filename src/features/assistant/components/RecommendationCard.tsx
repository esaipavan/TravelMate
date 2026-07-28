import { motion, useReducedMotion } from 'framer-motion';
import { X, ArrowRight, Cloud, Wallet, Package, Clock, Shield, Star, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { rv, CARD_VARIANTS, HOVER, rg } from '@/lib/motion';
import type {
  Recommendation,
  RecommendationAction,
  RecommendationCategory,
  RecommendationPriority,
} from '../types';

interface Props {
  rec: Recommendation;
  onDismiss: (id: string) => void;
  onAction: (action: RecommendationAction) => void;
}

const CATEGORY_META: Record<
  RecommendationCategory,
  { icon: typeof Cloud; label: string; bg: string; text: string }
> = {
  weather: {
    icon: Cloud,
    label: 'Weather',
    bg: 'bg-sky-500/10',
    text: 'text-sky-600 dark:text-sky-400',
  },
  budget: {
    icon: Wallet,
    label: 'Budget',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
  packing: {
    icon: Package,
    label: 'Packing',
    bg: 'bg-violet-500/10',
    text: 'text-violet-600 dark:text-violet-400',
  },
  timing: {
    icon: Clock,
    label: 'Timing',
    bg: 'bg-blue-500/10',
    text: 'text-blue-600 dark:text-blue-400',
  },
  safety: {
    icon: Shield,
    label: 'Safety',
    bg: 'bg-rose-500/10',
    text: 'text-rose-600 dark:text-rose-400',
  },
  experience: {
    icon: Star,
    label: 'Experience',
    bg: 'bg-amber-500/10',
    text: 'text-amber-600 dark:text-amber-400',
  },
  alert: {
    icon: Bell,
    label: 'Alert',
    bg: 'bg-orange-500/10',
    text: 'text-orange-600 dark:text-orange-400',
  },
};

const PRIORITY_BORDER: Record<RecommendationPriority, string> = {
  critical: 'border-l-rose-500',
  high: 'border-l-amber-500',
  medium: 'border-l-blue-500',
  low: 'border-l-emerald-500/60',
};

const PRIORITY_LABEL: Record<RecommendationPriority, string> = {
  critical: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
  high: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  medium: 'bg-blue-500/15  text-blue-600  dark:text-blue-400',
  low: 'bg-muted/60     text-muted-foreground',
};

export function RecommendationCard({ rec, onDismiss, onAction }: Props) {
  const reduced = useReducedMotion();
  const cat = CATEGORY_META[rec.category] ?? CATEGORY_META.alert;
  const Icon = cat.icon;

  return (
    <motion.article
      className={`relative flex flex-col gap-3 rounded-2xl border border-l-[3px] border-border/50 bg-card p-4 ${PRIORITY_BORDER[rec.priority]}`}
      variants={rv(CARD_VARIANTS, reduced)}
      whileHover={rg(HOVER.lift, reduced)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-10px' }}
      aria-label={rec.title}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${cat.bg}`}>
            <Icon className={`h-3.5 w-3.5 ${cat.text}`} aria-hidden />
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-wider ${cat.text}`}>
            {cat.label}
          </span>
          <span
            className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${PRIORITY_LABEL[rec.priority]}`}
          >
            {rec.priority}
          </span>
        </div>

        {rec.dismissible && (
          <button
            type="button"
            onClick={() => onDismiss(rec.id)}
            className="shrink-0 rounded p-0.5 text-muted-foreground/40 transition-colors hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            aria-label={`Dismiss ${rec.title}`}
          >
            <X className="h-3.5 w-3.5" aria-hidden />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xl leading-none" aria-hidden>
            {rec.emoji}
          </span>
          <h3 className="text-sm font-bold text-foreground">{rec.title}</h3>
        </div>
        <p className="text-[13px] leading-relaxed text-muted-foreground">{rec.body}</p>
      </div>

      {/* Action */}
      {rec.action && (
        <Button
          variant="ghost"
          size="sm"
          className={`-mx-1 h-7 gap-1 self-start px-2 text-[11px] font-semibold ${cat.text} hover:bg-transparent`}
          onClick={() => onAction(rec.action!)}
        >
          {rec.action.label}
          <ArrowRight className="h-3 w-3" aria-hidden />
        </Button>
      )}
    </motion.article>
  );
}
