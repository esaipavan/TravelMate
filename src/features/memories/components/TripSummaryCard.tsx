import { motion, useReducedMotion } from 'framer-motion';
import { Calendar, Wallet, BookOpen, Camera, MapPin } from 'lucide-react';
import { rv, LIST_VARIANTS, CARD_VARIANTS } from '@/lib/motion';
import type { TripStats } from '../types';

interface Props {
  stats: TripStats;
}

export function TripSummaryCard({ stats }: Props) {
  const reduced = useReducedMotion();
  const { daysTotal, totalSpent, currency, journalEntries, photosCount, citiesVisited } = stats;

  const items = [
    {
      icon: Calendar,
      label: 'Duration',
      value: `${daysTotal} day${daysTotal !== 1 ? 's' : ''}`,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      icon: Wallet,
      label: 'Total Spent',
      value: `${currency} ${totalSpent.toLocaleString()}`,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      icon: BookOpen,
      label: 'Journal Entries',
      value: journalEntries.toString(),
      color: 'text-violet-500',
      bg: 'bg-violet-500/10',
    },
    {
      icon: Camera,
      label: 'Photos',
      value: photosCount.toString(),
      color: 'text-rose-500',
      bg: 'bg-rose-500/10',
    },
    {
      icon: MapPin,
      label: 'Places Visited',
      value: `${citiesVisited.length} location${citiesVisited.length !== 1 ? 's' : ''}`,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
  ] as const;

  return (
    <motion.div
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
      variants={rv(LIST_VARIANTS, reduced)}
      initial="hidden"
      animate="show"
      role="list"
      aria-label="Trip statistics"
    >
      {items.map(({ icon: Icon, label, value, color, bg }) => (
        <motion.div
          key={label}
          role="listitem"
          variants={rv(CARD_VARIANTS, reduced)}
          className="flex flex-col gap-3 rounded-2xl border border-border/40 bg-card p-4"
        >
          <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${bg}`}>
            <Icon className={`h-4 w-4 ${color}`} aria-hidden />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {label}
            </p>
            <p className="mt-0.5 text-base font-bold tabular-nums text-foreground">{value}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
