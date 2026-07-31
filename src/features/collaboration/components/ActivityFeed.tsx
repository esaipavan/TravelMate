import { motion, useReducedMotion } from 'framer-motion';
import { Activity, DollarSign, Map, UserPlus, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { rv, LIST_VARIANTS, LIST_ITEM_VARIANTS } from '@/lib/motion';
import { useActivityFeed } from '../hooks/useActivityFeed';

const ACTION_META: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  expense_added: {
    icon: DollarSign,
    color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },
  itinerary_item_added: { icon: Map, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  member_joined: { icon: UserPlus, color: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' },
};

function getActionMeta(action: string) {
  return ACTION_META[action] ?? { icon: Info, color: 'bg-muted text-muted-foreground' };
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

interface Props {
  tripId: string;
}

export function ActivityFeed({ tripId }: Props) {
  const reduced = useReducedMotion();
  const { data: entries = [], isLoading, isError } = useActivityFeed(tripId);

  if (isLoading) {
    return (
      <section aria-label="Activity feed" className="space-y-3">
        <Skeleton className="h-4 w-28 rounded" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 rounded-xl" />
        ))}
      </section>
    );
  }

  if (isError || entries.length === 0) return null;

  return (
    <section aria-labelledby="activity-heading" className="space-y-3">
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4 text-muted-foreground" aria-hidden />
        <h2
          id="activity-heading"
          className="text-sm font-semibold uppercase tracking-wide text-muted-foreground"
        >
          Activity
        </h2>
      </div>

      <motion.div
        className="space-y-2"
        variants={rv(LIST_VARIANTS, reduced)}
        initial="hidden"
        animate="show"
      >
        {entries.map((entry) => {
          const { icon: Icon, color } = getActionMeta(entry.action);
          return (
            <motion.div
              key={entry.id}
              variants={rv(LIST_ITEM_VARIANTS, reduced)}
              className="flex items-start gap-3 rounded-xl border border-border/50 bg-card p-3"
            >
              <div
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                  color,
                )}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-snug text-foreground">{entry.description}</p>
                {entry.actorName && (
                  <p className="mt-0.5 text-xs text-muted-foreground">{entry.actorName}</p>
                )}
              </div>
              <time dateTime={entry.createdAt} className="shrink-0 text-xs text-muted-foreground">
                {timeAgo(entry.createdAt)}
              </time>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
