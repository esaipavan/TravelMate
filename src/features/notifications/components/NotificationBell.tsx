import { Bell, BellDot, Clock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useNotificationSummary } from '../hooks/useNotificationSummary';

export function NotificationBell() {
  const { items, count } = useNotificationSummary();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={
            count > 0 ? `${count} upcoming reminder${count !== 1 ? 's' : ''}` : 'Reminders'
          }
          className="relative"
        >
          {count > 0 ? (
            <>
              <BellDot className="h-4 w-4" aria-hidden="true" />
              <span
                aria-hidden="true"
                className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground"
              >
                {count > 9 ? '9+' : count}
              </span>
            </>
          ) : (
            <Bell className="h-4 w-4" aria-hidden="true" />
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-sm font-semibold text-foreground">Upcoming Reminders</h3>
          {count > 0 && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
              {count}
            </span>
          )}
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
            <Bell className="h-6 w-6 text-muted-foreground/30" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">All clear for the next 7 days</p>
          </div>
        ) : (
          <ul className="divide-y" role="list">
            {items.map((item) => (
              <li key={item.id} className="px-4 py-2.5">
                <div className="flex items-start gap-2.5">
                  {item.isOverdue ? (
                    <AlertCircle
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive"
                      aria-hidden="true"
                    />
                  ) : (
                    <Clock
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        'truncate text-sm',
                        item.isOverdue ? 'font-medium text-destructive' : 'text-foreground',
                      )}
                    >
                      {item.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {item.isOverdue
                        ? `Overdue — was ${format(parseISO(item.dueDate + 'T00:00:00'), 'MMM d')}`
                        : format(parseISO(item.dueDate + 'T00:00:00'), 'EEE, MMM d')}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="border-t px-4 py-3">
          <Button asChild variant="ghost" size="sm" className="w-full text-xs">
            <Link to="/reminders">View all reminders →</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
