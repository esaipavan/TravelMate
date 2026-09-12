import type { LucideIcon } from 'lucide-react';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

// One dashed-empty treatment for widget bodies, replacing the three
// near-identical-but-not-quite-matching versions TripBudgetCard, TripAIPanel,
// and TripBookingsSection each hand-rolled independently.

interface Props {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function WidgetEmptyState({
  icon: Icon = Info,
  title = 'Nothing here yet',
  description,
  action,
  className,
}: Props) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2.5 rounded-xl border border-dashed border-border/60 bg-muted/10 p-6 text-center',
        className,
      )}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted/50">
        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </span>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
