import { useState, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameDay,
  isSameMonth,
  isBefore,
  isWithinInterval,
  parseISO,
  differenceInDays,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, Sun, TrendingUp } from 'lucide-react';
import { rv, FADE_VARIANTS, CARD_VARIANTS } from '@/lib/motion';
import { useWizard } from '../WizardContext';

/* ── Helpers ─────────────────────────────────────────────────────── */

function getCalendarGrid(view: Date): Date[] {
  const start = startOfWeek(startOfMonth(view), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(view), { weekStartsOn: 1 });
  const days: Date[] = [];
  let d = start;
  while (!isBefore(end, d)) {
    days.push(d);
    d = addDays(d, 1);
  }
  return days;
}

function getSeason(month: number): string {
  if (month >= 2 && month <= 4) return 'Spring 🌸';
  if (month >= 5 && month <= 7) return 'Summer ☀️';
  if (month >= 8 && month <= 10) return 'Autumn 🍂';
  return 'Winter ❄️';
}

function getCountdown(dateStr: string): number {
  const target = parseISO(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return differenceInDays(target, today);
}

const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/* ── Single month calendar ───────────────────────────────────────── */

function MonthCalendar({
  viewDate,
  startDate,
  endDate,
  hovered,
  onDayClick,
  onDayHover,
}: {
  viewDate: Date;
  startDate: Date | null;
  endDate: Date | null;
  hovered: Date | null;
  onDayClick: (d: Date) => void;
  onDayHover: (d: Date | null) => void;
}) {
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);
  const days = useMemo(() => getCalendarGrid(viewDate), [viewDate]);

  function dayClass(day: Date): string {
    const past = isBefore(day, today);
    const inMonth = isSameMonth(day, viewDate);
    const isStart = startDate && isSameDay(day, startDate);
    const isEnd = endDate && isSameDay(day, endDate);
    const isHovEnd = !endDate && hovered && startDate && isSameDay(day, hovered);
    const inRange =
      startDate && endDate
        ? isWithinInterval(day, { start: startDate, end: endDate })
        : startDate && hovered && !endDate && !isBefore(hovered, startDate)
          ? isWithinInterval(day, { start: startDate, end: hovered })
          : false;

    const base = [
      'relative flex h-9 w-9 items-center justify-center rounded-full text-sm transition-all duration-150',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
    ];

    if (past) base.push('pointer-events-none text-muted-foreground/30');
    else if (!inMonth) base.push('text-muted-foreground/40');
    else base.push('text-foreground');

    if (isStart || isEnd || isHovEnd) {
      base.push('bg-primary text-primary-foreground font-semibold shadow-md z-10');
    } else if (inRange) {
      base.push('rounded-none bg-primary/15 text-primary font-medium');
    } else if (!past) {
      base.push('hover:bg-muted cursor-pointer');
    }

    // Round left edge of range at start, right edge at end
    if (isStart && (endDate || hovered)) base.push('rounded-l-full');
    if ((isEnd || isHovEnd) && startDate) base.push('rounded-r-full');

    return base.join(' ');
  }

  return (
    <div className="select-none">
      {/* Month title */}
      <p className="mb-3 text-center text-sm font-semibold text-foreground">
        {format(viewDate, 'MMMM yyyy')}
      </p>
      {/* Day headers */}
      <div className="mb-1 grid grid-cols-7 gap-0.5">
        {DAY_HEADERS.map((h) => (
          <div
            key={h}
            className="py-1 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
          >
            {h}
          </div>
        ))}
      </div>
      {/* Grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day, i) => (
          <div key={i} className="flex justify-center">
            <button
              type="button"
              onClick={() => !isBefore(day, today) && onDayClick(day)}
              onMouseEnter={() => !isBefore(day, today) && onDayHover(day)}
              onMouseLeave={() => onDayHover(null)}
              aria-label={format(day, 'MMMM d, yyyy')}
              aria-pressed={
                (startDate && isSameDay(day, startDate)) || (endDate && isSameDay(day, endDate))
                  ? true
                  : undefined
              }
              className={dayClass(day)}
            >
              {format(day, 'd')}
              {/* Today dot */}
              {isSameDay(day, today) && (
                <span
                  className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary"
                  aria-hidden="true"
                />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Trip summary bar ────────────────────────────────────────────── */

function TripSummary({ startStr, endStr }: { startStr: string; endStr: string }) {
  const reduced = useReducedMotion();
  const start = parseISO(startStr + 'T00:00:00');
  const end = parseISO(endStr + 'T00:00:00');
  const nights = differenceInDays(end, start);
  const days = nights + 1;
  const countdown = getCountdown(startStr);
  const season = getSeason(start.getMonth());

  return (
    <motion.div
      variants={rv(CARD_VARIANTS, reduced)}
      initial="hidden"
      animate="show"
      className="grid grid-cols-3 gap-3"
    >
      {[
        {
          icon: Clock,
          label: 'Duration',
          value: `${days} day${days !== 1 ? 's' : ''} · ${nights} night${nights !== 1 ? 's' : ''}`,
        },
        { icon: Sun, label: 'Season', value: season },
        {
          icon: TrendingUp,
          label: countdown > 0 ? 'Countdown' : 'Status',
          value: countdown > 0 ? `${countdown} days away` : 'Trip started!',
        },
      ].map(({ icon: Icon, label, value }) => (
        <div
          key={label}
          className="rounded-2xl border border-border/60 bg-card p-3 text-center shadow-sm"
        >
          <Icon className="mx-auto mb-1.5 h-4 w-4 text-primary" aria-hidden="true" />
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-0.5 text-sm font-semibold text-foreground">{value}</p>
        </div>
      ))}
    </motion.div>
  );
}

/* ── Step ────────────────────────────────────────────────────────── */

export function DatesStep() {
  const reduced = useReducedMotion();
  const { state, dispatch } = useWizard();

  const [view, setView] = useState(() => {
    if (state.startDate) return parseISO(state.startDate + 'T00:00:00');
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [hovered, setHovered] = useState<Date | null>(null);

  const startDate = state.startDate ? parseISO(state.startDate + 'T00:00:00') : null;
  const endDate = state.endDate ? parseISO(state.endDate + 'T00:00:00') : null;

  function handleDayClick(day: Date) {
    const ds = format(day, 'yyyy-MM-dd');
    if (!startDate || (startDate && endDate)) {
      // Start fresh range
      dispatch({ type: 'SET_DATES', startDate: ds, endDate: '' });
    } else {
      // Complete the range
      if (isBefore(day, startDate)) {
        dispatch({ type: 'SET_DATES', startDate: ds, endDate: '' });
      } else {
        dispatch({ type: 'SET_DATES', startDate: state.startDate, endDate: ds });
      }
    }
  }

  const hasRange = !!state.startDate && !!state.endDate;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <motion.p
          className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary"
          variants={rv(FADE_VARIANTS, reduced)}
          initial="hidden"
          animate="show"
        >
          Step 3 of 7
        </motion.p>
        <motion.h1
          className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          variants={rv(FADE_VARIANTS, reduced)}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.05 }}
        >
          When are you travelling?
        </motion.h1>
        <motion.p
          className="mt-2 text-base text-muted-foreground"
          variants={rv(FADE_VARIANTS, reduced)}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.1 }}
        >
          {!startDate
            ? 'Tap a date to set your departure.'
            : !endDate
              ? 'Now tap your return date.'
              : `${format(startDate, 'MMM d')} – ${format(endDate, 'MMM d, yyyy')}`}
        </motion.p>
      </div>

      {/* Calendar */}
      <motion.div
        variants={rv(CARD_VARIANTS, reduced)}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.12 }}
        className="rounded-3xl border border-border/60 bg-card p-5 shadow-sm"
      >
        {/* Month navigation */}
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setView(subMonths(view, 1))}
            aria-label="Previous month"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span />
          <button
            type="button"
            onClick={() => setView(addMonths(view, 1))}
            aria-label="Next month"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Single month grid */}
        <MonthCalendar
          viewDate={view}
          startDate={startDate}
          endDate={endDate}
          hovered={hovered}
          onDayClick={handleDayClick}
          onDayHover={setHovered}
        />
      </motion.div>

      {/* Selected range chips */}
      {(state.startDate || state.endDate) && (
        <div className="flex items-center gap-3">
          <div
            className={[
              'flex-1 rounded-2xl border px-4 py-3',
              state.startDate ? 'border-primary/40 bg-primary/5' : 'border-dashed border-border',
            ].join(' ')}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Departure
            </p>
            <p className="mt-0.5 text-sm font-semibold text-foreground">
              {state.startDate
                ? format(parseISO(state.startDate + 'T00:00:00'), 'EEE, MMM d yyyy')
                : 'Not set'}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <div
            className={[
              'flex-1 rounded-2xl border px-4 py-3',
              state.endDate ? 'border-primary/40 bg-primary/5' : 'border-dashed border-border',
            ].join(' ')}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Return
            </p>
            <p className="mt-0.5 text-sm font-semibold text-foreground">
              {state.endDate
                ? format(parseISO(state.endDate + 'T00:00:00'), 'EEE, MMM d yyyy')
                : 'Tap to set'}
            </p>
          </div>
        </div>
      )}

      {/* Trip summary */}
      <AnimatePresence>
        {hasRange && (
          <TripSummary key="summary" startStr={state.startDate} endStr={state.endDate} />
        )}
      </AnimatePresence>
    </div>
  );
}
