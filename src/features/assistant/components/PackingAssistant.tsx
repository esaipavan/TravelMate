import { motion, useReducedMotion } from 'framer-motion';
import { Package, Loader2, CheckCircle, Sparkles, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { rv, LIST_VARIANTS, LIST_ITEM_VARIANTS } from '@/lib/motion';
import { usePackingAssistant } from '../hooks/usePackingAssistant';
import type { TripRow } from '@/features/trips/types';
import type { PackingSuggestion } from '../hooks/usePackingAssistant';

const CATEGORY_META: Record<string, { label: string; emoji: string; color: string }> = {
  documents: { label: 'Documents', emoji: '📄', color: 'text-blue-600 dark:text-blue-400' },
  health: { label: 'Health', emoji: '💊', color: 'text-rose-600 dark:text-rose-400' },
  money: { label: 'Money', emoji: '💳', color: 'text-emerald-600 dark:text-emerald-400' },
  tech: { label: 'Tech', emoji: '📱', color: 'text-purple-600 dark:text-purple-400' },
  clothing: { label: 'Clothing', emoji: '👕', color: 'text-amber-600 dark:text-amber-400' },
  essentials: { label: 'Essentials', emoji: '🎒', color: 'text-teal-600 dark:text-teal-400' },
};

function SuggestionRow({ suggestion }: { suggestion: PackingSuggestion }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border/40 bg-card px-3 py-2.5">
      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{suggestion.item}</p>
        <p className="text-xs text-muted-foreground">{suggestion.reason}</p>
      </div>
    </div>
  );
}

interface Props {
  trip: TripRow;
}

export function PackingAssistant({ trip }: Props) {
  const reduced = useReducedMotion();
  const {
    packingAnalysis,
    mustHave,
    recommended,
    leaveHome,
    isLoading,
    isAILoading,
    isAIError,
    refetchAI,
  } = usePackingAssistant(trip);

  if (isLoading) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Loading packing assistant">
        <Skeleton className="h-32 rounded-2xl" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      variants={rv(LIST_VARIANTS, reduced)}
      initial="hidden"
      animate="show"
    >
      {/* Packing analysis from destination intel */}
      {packingAnalysis ? (
        <motion.div variants={rv(LIST_ITEM_VARIANTS, reduced)} className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Destination Checklist
            </p>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
              {packingAnalysis.totalRequired} required
            </span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {packingAnalysis.categories.map((cat) => {
              const meta = CATEGORY_META[cat.category] ?? {
                label: cat.label,
                emoji: cat.emoji,
                color: 'text-muted-foreground',
              };
              return (
                <div
                  key={cat.category}
                  className="flex items-center gap-3 rounded-xl border border-border/40 bg-card px-3 py-2.5"
                >
                  <span className="text-xl" aria-hidden>
                    {meta.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">{meta.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {cat.total} items · {cat.required} required
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      ) : (
        <motion.div
          variants={rv(LIST_ITEM_VARIANTS, reduced)}
          className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/50 py-8 text-center"
        >
          <Package className="h-8 w-8 text-muted-foreground/40" aria-hidden />
          <p className="text-sm text-muted-foreground">
            No destination checklist available for {trip.destination}.
          </p>
        </motion.div>
      )}

      {/* AI Suggestions */}
      <motion.div variants={rv(LIST_ITEM_VARIANTS, reduced)} className="space-y-4">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            AI Packing Suggestions
          </p>
        </div>

        {isAILoading ? (
          <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-card p-4 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
            <span>Personalising packing list for {trip.destination}…</span>
          </div>
        ) : isAIError ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/50 py-8 text-center">
            <AlertCircle className="h-6 w-6 text-muted-foreground/40" aria-hidden />
            <p className="text-sm text-muted-foreground">
              Couldn&apos;t load AI packing suggestions.
            </p>
            <Button variant="outline" size="sm" onClick={refetchAI}>
              Retry
            </Button>
          </div>
        ) : mustHave.length === 0 && recommended.length === 0 && leaveHome.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border/50 py-8 text-center">
            <Package className="h-6 w-6 text-muted-foreground/40" aria-hidden />
            <p className="text-sm text-muted-foreground">No AI suggestions available.</p>
          </div>
        ) : (
          <motion.div
            className="space-y-4"
            variants={rv(LIST_VARIANTS, reduced)}
            initial="hidden"
            animate="show"
          >
            {mustHave.length > 0 && (
              <motion.div variants={rv(LIST_ITEM_VARIANTS, reduced)} className="space-y-2">
                <p className="text-xs font-bold text-rose-600 dark:text-rose-400">Must Have</p>
                <div className="space-y-2">
                  {mustHave.map((s, i) => (
                    <SuggestionRow key={i} suggestion={s} />
                  ))}
                </div>
              </motion.div>
            )}

            {recommended.length > 0 && (
              <motion.div variants={rv(LIST_ITEM_VARIANTS, reduced)} className="space-y-2">
                <p className="text-xs font-bold text-amber-600 dark:text-amber-400">Recommended</p>
                <div className="space-y-2">
                  {recommended.map((s, i) => (
                    <SuggestionRow key={i} suggestion={s} />
                  ))}
                </div>
              </motion.div>
            )}

            {leaveHome.length > 0 && (
              <motion.div variants={rv(LIST_ITEM_VARIANTS, reduced)} className="space-y-2">
                <p className="text-xs font-bold text-muted-foreground">Leave at Home</p>
                <div className="space-y-2">
                  {leaveHome.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2.5 rounded-xl border border-border/40 bg-muted/20 px-3 py-2"
                    >
                      <XCircle className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
                      <p className="text-sm text-muted-foreground line-through">{item}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
