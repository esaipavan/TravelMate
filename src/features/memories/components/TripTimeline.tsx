import { motion, useReducedMotion } from 'framer-motion';
import { Plane, MapPin, Wallet, BookOpen, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { rv, LIST_VARIANTS, LIST_ITEM_VARIANTS } from '@/lib/motion';
import type { TimelineEvent, TimelineEventType } from '../types';

interface TypeConfig {
  icon: typeof Plane;
  label: string;
  dot: string;
  bg: string;
  text: string;
}

const TYPE_CONFIG: Record<TimelineEventType, TypeConfig> = {
  departure: {
    icon: Plane,
    label: 'Departure',
    dot: 'bg-primary',
    bg: 'bg-primary/10',
    text: 'text-primary',
  },
  activity: {
    icon: MapPin,
    label: 'Activity',
    dot: 'bg-amber-500',
    bg: 'bg-amber-500/10',
    text: 'text-amber-600 dark:text-amber-400',
  },
  expense: {
    icon: Wallet,
    label: 'Expense',
    dot: 'bg-emerald-500',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
  journal: {
    icon: BookOpen,
    label: 'Journal',
    dot: 'bg-violet-500',
    bg: 'bg-violet-500/10',
    text: 'text-violet-600 dark:text-violet-400',
  },
  return: {
    icon: Plane,
    label: 'Return',
    dot: 'bg-rose-500',
    bg: 'bg-rose-500/10',
    text: 'text-rose-600 dark:text-rose-400',
  },
};

interface Props {
  events: TimelineEvent[];
}

export function TripTimeline({ events }: Props) {
  const reduced = useReducedMotion();

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/50 p-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/60">
          <Calendar className="h-6 w-6 text-muted-foreground/40" aria-hidden />
        </div>
        <p className="text-sm text-muted-foreground">
          Add itinerary items, expenses, or journal entries to build your timeline
        </p>
      </div>
    );
  }

  return (
    <motion.ol
      className="relative space-y-0 pl-8"
      variants={rv(LIST_VARIANTS, reduced)}
      initial="hidden"
      animate="show"
      aria-label="Trip timeline"
    >
      {/* Vertical connector */}
      <div className="absolute bottom-4 left-[11px] top-4 w-px bg-border/50" aria-hidden />

      {events.map((event) => {
        const cfg = TYPE_CONFIG[event.type];
        const Icon = cfg.icon;

        return (
          <motion.li
            key={event.id}
            variants={rv(LIST_ITEM_VARIANTS, reduced)}
            className="relative flex gap-4 pb-6 last:pb-0"
          >
            {/* Dot */}
            <div
              className={`absolute -left-[5px] top-2 z-10 h-[22px] w-[22px] rounded-full border-[3px] border-background ${cfg.dot} flex items-center justify-center`}
              aria-hidden
            >
              <Icon className="h-2.5 w-2.5 text-white" />
            </div>

            {/* Content */}
            <div className="ml-2 min-w-0 flex-1 rounded-xl border border-border/30 bg-card px-4 py-3">
              <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                <div className="min-w-0">
                  <div
                    className={`mb-0.5 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest ${cfg.bg} ${cfg.text}`}
                  >
                    {cfg.label}
                  </div>
                  <p className="text-sm font-semibold leading-tight text-foreground">
                    {event.title}
                  </p>
                  {event.subtitle && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{event.subtitle}</p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[11px] font-medium text-muted-foreground">
                    {format(parseISO(event.date + 'T00:00:00'), 'MMM d')}
                  </p>
                  {event.time && (
                    <p className="text-[11px] text-muted-foreground/70">{event.time}</p>
                  )}
                </div>
              </div>
              {event.amount !== undefined && (
                <p className={`mt-1.5 text-[13px] font-bold tabular-nums ${cfg.text}`}>
                  {event.currency} {event.amount.toLocaleString()}
                </p>
              )}
            </div>
          </motion.li>
        );
      })}
    </motion.ol>
  );
}
