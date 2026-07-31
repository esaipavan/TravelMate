import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { motion, useReducedMotion } from 'framer-motion';
import { useMemo } from 'react';
import { format, eachDayOfInterval, parseISO, isAfter } from 'date-fns';
import { CalendarDays } from 'lucide-react';
import { rv, CARD_VARIANTS } from '@/lib/motion';
import { formatCurrency } from '@/utils/formatters';
import type { ExpenseRow } from '@/features/expenses/types';

interface Props {
  expenses: ExpenseRow[];
  tripStartDate: string;
  tripEndDate: string;
  currency: string;
  dailyBudget: number;
}

interface DayData {
  day: string;
  amount: number;
  overBudget: boolean;
}

const TICK = { fontSize: 11, fill: '#94a3b8' };

interface TimelinePayload {
  value: number;
  fill: string;
  payload: { currency: string };
}

function TimelineTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TimelinePayload[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const amount = payload[0].value;
  const currency = payload[0].payload.currency;
  return (
    <div className="rounded-xl border border-border/60 bg-card/95 px-3 py-2.5 shadow-lg backdrop-blur-md">
      <p className="mb-0.5 text-xs font-medium text-foreground">{label}</p>
      <p className="text-sm font-semibold tabular-nums" style={{ color: payload[0].fill }}>
        {formatCurrency(amount, currency)}
      </p>
    </div>
  );
}

export function BudgetSpendingTimeline({
  expenses,
  tripStartDate,
  tripEndDate,
  currency,
  dailyBudget,
}: Props) {
  const reduced = useReducedMotion();

  const data = useMemo<DayData[]>(() => {
    if (!tripStartDate || !tripEndDate) return [];

    const start = parseISO(tripStartDate);
    const end = new Date(Math.min(parseISO(tripEndDate).getTime(), new Date().getTime()));

    if (isAfter(start, end)) return [];

    const days = eachDayOfInterval({ start, end });
    const capped = days.slice(0, 60);

    const byDay = new Map<string, number>();
    for (const e of expenses) {
      const prev = byDay.get(e.date) ?? 0;
      byDay.set(e.date, prev + e.amount);
    }

    return capped.map((d) => {
      const key = format(d, 'yyyy-MM-dd');
      const amount = byDay.get(key) ?? 0;
      return {
        day: format(d, 'MMM d'),
        amount,
        overBudget: dailyBudget > 0 && amount > dailyBudget,
        currency,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expenses, tripStartDate, tripEndDate, dailyBudget]);

  const isEmpty = data.length === 0 || data.every((d) => d.amount === 0);
  const displayData = data.length > 20 ? data.slice(-20) : data;

  return (
    <motion.div
      variants={rv(CARD_VARIANTS, reduced)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-20px' }}
      className="relative overflow-hidden rounded-2xl border border-border/40 bg-card/60 p-5 backdrop-blur-sm"
    >
      <div className="mb-4 flex items-center gap-2.5">
        <div className="bg-gradient-premium flex h-8 w-8 items-center justify-center rounded-lg text-white">
          <CalendarDays className="h-[15px] w-[15px]" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Daily Spending</p>
          <p className="text-[11px] text-muted-foreground">
            {dailyBudget > 0
              ? `${formatCurrency(dailyBudget, currency)}/day budget Â· red = over`
              : 'Expenses per trip day'}
          </p>
        </div>
      </div>

      {isEmpty ? (
        <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/60">
          <CalendarDays className="h-6 w-6 text-muted-foreground/40" />
          <p className="text-xs text-muted-foreground">
            {data.length === 0 ? 'Trip dates not set' : 'No expenses recorded yet'}
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={displayData}
            margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
            barCategoryGap="24%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" vertical={false} />
            <XAxis
              dataKey="day"
              tick={TICK}
              axisLine={false}
              tickLine={false}
              dy={6}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={TICK}
              axisLine={false}
              tickLine={false}
              width={40}
              tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}K` : String(v))}
            />
            <Tooltip content={<TimelineTooltip />} cursor={{ fill: 'rgba(148,163,184,0.06)' }} />
            <Bar
              dataKey="amount"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
              isAnimationActive={!reduced}
            >
              {displayData.map((entry, i) => (
                <Cell key={i} fill={entry.overBudget ? '#f43f5e' : '#6366f1'} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
}
