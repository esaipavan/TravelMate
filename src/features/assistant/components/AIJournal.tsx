import { motion, useReducedMotion } from 'framer-motion';
import { BookOpen, Sparkles, Loader2, Star, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { rv, LIST_VARIANTS, LIST_ITEM_VARIANTS, FADE_VARIANTS } from '@/lib/motion';
import { formatDate } from '@/utils/formatters';
import { useAIJournal } from '../hooks/useAIJournal';
import type { TripRow } from '@/features/trips/types';

const MOOD_EMOJI: Record<string, string> = {
  happy: '😊',
  excited: '🤩',
  relaxed: '😌',
  tired: '😴',
  adventurous: '🧗',
  romantic: '❤️',
  nostalgic: '🥲',
  overwhelmed: '😵',
  peaceful: '🧘',
};

interface Props {
  trip: TripRow;
}

export function AIJournal({ trip }: Props) {
  const reduced = useReducedMotion();
  const { entries, narrative, generateNarrative, isGenerating, isLoading } = useAIJournal(trip);

  if (isLoading) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Loading journal">
        <Skeleton className="h-12 rounded-xl" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-5"
      variants={rv(LIST_VARIANTS, reduced)}
      initial="hidden"
      animate="show"
    >
      {/* AI Narrative */}
      <motion.div variants={rv(LIST_ITEM_VARIANTS, reduced)} className="space-y-3">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            AI Travel Story
          </p>
        </div>

        {narrative ? (
          <motion.div
            variants={rv(FADE_VARIANTS, reduced)}
            initial="hidden"
            animate="show"
            className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 to-transparent p-5"
          >
            <p className="text-sm italic leading-relaxed text-foreground/90">{narrative}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={generateNarrative}
              disabled={isGenerating}
              className="mt-3 h-7 gap-1.5 text-[11px] text-primary hover:text-primary"
            >
              <Sparkles className="h-3 w-3" aria-hidden />
              Regenerate story
            </Button>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border/50 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
              <BookOpen className="h-6 w-6 text-primary" aria-hidden />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-foreground">Generate your travel story</p>
              <p className="max-w-xs text-sm text-muted-foreground">
                AI will weave your journal entries, places visited, and experiences into a vivid
                narrative.
              </p>
            </div>
            <Button onClick={generateNarrative} disabled={isGenerating} className="gap-2">
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Writing your story…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" aria-hidden />
                  Write My Travel Story
                </>
              )}
            </Button>
          </div>
        )}
      </motion.div>

      {/* Journal Entries */}
      <motion.div variants={rv(LIST_ITEM_VARIANTS, reduced)} className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Journal Entries
          </p>
          {entries.length > 0 && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
              {entries.length}
            </span>
          )}
        </div>

        {entries.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/50 py-12 text-center">
            <BookOpen className="h-8 w-8 text-muted-foreground/40" aria-hidden />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">No journal entries yet</p>
              <p className="max-w-xs text-xs text-muted-foreground">
                Add entries from the Memories page to build your travel story.
              </p>
            </div>
          </div>
        ) : (
          <motion.div
            className="space-y-3"
            variants={rv(LIST_VARIANTS, reduced)}
            initial="hidden"
            animate="show"
          >
            {entries.map((entry) => (
              <motion.div
                key={entry.id}
                variants={rv(LIST_ITEM_VARIANTS, reduced)}
                className="rounded-2xl border border-border/50 bg-card p-4"
              >
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {entry.mood && (
                      <span className="text-lg leading-none" aria-hidden>
                        {MOOD_EMOJI[entry.mood] ?? '📖'}
                      </span>
                    )}
                    <div>
                      {entry.title && (
                        <p className="text-sm font-semibold text-foreground">{entry.title}</p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" aria-hidden />
                        <span>{formatDate(entry.date, 'MMM d, yyyy')}</span>
                        {entry.location_name && (
                          <>
                            <span className="text-muted-foreground/40">·</span>
                            <MapPin className="h-3 w-3" aria-hidden />
                            <span>{entry.location_name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {entry.rating && (
                    <div className="flex shrink-0 items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            'h-3 w-3',
                            i < entry.rating!
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-muted-foreground/30',
                          )}
                          aria-hidden
                        />
                      ))}
                    </div>
                  )}
                </div>
                {entry.content && (
                  <p className="line-clamp-3 text-sm text-muted-foreground">{entry.content}</p>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
