import { Link } from 'react-router-dom';
import { Check, ArrowRight, ChevronRight, PartyPopper } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TripPreparation } from '../utils/tripPreparation';

interface Props {
  preparation: TripPreparation;
}

/**
 * "What's done, what's left, what's next" — the single readable summary at
 * the top of Prepare Trip. Every row and the next-step link below both come
 * from the same `TripPreparation` object (see useTripPreparation), so this
 * can never disagree with the dashboard's Next Action banner.
 */
export function PreparationSummary({ preparation }: Props) {
  const { tripId, categories, completedCount, totalCount, allComplete, nextAction } = preparation;

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-border/60 bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">Your preparation</h2>
          <span className="text-xs font-medium tabular-nums text-muted-foreground">
            {completedCount} of {totalCount} complete
          </span>
        </div>

        <ul className="divide-y divide-border/50" role="list">
          {categories.map((cat) => (
            <li key={cat.key}>
              <Link
                to={cat.href}
                className="flex items-center gap-3 rounded-lg py-2.5 transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2',
                    cat.status === 'complete'
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-border bg-background',
                  )}
                  aria-hidden="true"
                >
                  {cat.status === 'complete' && <Check className="h-3.5 w-3.5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{cat.label}</p>
                </div>
                <p className="shrink-0 text-right text-xs text-muted-foreground">{cat.detail}</p>
                <ChevronRight
                  className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {allComplete ? (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 px-5 py-3.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15">
            <PartyPopper className="h-4 w-4 text-emerald-600" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-600/80">
              All set
            </p>
            <p className="truncate text-sm font-semibold text-foreground">{nextAction.label}</p>
          </div>
          <Link
            to={`/trips/${tripId}`}
            className="flex shrink-0 items-center gap-1 rounded-lg border border-emerald-500/30 px-3 py-2 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-500/10 dark:text-emerald-400"
          >
            View trip
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      ) : (
        <Link
          to={nextAction.href}
          className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-5 py-3.5 transition-colors hover:bg-primary/10"
        >
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-primary/70">
              Next step
            </p>
            <p className="truncate text-sm font-semibold text-foreground">{nextAction.label}</p>
          </div>
          <span className="flex shrink-0 items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">
            Continue
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        </Link>
      )}
    </div>
  );
}
