import { motion, useReducedMotion } from 'framer-motion';
import { CalendarDays, Clock, Wallet, Plane } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency, tripDuration } from '@/utils/formatters';
import { getTripStatus } from '@/utils/tripStatus';
import { differenceInDays, parseISO } from 'date-fns';
import type { TripRow } from '../types';

/* ── Stat chip ────────────────────────────────────────────────── */
interface StatChipProps {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  accent?: string;
  index: number;
}

function StatChip({ icon: Icon, label, value, sub, accent, index }: StatChipProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className="flex flex-col gap-1 rounded-2xl border border-border/40 bg-card px-4 py-4 shadow-card"
      initial={reduced ? {} : { opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={
        reduced
          ? { duration: 0 }
          : { type: 'spring', damping: 22, stiffness: 160, delay: index * 0.07 }
      }
      whileHover={reduced ? {} : { y: -3, boxShadow: '0 8px 24px -6px rgba(0,0,0,0.10)' }}
    >
      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3 w-3 shrink-0" aria-hidden />
        {label}
      </div>
      <p className={cn('text-xl font-bold tabular-nums leading-tight text-foreground', accent)}>
        {value}
      </p>
      {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
    </motion.div>
  );
}

/* ── TripStatsRow ─────────────────────────────────────────────── */
interface Props {
  trip: TripRow;
}

export function TripStatsRow({ trip }: Props) {
  const status = getTripStatus(trip);
  const duration = tripDuration(trip.start_date, trip.end_date);

  const today = parseISO(new Date().toISOString().split('T')[0] + 'T00:00:00');
  const start = parseISO(trip.start_date + 'T00:00:00');
  const end = parseISO(trip.end_date + 'T00:00:00');

  /* Countdown / progress chip */
  let timeLabel = '';
  let timeValue = '';
  let timeSub = '';
  let timeAccent: string | undefined;

  if (status === 'upcoming') {
    const days = differenceInDays(start, today);
    timeLabel = 'Countdown';
    timeValue = `${days}d`;
    timeSub = 'until departure';
    timeAccent = 'text-primary';
  } else if (status === 'active') {
    const passed = Math.max(0, differenceInDays(today, start)) + 1;
    const left = Math.max(0, differenceInDays(end, today));
    const pct = Math.min(100, Math.round(((passed - 1) / duration) * 100));
    timeLabel = 'Progress';
    timeValue = `${pct}%`;
    timeSub = `Day ${passed} · ${left}d left`;
    timeAccent = 'text-emerald-500';
  } else if (status === 'completed') {
    const days = differenceInDays(today, end);
    timeLabel = 'Completed';
    timeValue = `${days}d`;
    timeSub = 'ago';
  } else {
    timeLabel = 'Status';
    timeValue = 'Cancelled';
  }

  const chips: Omit<StatChipProps, 'index'>[] = [
    {
      icon: CalendarDays,
      label: 'Duration',
      value: `${duration}d`,
      sub: `${duration} day${duration !== 1 ? 's' : ''}`,
    },
    {
      icon: Clock,
      label: timeLabel,
      value: timeValue,
      sub: timeSub,
      accent: timeAccent,
    },
    {
      icon: Plane,
      label: 'Destination',
      value: trip.destination.split(',')[0].trim(),
      sub: trip.country_code ?? undefined,
    },
    ...(trip.total_budget != null
      ? [
          {
            icon: Wallet,
            label: 'Budget',
            value: formatCurrency(trip.total_budget, trip.currency),
            sub: trip.currency,
          },
        ]
      : []),
  ];

  return (
    <div
      className={cn(
        'grid gap-3',
        chips.length === 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3',
      )}
    >
      {chips.map((chip, i) => (
        <StatChip key={chip.label} {...chip} index={i} />
      ))}
    </div>
  );
}
