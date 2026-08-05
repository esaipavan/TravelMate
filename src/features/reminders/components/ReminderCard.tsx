import { format } from 'date-fns';
import { parseLocalDate } from '@/utils/formatters';
import { Bell, Calendar, RefreshCw, Pencil, Trash2, Check, AlarmClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  type ReminderRow,
  REMINDER_TYPE_MAP,
  PRIORITY_CONFIG,
  STATUS_CONFIG,
  REPEAT_OPTIONS,
  getEffectiveStatus,
} from '../types';

interface Props {
  reminder: ReminderRow;
  tripTitle?: string;
  onEdit: (r: ReminderRow) => void;
  onDelete: (r: ReminderRow) => void;
  onToggle: (id: string, complete: boolean) => void;
  onSnooze: (id: string, minutes: number) => void;
}

export function ReminderCard({ reminder, tripTitle, onEdit, onDelete, onToggle, onSnooze }: Props) {
  const meta = REMINDER_TYPE_MAP[reminder.type] ?? REMINDER_TYPE_MAP['custom'];
  const status = getEffectiveStatus(reminder);
  const priCfg = PRIORITY_CONFIG[reminder.priority];
  const statCfg = STATUS_CONFIG[status];
  const complete = status === 'completed';
  const repeatLabel = REPEAT_OPTIONS.find((o) => o.value === reminder.repeat)?.label ?? '';

  let formattedDate = '';
  try {
    formattedDate = format(parseLocalDate(reminder.reminder_date), 'dd MMM yyyy');
  } catch {
    formattedDate = reminder.reminder_date;
  }

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border bg-card p-4 transition-shadow hover:shadow-md ${
        status === 'overdue' ? 'border-l-4 border-l-destructive/60' : ''
      } ${complete ? 'opacity-70' : ''}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 text-lg">{meta.emoji}</span>
          <p
            className={`truncate font-semibold leading-snug ${complete ? 'text-muted-foreground line-through' : ''}`}
            title={reminder.title}
          >
            {reminder.title}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <span
            className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${priCfg.badgeClass}`}
          >
            {priCfg.label}
          </span>
        </div>
      </div>

      {/* Description */}
      {reminder.description && (
        <p className="line-clamp-2 text-xs text-muted-foreground">{reminder.description}</p>
      )}

      {/* Meta */}
      <div className="space-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Calendar className="h-3 w-3 shrink-0" />
          {formattedDate}
          {reminder.reminder_time && ` at ${reminder.reminder_time.slice(0, 5)}`}
        </span>
        {reminder.repeat !== 'none' && (
          <span className="flex items-center gap-1.5">
            <RefreshCw className="h-3 w-3 shrink-0" />
            {repeatLabel}
          </span>
        )}
        {tripTitle && <span className="flex items-center gap-1.5">✈️ {tripTitle}</span>}
      </div>

      {/* Status badge */}
      <span
        className={`inline-flex self-start rounded-full border px-2 py-0.5 text-xs font-medium ${statCfg.badgeClass}`}
      >
        {statCfg.label}
      </span>

      {/* Actions */}
      <div className="mt-auto flex items-center gap-1 border-t pt-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label={complete ? 'Mark pending' : 'Mark complete'}
              onClick={() => onToggle(reminder.id, !complete)}
            >
              <Check
                className={`h-3.5 w-3.5 ${complete ? 'text-emerald-500' : ''}`}
                aria-hidden="true"
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{complete ? 'Mark pending' : 'Mark complete'}</TooltipContent>
        </Tooltip>

        {!complete && (
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label="Snooze reminder"
                  >
                    <AlarmClock className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Snooze</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="start">
              {[15, 30, 60, 180, 1440].map((m) => (
                <DropdownMenuItem key={m} onClick={() => onSnooze(reminder.id, m)}>
                  {m < 60 ? `${m} min` : m < 1440 ? `${m / 60} hr` : '1 day'}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <div className="ml-auto flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label="Edit reminder"
                onClick={() => onEdit(reminder)}
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                aria-label="Delete reminder"
                onClick={() => onDelete(reminder)}
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}

// ── Compact list item ─────────────────────────────────────────────────────────

export function ReminderListItem({
  reminder,
  tripTitle,
  onEdit,
  onDelete,
  onToggle,
  onSnooze,
}: Props) {
  const meta = REMINDER_TYPE_MAP[reminder.type] ?? REMINDER_TYPE_MAP['custom'];
  const status = getEffectiveStatus(reminder);
  const priCfg = PRIORITY_CONFIG[reminder.priority];
  const statCfg = STATUS_CONFIG[status];
  const complete = status === 'completed';

  let formattedDate = '';
  try {
    formattedDate = format(parseLocalDate(reminder.reminder_date), 'dd MMM yyyy');
  } catch {
    formattedDate = reminder.reminder_date;
  }

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border bg-card px-4 py-3 transition-shadow hover:shadow-sm ${
        status === 'overdue' ? 'border-l-4 border-l-destructive/60' : ''
      } ${complete ? 'opacity-70' : ''}`}
    >
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0"
        aria-label={complete ? 'Mark pending' : 'Mark complete'}
        onClick={() => onToggle(reminder.id, !complete)}
      >
        <Check
          className={`h-3.5 w-3.5 ${complete ? 'text-emerald-500' : 'text-muted-foreground'}`}
          aria-hidden="true"
        />
      </Button>

      <span className="shrink-0">{meta.emoji}</span>

      <div className="flex min-w-0 flex-1 items-center gap-3">
        <p
          className={`truncate text-sm font-medium ${complete ? 'text-muted-foreground line-through' : ''}`}
          title={reminder.title}
        >
          {reminder.title}
        </p>
        <div className="hidden shrink-0 items-center gap-1.5 text-xs text-muted-foreground sm:flex">
          <Bell className="h-3 w-3" />
          {formattedDate}
          {reminder.reminder_time && ` · ${reminder.reminder_time.slice(0, 5)}`}
          {tripTitle && ` · ✈️ ${tripTitle}`}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span
          className={`hidden rounded-full border px-2 py-0.5 text-xs font-medium sm:inline-flex ${priCfg.badgeClass}`}
        >
          {priCfg.label}
        </span>
        <span
          className={`hidden rounded-full border px-2 py-0.5 text-xs font-medium sm:inline-flex ${statCfg.badgeClass}`}
        >
          {statCfg.label}
        </span>

        {!complete && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Snooze reminder">
                <AlarmClock className="h-3.5 w-3.5" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {[15, 30, 60, 180, 1440].map((m) => (
                <DropdownMenuItem key={m} onClick={() => onSnooze(reminder.id, m)}>
                  {m < 60 ? `${m} min` : m < 1440 ? `${m / 60} hr` : '1 day'}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          aria-label="Edit reminder"
          onClick={() => onEdit(reminder)}
        >
          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive"
          aria-label="Delete reminder"
          onClick={() => onDelete(reminder)}
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
