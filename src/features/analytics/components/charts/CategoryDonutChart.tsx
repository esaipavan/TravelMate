import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { AnalyticsChartCard } from '../AnalyticsChartCard';

interface CategoryDonutChartProps {
  data: { name: string; value: number; emoji: string }[];
  currency: string;
}

const PALETTE = [
  '#6366f1',
  '#10b981',
  '#f59e0b',
  '#f43f5e',
  '#8b5cf6',
  '#06b6d4',
  '#f97316',
  '#84cc16',
  '#ec4899',
] as const;

interface DonutPayload {
  name: string;
  value: number;
  payload: { fill: string; emoji: string; currency: string };
}

function DonutTooltip({ active, payload }: { active?: boolean; payload?: DonutPayload[] }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="rounded-xl border border-border/60 bg-card/95 px-3 py-2.5 shadow-float backdrop-blur-md">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ background: item.payload.fill }} />
        <p className="text-xs font-medium text-foreground">
          {item.payload.emoji} {item.name}
        </p>
      </div>
      <p className="mt-0.5 text-sm font-semibold text-foreground">
        {formatCurrency(item.value, item.payload.currency)}
      </p>
    </div>
  );
}

export function CategoryDonutChart({ data, currency }: CategoryDonutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const isEmpty = data.length === 0 || total === 0;
  const chartData = data.map((d) => ({
    ...d,
    currency,
    fill: PALETTE[data.indexOf(d) % PALETTE.length],
  }));

  return (
    <AnalyticsChartCard
      title="Category Breakdown"
      subtitle="Spending by expense type"
      accentRgb="16,185,129"
      isEmpty={isEmpty}
      emptyMessage="No categorised expenses yet"
      emptyIcon={<PieIcon className="h-5 w-5" />}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Donut */}
        <div className="relative h-44 w-full shrink-0 sm:w-44">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={52}
                outerRadius={78}
                strokeWidth={2}
                stroke="transparent"
                paddingAngle={3}
              >
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<DonutTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Center label */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-[10px] font-medium text-muted-foreground">Total</p>
            <p className="text-sm font-bold leading-tight text-foreground">
              {formatCurrency(total, currency)}
            </p>
          </div>
        </div>

        {/* Legend */}
        <ol className="flex min-w-0 flex-1 flex-col gap-1.5">
          {chartData.slice(0, 7).map((item, i) => {
            const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
            return (
              <li key={i} className="flex min-w-0 items-center gap-2 text-xs">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: item.fill }} />
                <span className="truncate text-muted-foreground">
                  {item.emoji} {item.name}
                </span>
                <span className="ml-auto shrink-0 font-semibold tabular-nums text-foreground">
                  {pct}%
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </AnalyticsChartCard>
  );
}
