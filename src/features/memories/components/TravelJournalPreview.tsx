import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { BookOpen, ArrowRight, Star } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { rv, LIST_VARIANTS, CARD_VARIANTS } from '@/lib/motion';
import type { JournalEntryRow, MoodEnum } from '@/features/journal/types';

const MOOD_CONFIG: Record<MoodEnum, { label: string; bg: string; text: string }> = {
  amazing: { label: 'Amazing', bg: 'bg-amber-500/15', text: 'text-amber-600 dark:text-amber-400' },
  good: { label: 'Good', bg: 'bg-emerald-500/15', text: 'text-emerald-600 dark:text-emerald-400' },
  okay: { label: 'Okay', bg: 'bg-blue-500/15', text: 'text-blue-600 dark:text-blue-400' },
  bad: { label: 'Bad', bg: 'bg-orange-500/15', text: 'text-orange-600 dark:text-orange-400' },
  terrible: { label: 'Terrible', bg: 'bg-rose-500/15', text: 'text-rose-600 dark:text-rose-400' },
};

interface Props {
  entries: JournalEntryRow[];
  tripId: string;
}

export function TravelJournalPreview({ entries, tripId }: Props) {
  const reduced = useReducedMotion();

  const recent = [...entries].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/50 p-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/60">
          <BookOpen className="h-6 w-6 text-muted-foreground/40" aria-hidden />
        </div>
        <div>
          <p className="font-semibold text-foreground">No journal entries yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Start writing to capture your journey
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to={`/trips/${tripId}/journal`}>Open Journal</Link>
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-3"
      variants={rv(LIST_VARIANTS, reduced)}
      initial="hidden"
      animate="show"
    >
      {recent.map((entry) => {
        const mood = entry.mood ? MOOD_CONFIG[entry.mood] : null;
        const excerpt =
          entry.content && entry.content.length > 110
            ? entry.content.slice(0, 110) + '\u2026'
            : entry.content;

        return (
          <motion.div
            key={entry.id}
            variants={rv(CARD_VARIANTS, reduced)}
            className="flex gap-3 rounded-2xl border border-border/40 bg-card p-4"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted/60">
              <BookOpen className="h-4 w-4 text-muted-foreground" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-x-2 gap-y-0.5">
                <p className="truncate text-sm font-semibold text-foreground">
                  {entry.title ?? 'Journal Entry'}
                </p>
                <div className="flex shrink-0 items-center gap-1.5">
                  {mood && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${mood.bg} ${mood.text}`}
                    >
                      {mood.label}
                    </span>
                  )}
                  {entry.rating !== null && (
                    <span className="flex items-center gap-0.5 text-[11px] font-semibold text-amber-500">
                      <Star className="h-2.5 w-2.5 fill-current" aria-hidden />
                      {entry.rating}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {format(parseISO(entry.date + 'T00:00:00'), 'MMM d')}
                  </span>
                </div>
              </div>
              {entry.location_name && (
                <p className="mt-0.5 text-xs text-muted-foreground">{entry.location_name}</p>
              )}
              {excerpt && (
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {excerpt}
                </p>
              )}
            </div>
          </motion.div>
        );
      })}

      {entries.length > 4 && (
        <Button variant="ghost" size="sm" className="w-full gap-1.5" asChild>
          <Link to={`/trips/${tripId}/journal`}>
            View all {entries.length} entries
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </Button>
      )}
    </motion.div>
  );
}
