import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, useReducedMotion } from 'framer-motion';
import { PieChart as PieIcon } from 'lucide-react';
import { rv, CARD_VARIANTS } from '@/lib/motion';
import { formatCurrency } from '@/utils/formatters';
import type { CategoryBudgetItem } from '../../types';

interface Props {
  items: CategoryBudgetItem[];
  currency: string;
}

const PALETTE = [
  '#6366f1',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#10b981',
  '#f97316',
  '#14b8a6',
  '#ef4444',
  '#94a3b8',
];

interface DonutPayload {
  name: string;
  value: number;
  payload: { emoji: string; currency: string; pct: number };
}

function DonutTooltip({ active, payload }: { active?: boolean; payload?: DonutPayload[] }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="rounded-xl border border-border/60 bg-card/95 px-3 py-2.5 shadow-lg backdrop-blur-md">
      <div className="flex items-center gap-2">
        <span className="text-sm">{item.payload.emoji}</span>
        <p className="text-xs font-medium text-foreground">{item.name}</p>
      </div>
      <p className="mt-0.5 text-sm font-semibold text-foreground">
        {formatCurrency(item.value, item.payload.currency)}
      </p>
      <p className="text-[10px] text-muted-foreground">
        {item.payload.pct.toFixed(1)}% of spending
      </p>
    </div>
  );
}

export function BudgetCategoryDonut({ items, currency }: Props) {
  const reduced = useReducedMotion();

  const data = items
    .filter((i) => i.spent > 0)
    .map((i) => ({ ...i, pct: 0, currency }))
    .sort((a, b) => b.spent - a.spent);

  const total = data.reduce((s, d) => s + d.spent, 0);
  data.forEach((d) => {
    d.pct = total > 0 ? (d.spent / total) * 100 : 0;
  });

  const isEmpty = data.length === 0;

  return (
    <motion.div
      variants={rv(CARD_VARIANTS, reduced)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-20px' }}
      className="relative overflow-hidden rounded-2xl border border-border/40 bg-card/60 p-5 backdrop-blur-sm"
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 text-white">
          <PieIcon className="h-[15px] w-[15px]" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Category Spending</p>
          <p className="text-[11px] text-muted-foreground">Expenses by category</p>
        </div>
      </div>

      {isEmpty ? (
        <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/60">
          <PieIcon className="h-6 w-6 text-muted-foreground/40" />
          <p className="text-xs text-muted-foreground">No expenses recorded yet</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          {/* Donut */}
          <div className="relative h-40 w-40 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="spent"
                  nameKey="label"
                  innerRadius={46}
                  outerRadius={70}
                  paddingAngle={3}
                  strokeWidth={2}
                  stroke="transparent"
                  isAnimationActive={!reduced}
                >
                  {data.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip content={<DonutTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center total */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-sm font-bold tabular-nums text-foreground">
                {formatCurrency(total, currency)}
              </p>
              <p className="text-[10px] text-muted-foreground">total</p>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-1 flex-col gap-2 overflow-hidden">
            {data.slice(0, 6).map((item, i) => (
              <div key={item.category} className="flex min-w-0 items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: PALETTE[i % PALETTE.length] }}
                />
                <span className="shrink-0 text-xs text-foreground">{item.emoji}</span>
                <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                  {item.label}
                </span>
                <span className="shrink-0 text-xs font-medium tabular-nums text-foreground">
                  {item.pct.toFixed(0)}%
                </span>
              </div>
            ))}
            {data.length > 6 && (
              <p className="text-[10px] text-muted-foreground">+{data.length - 6} more</p>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
