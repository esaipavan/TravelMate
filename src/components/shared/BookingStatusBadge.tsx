import { CircleDashed, CheckCircle2, XCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BookingStatus } from '@/features/hotels/types';

const META: Record<BookingStatus, { label: string; icon: LucideIcon; className: string }> = {
  draft: {
    label: 'Planned',
    icon: CircleDashed,
    className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
  },
  confirmed: {
    label: 'Confirmed',
    icon: CheckCircle2,
    className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    className: 'bg-muted text-muted-foreground border-border/60',
  },
};

interface Props {
  status: BookingStatus;
  className?: string;
}

/** Shared, consistent lifecycle badge used across booking cards, the trip
 *  bookings list, and the itinerary. */
export function BookingStatusBadge({ status, className }: Props) {
  const meta = META[status] ?? META.draft;
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        meta.className,
        className,
      )}
    >
      <Icon className="h-2.5 w-2.5" aria-hidden />
      {meta.label}
    </span>
  );
}
