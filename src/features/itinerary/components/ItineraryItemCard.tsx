import { Pencil, Trash2, Clock, MapPin, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/formatters';
import type { ItineraryItemRow, ItineraryCategory, ItemStatus } from '../types';

interface Props {
  item: ItineraryItemRow;
  currency: string;
  onEdit: (item: ItineraryItemRow) => void;
  onDelete: (item: ItineraryItemRow) => void;
  dragHandle?: React.ReactNode;
}

const CATEGORY_META: Record<ItineraryCategory, { emoji: string; label: string; color: string }> = {
  transport: {
    emoji: '✈️',
    label: 'Transport',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  },
  accommodation: {
    emoji: '🏨',
    label: 'Accommodation',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  },
  activity: {
    emoji: '🎯',
    label: 'Activity',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  },
  food: {
    emoji: '🍽️',
    label: 'Food',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  },
  other: { emoji: '📌', label: 'Other', color: 'bg-muted text-muted-foreground' },
};

const STATUS_META: Record<ItemStatus, { label: string; color: string }> = {
  planned: { label: 'Planned', color: 'text-muted-foreground' },
  confirmed: { label: 'Confirmed', color: 'text-blue-600 dark:text-blue-400' },
  completed: { label: 'Completed', color: 'text-emerald-600 dark:text-emerald-400' },
  cancelled: { label: 'Cancelled', color: 'text-destructive line-through' },
};

export function ItineraryItemCard({ item, currency, onEdit, onDelete, dragHandle }: Props) {
  const cat = CATEGORY_META[item.category];
  const status = STATUS_META[item.status];

  const startTime = item.start_time ? item.start_time.slice(0, 5) : null;
  const endTime = item.end_time ? item.end_time.slice(0, 5) : null;
  const timeLabel = startTime ? (endTime ? `${startTime} – ${endTime}` : startTime) : null;

  return (
    <div className="group flex items-start gap-3 rounded-lg border bg-card p-3 transition-shadow hover:shadow-sm">
      {dragHandle && (
        <div className="mt-0.5 shrink-0 cursor-grab text-muted-foreground/40 hover:text-muted-foreground active:cursor-grabbing">
          {dragHandle}
        </div>
      )}

      <span className="mt-0.5 shrink-0 text-xl leading-none" role="img" aria-label={cat.label}>
        {cat.emoji}
      </span>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className={`font-medium leading-none ${status.color}`}>{item.title}</p>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cat.color}`}
          >
            {cat.label}
          </span>
          {item.status !== 'planned' && (
            <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          {timeLabel && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeLabel}
            </span>
          )}
          {item.location_name && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {item.location_name}
            </span>
          )}
          {item.estimated_cost != null && item.estimated_cost > 0 && (
            <span className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              {formatCurrency(item.estimated_cost, currency)}
            </span>
          )}
        </div>

        {item.description && (
          <p className="line-clamp-1 text-xs text-muted-foreground">{item.description}</p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1 lg:opacity-0 lg:transition-opacity lg:focus-within:opacity-100 lg:group-hover:opacity-100">
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          onClick={() => onEdit(item)}
          aria-label="Edit item"
        >
          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(item)}
          aria-label="Delete item"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
