import { motion, useReducedMotion } from 'framer-motion';
import { TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { rv, SECTION_VARIANTS } from '@/lib/motion';
import type { BudgetAnalysis } from '../types';

interface Props {
  budget: BudgetAnalysis;
  tripId: string;
  onNavigate: (path: string) => void;
}

const STATUS_META = {
  'on-track': {
    label: 'On Track',
    ring: 'rgb(16,185,129)',
    track: 'rgba(16,185,129,0.12)',
    text: 'text-emerald-600 dark:text-emerald-400',
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },
  'near-limit': {
    label: 'Near Limit',
    ring: 'rgb(245,158,11)',
    track: 'rgba(245,158,11,0.12)',
    text: 'text-amber-600 dark:text-amber-400',
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
  'over-budget': {
    label: 'Over Budget',
    ring: 'rgb(244,63,94)',
    track: 'rgba(244,63,94,0.12)',
    text: 'text-rose-600 dark:text-rose-400',
    badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  },
};

function DonutChart({
  percent,
  color,
  trackColor,
  reduced,
}: {
  percent: number;
  color: string;
  trackColor: string;
  reduced: boolean | null;
}) {
  const R = 36;
  const C = 2 * Math.PI * R;
  const pct = Math.min(100, Math.max(0, percent));
  const final = C * (1 - pct / 100);

  return (
    <div className="relative flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="h-24 w-24 -rotate-90" aria-hidden>
        <circle cx="50" cy="50" r={R} fill="none" stroke={trackColor} strokeWidth="9" />
        <motion.circle
          cx="50"
          cy="50"
          r={R}
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={C}
          initial={{ strokeDashoffset: reduced ? final : C }}
          animate={{ strokeDashoffset: final }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-black tabular-nums" style={{ color }}>
          {Math.round(pct)}%
        </span>
        <span className="text-[9px] font-medium text-muted-foreground">used</span>
      </div>
    </div>
  );
}

export function BudgetCoach({ budget, tripId: _tripId, onNavigate }: Props) {
  const reduced = useReducedMotion();
  const meta = STATUS_META[budget.status] ?? STATUS_META['on-track'];

  const fmt = (n: number) => `${budget.currency} ${Math.round(Math.abs(n)).toLocaleString()}`;

  return (
    <motion.section
      className="flex flex-col gap-4 rounded-2xl border border-border/50 bg-card p-5"
      variants={rv(SECTION_VARIANTS, reduced)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      aria-label="Budget coach"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" aria-hidden />
          <h3 className="text-sm font-bold text-foreground">Budget Coach</h3>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${meta.badge}`}
        >
          {meta.label}
        </span>
      </div>

      {/* Donut + key stat */}
      <div className="flex items-center gap-4">
        <DonutChart
          percent={budget.percentUsed}
          color={meta.ring}
          trackColor={meta.track}
          reduced={reduced}
        />
        <div className="flex-1 space-y-2">
          <Stat label="Total budget" value={fmt(budget.totalBudget)} />
          <Stat label="Spent" value={fmt(budget.totalSpent)} dim />
          <Stat label="Remaining" value={fmt(budget.remaining)} accent={meta.text} />
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border/50" />

      {/* Daily breakdown */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-muted/40 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            Daily plan
          </p>
          <p className="mt-1 text-base font-bold tabular-nums text-foreground">
            {fmt(budget.dailyAllowance)}
          </p>
          <p className="text-[10px] text-muted-foreground">per day</p>
        </div>
        <div className="rounded-xl bg-muted/40 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            Daily actual
          </p>
          <p className={`mt-1 text-base font-bold tabular-nums ${meta.text}`}>
            {fmt(budget.dailyActual)}
          </p>
          <p className="text-[10px] text-muted-foreground">per day</p>
        </div>
      </div>

      {/* Projected */}
      {budget.status !== 'on-track' && (
        <div className="flex items-center justify-between rounded-xl border border-border/40 px-3 py-2">
          <span className="text-[11px] text-muted-foreground">Projected total</span>
          <span className={`text-sm font-bold tabular-nums ${meta.text}`}>
            {fmt(budget.projectedTotal)}
          </span>
        </div>
      )}

      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-full gap-1.5 rounded-xl border border-border/50 text-xs text-muted-foreground hover:text-foreground"
        onClick={() => onNavigate('budget')}
      >
        View detailed budget
        <ArrowRight className="h-3 w-3" aria-hidden />
      </Button>
    </motion.section>
  );
}

function Stat({
  label,
  value,
  dim,
  accent,
}: {
  label: string;
  value: string;
  dim?: boolean;
  accent?: string;
}) {
  return (
    <div>
      <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/60">
        {label}
      </p>
      <p
        className={`text-xs font-bold tabular-nums ${dim ? 'text-muted-foreground' : (accent ?? 'text-foreground')}`}
      >
        {value}
      </p>
    </div>
  );
}
