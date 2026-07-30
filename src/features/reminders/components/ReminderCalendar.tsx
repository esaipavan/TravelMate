import { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  parseISO,
  addMonths,
  subMonths,
  isToday,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ReminderRow } from '../types';
import { PRIORITY_CONFIG, getEffectiveStatus } from '../types';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface Props {
  reminders: ReminderRow[];
  onDayClick: (date: Date, reminders: ReminderRow[]) => void;
}

export function ReminderCalendar({ reminders, onDayClick }: Props) {
  const [current, setCurrent] = useState(() => new Date());

  const monthStart = startOfMonth(current);
  const monthEnd = endOfMonth(current);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  function remindersForDay(day: Date): ReminderRow[] {
    const key = format(day, 'yyyy-MM-dd');
    return reminders.filter((r) => r.reminder_date === key);
  }

  return (
    <div className="rounded-xl border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="font-semibold">{format(current, 'MMMM yyyy')}</h3>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrent((d) => subMonths(d, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs"
            onClick={() => setCurrent(new Date())}
          >
            Today
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrent((d) => addMonths(d, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 border-b">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-2 text-center text-xs font-medium text-muted-foreground">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          const dayReminders = remindersForDay(day);
          const inMonth = isSameMonth(day, current);
          const today = isToday(day);

          return (
            <button
              key={i}
              type="button"
              onClick={() => dayReminders.length > 0 && onDayClick(day, dayReminders)}
              className={`min-h-[4.5rem] border-b border-r p-1.5 text-left transition-colors last:border-r-0 ${
                !inMonth ? 'bg-muted/20 opacity-50' : 'hover:bg-accent/40'
              } ${today ? 'bg-primary/5' : ''}`}
            >
              <span
                className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                  today ? 'bg-primary text-primary-foreground' : 'text-foreground'
                }`}
              >
                {format(day, 'd')}
              </span>

              {/* Priority dots */}
              {dayReminders.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-0.5">
                  {dayReminders.slice(0, 3).map((r) => {
                    const status = getEffectiveStatus(r);
                    const dotCls =
                      status === 'completed'
                        ? 'bg-emerald-500'
                        : status === 'overdue'
                          ? 'bg-destructive'
                          : PRIORITY_CONFIG[r.priority].dotClass;
                    return (
                      <span
                        key={r.id}
                        className={`h-1.5 w-1.5 rounded-full ${dotCls}`}
                        title={r.title}
                      />
                    );
                  })}
                  {dayReminders.length > 3 && (
                    <span className="text-[10px] leading-none text-muted-foreground">
                      +{dayReminders.length - 3}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 border-t px-4 py-2 text-xs text-muted-foreground">
        {[
          { cls: 'bg-destructive', label: 'Overdue / High' },
          { cls: 'bg-amber-500', label: 'Medium' },
          { cls: 'bg-muted-foreground', label: 'Low' },
          { cls: 'bg-emerald-500', label: 'Completed' },
        ].map(({ cls, label }) => (
          <span key={label} className="flex items-center gap-1">
            <span className={`h-2 w-2 rounded-full ${cls}`} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Day detail panel ──────────────────────────────────────────────────────────

interface DayDetailProps {
  date: Date;
  reminders: ReminderRow[];
  onEdit: (r: ReminderRow) => void;
  onToggle: (id: string, complete: boolean) => void;
}

export function DayDetail({ date, reminders, onEdit, onToggle }: DayDetailProps) {
  return (
    <div className="rounded-xl border bg-card">
      <div className="border-b px-4 py-3">
        <h4 className="font-semibold">{format(date, 'EEEE, dd MMMM yyyy')}</h4>
      </div>
      <div className="divide-y">
        {reminders.map((r) => {
          const status = getEffectiveStatus(r);
          const complete = status === 'completed';
          return (
            <div key={r.id} className="flex items-center gap-3 px-4 py-3 hover:bg-accent/30">
              <button
                type="button"
                onClick={() => onToggle(r.id, !complete)}
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                  complete ? 'border-emerald-500 bg-emerald-500' : 'border-muted-foreground'
                }`}
              >
                {complete && <span className="text-[10px] text-white">✓</span>}
              </button>
              <div className="min-w-0 flex-1">
                <p
                  className={`truncate text-sm font-medium ${complete ? 'text-muted-foreground line-through' : ''}`}
                >
                  {r.title}
                </p>
                {r.reminder_time && (
                  <p className="text-xs text-muted-foreground">{r.reminder_time.slice(0, 5)}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={() => onEdit(r)}
              >
                <span className="text-xs">✏️</span>
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Helper to check if two dates represent the same day ─────────────────────

// eslint-disable-next-line react-refresh/only-export-components
export { isSameDay, parseISO };
