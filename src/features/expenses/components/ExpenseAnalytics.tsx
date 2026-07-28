import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { parseISO, format } from 'date-fns';
import { rv, FADE_VARIANTS } from '@/lib/motion';
import { formatCurrency } from '@/utils/formatters';
import { EXPENSE_CATEGORIES } from '@/utils/constants';
import { parseSplitMeta } from '../utils/settlement';
import type { ExpenseRow } from '../types';
import type { TripMember } from '../utils/settlement';

/* ── Colors ──────────────────────────────────────────────────────── */

const CAT_COLORS: Record<string, string> = {
  hotel: '#6366f1',
  food: '#f97316',
  transport: '#8b5cf6',
  shopping: '#ec4899',
  activity: '#10b981',
  emergency: '#ef4444',
  fuel: '#eab308',
  taxi: '#14b8a6',
  misc: '#6b7280',
};

/* ── Donut chart ─────────────────────────────────────────────────── */

interface DonutSeg {
  key: string;
  label: string;
  emoji: string;
  amount: number;
  pct: number;
  color: string;
}

function DonutChart({
  segments,
  total,
  currency,
}: {
  segments: DonutSeg[];
  total: number;
  currency: string;
}) {
  const R = 56;
  const CX = 80;
  const CY = 80;
  const CIRC = 2 * Math.PI * R;
  const SW = 18;

  let accumulated = 0;

  return (
    <svg
      viewBox="0 0 160 160"
      className="h-36 w-36 shrink-0"
      role="img"
      aria-label="Category spending breakdown"
    >
      {/* Background ring */}
      <circle
        cx={CX}
        cy={CY}
        r={R}
        fill="none"
        strokeWidth={SW}
        stroke="#e5e7eb"
        className="dark:stroke-zinc-700"
      />
      {segments.map((seg) => {
        const dashLen = seg.pct * CIRC;
        const rotation = -90 + accumulated * 360;
        accumulated += seg.pct;
        return (
          <circle
            key={seg.key}
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            stroke={seg.color}
            strokeWidth={SW}
            strokeDasharray={`${dashLen} ${CIRC}`}
            transform={`rotate(${rotation} ${CX} ${CY})`}
          />
        );
      })}
      {/* Center total */}
      <text
        x={CX}
        y={CY - 5}
        textAnchor="middle"
        style={{
          fontSize: '9px',
          fontWeight: 700,
          fill: 'currentColor',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {formatCurrency(total, currency)}
      </text>
      <text x={CX} y={CY + 9} textAnchor="middle" style={{ fontSize: '8px', fill: '#9ca3af' }}>
        total
      </text>
    </svg>
  );
}

/* ── Props ───────────────────────────────────────────────────────── */

interface Props {
  expenses: ExpenseRow[];
  currency: string;
  members: TripMember[];
  ownerMemberId: string;
  tripStartDate: string;
  tripEndDate: string;
}

/* ── Component ───────────────────────────────────────────────────── */

export function ExpenseAnalytics({
  expenses,
  currency,
  members,
  ownerMemberId,
  tripStartDate,
  tripEndDate,
}: Props) {
  const reduced = useReducedMotion();

  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);

  /* Category breakdown */
  const catSpend = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((e) => {
      map[e.category] = (map[e.category] ?? 0) + e.amount;
    });
    return map;
  }, [expenses]);

  const donutSegments = useMemo((): DonutSeg[] => {
    if (totalSpent === 0) return [];
    return Object.entries(catSpend)
      .sort((a, b) => b[1] - a[1])
      .map(([key, amount]) => {
        const meta = EXPENSE_CATEGORIES.find((c) => c.value === key);
        return {
          key,
          label: meta?.label ?? key,
          emoji: meta?.emoji ?? '💰',
          amount,
          pct: amount / totalSpent,
          color: CAT_COLORS[key] ?? '#6b7280',
        };
      });
  }, [catSpend, totalSpent]);

  /* Member breakdown — paid per person */
  const memberSpend = useMemo(() => {
    const map = new Map<string, number>(members.map((m) => [m.id, 0]));
    expenses.forEach((e) => {
      const meta = parseSplitMeta(e.notes);
      const payerId = meta?._paidBy ?? ownerMemberId;
      if (map.has(payerId)) {
        map.set(payerId, (map.get(payerId) ?? 0) + e.amount);
      }
    });
    return map;
  }, [expenses, members, ownerMemberId]);

  const maxMemberSpend = Math.max(...Array.from(memberSpend.values()), 1);

  /* Daily spending (group by expense date) */
  const dailyData = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((e) => {
      map[e.date] = (map[e.date] ?? 0) + e.amount;
    });
    const startD = parseISO(tripStartDate + 'T00:00:00');
    const endD = parseISO(tripEndDate + 'T00:00:00');
    const days: { date: string; label: string; amount: number }[] = [];
    const cur = new Date(startD);
    while (cur <= endD && days.length < 30) {
      const key = format(cur, 'yyyy-MM-dd');
      days.push({ date: key, label: format(cur, 'MMM d'), amount: map[key] ?? 0 });
      cur.setDate(cur.getDate() + 1);
    }
    return days;
  }, [expenses, tripStartDate, tripEndDate]);

  const maxDaily = Math.max(...dailyData.map((d) => d.amount), 1);

  if (totalSpent === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border/60 py-16 text-center">
        <p className="text-4xl" aria-hidden="true">
          📊
        </p>
        <div>
          <p className="font-semibold text-foreground">No data yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Add some expenses to see analytics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category donut + legend */}
      <motion.div
        variants={rv(FADE_VARIANTS, reduced)}
        initial="hidden"
        animate="show"
        className="rounded-2xl border border-border/60 bg-card p-4"
      >
        <h3 className="mb-4 text-sm font-semibold text-foreground">Spending by category</h3>
        <div className="flex items-start gap-4">
          <DonutChart segments={donutSegments} total={totalSpent} currency={currency} />
          <div className="min-w-0 flex-1 space-y-2">
            {donutSegments.slice(0, 6).map((seg) => (
              <div key={seg.key} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: seg.color }}
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                  {seg.label}
                </span>
                <span className="shrink-0 text-xs font-semibold tabular-nums text-foreground">
                  {Math.round(seg.pct * 100)}%
                </span>
              </div>
            ))}
            {donutSegments.length > 6 && (
              <p className="text-xs text-muted-foreground">+{donutSegments.length - 6} more</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Category bars */}
      <motion.div
        variants={rv(FADE_VARIANTS, reduced)}
        initial="hidden"
        animate="show"
        className="rounded-2xl border border-border/60 bg-card p-4"
      >
        <h3 className="mb-4 text-sm font-semibold text-foreground">Category breakdown</h3>
        <div className="space-y-3">
          {donutSegments.map((seg) => (
            <div key={seg.key}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <span aria-hidden="true">{seg.emoji}</span>
                  {seg.label}
                </span>
                <span className="tabular-nums text-muted-foreground">
                  {formatCurrency(seg.amount, currency)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: seg.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${seg.pct * 100}%` }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Member spending */}
      {members.length > 1 && (
        <motion.div
          variants={rv(FADE_VARIANTS, reduced)}
          initial="hidden"
          animate="show"
          className="rounded-2xl border border-border/60 bg-card p-4"
        >
          <h3 className="mb-4 text-sm font-semibold text-foreground">Spending by member</h3>
          <div className="space-y-3">
            {members.map((m) => {
              const amount = memberSpend.get(m.id) ?? 0;
              const pct = (amount / maxMemberSpend) * 100;
              return (
                <div key={m.id}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[9px] font-bold text-primary">
                        {m.initials}
                      </span>
                      <span className="font-medium text-foreground">{m.name}</span>
                    </span>
                    <span className="tabular-nums text-muted-foreground">
                      {formatCurrency(amount, currency)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.7, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Daily spending bars */}
      {dailyData.some((d) => d.amount > 0) && (
        <motion.div
          variants={rv(FADE_VARIANTS, reduced)}
          initial="hidden"
          animate="show"
          className="rounded-2xl border border-border/60 bg-card p-4"
        >
          <h3 className="mb-4 text-sm font-semibold text-foreground">Daily spending</h3>
          <div className="overflow-x-auto">
            <div className="flex min-w-0 items-end gap-1" style={{ height: '100px' }}>
              {dailyData.map((d) => {
                const barPct = (d.amount / maxDaily) * 100;
                return (
                  <div
                    key={d.date}
                    className="group relative flex min-w-[20px] flex-1 flex-col items-center justify-end"
                    style={{ height: '100%' }}
                    title={`${d.label}: ${formatCurrency(d.amount, currency)}`}
                  >
                    {/* Bar */}
                    <div
                      className={`w-full rounded-t-sm transition-colors ${d.amount > 0 ? 'bg-primary/70 group-hover:bg-primary' : 'bg-transparent'}`}
                      style={{ height: `${barPct}%`, minHeight: d.amount > 0 ? '4px' : '0' }}
                    />
                  </div>
                );
              })}
            </div>
            {/* X-axis labels (sparse to avoid crowding) */}
            <div className="mt-2 flex items-center">
              {dailyData.map((d, i) => (
                <div key={d.date} className="min-w-[20px] flex-1 text-center">
                  {(i === 0 ||
                    i === Math.floor(dailyData.length / 2) ||
                    i === dailyData.length - 1) && (
                    <p className="truncate text-[9px] text-muted-foreground">{d.label}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
