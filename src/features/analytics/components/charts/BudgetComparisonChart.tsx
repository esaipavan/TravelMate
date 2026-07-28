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
import { BarChart2 } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { AnalyticsChartCard } from '../AnalyticsChartCard';

interface BudgetComparisonChartProps {
  data: { name: string; budget: number; actual: number }[];
  currency: string;
}

const BUDGET_COLOR = '#6366f1';
const UNDER_COLOR = '#10b981';
const OVER_COLOR = '#f43f5e';
const TICK = { fontSize: 11, fill: '#94a3b8' };

function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return String(value);
}

function truncateName(name: string, max = 10): string {
  return name.length > max ? `${name.slice(0, max)}…` : name;
}

interface BudgetEntry {
  name: string;
  value: number;
  color: string;
  payload: { currency: string };
}

function BudgetTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: BudgetEntry[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="min-w-[160px] rounded-xl border border-border/60 bg-card/95 px-3 py-2.5 shadow-float backdrop-blur-md">
      <p className="mb-2 truncate text-xs font-medium text-foreground">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
          <span className="capitalize text-muted-foreground">{entry.name}:</span>
          <span className="ml-auto font-semibold text-foreground">
            {formatCurrency(entry.value, entry.payload.currency)}
          </span>
        </div>
      ))}
    </div>
  );
}

const Legend = () => (
  <div className="flex items-center gap-4 text-xs text-muted-foreground">
    <span className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ background: BUDGET_COLOR }} />
      Budget
    </span>
    <span className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ background: UNDER_COLOR }} />
      Actual
    </span>
  </div>
);

export function BudgetComparisonChart({ data, currency }: BudgetComparisonChartProps) {
  const isEmpty = data.length === 0;
  const chartData = data.map((d) => ({ ...d, currency, shortName: truncateName(d.name) }));

  return (
    <AnalyticsChartCard
      title="Budget vs Actual"
      subtitle="Top trips by planned budget"
      accentRgb="99,102,241"
      action={<Legend />}
      isEmpty={isEmpty}
      emptyMessage="No trips with budgets set"
      emptyIcon={<BarChart2 className="h-5 w-5" />}
    >
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={chartData}
          margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
          barGap={3}
          barCategoryGap="28%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" vertical={false} />
          <XAxis dataKey="shortName" tick={TICK} axisLine={false} tickLine={false} dy={6} />
          <YAxis
            tick={TICK}
            axisLine={false}
            tickLine={false}
            tickFormatter={formatCompact}
            width={44}
          />
          <Tooltip content={<BudgetTooltip />} cursor={{ fill: 'rgba(148,163,184,0.06)' }} />

          <Bar
            dataKey="budget"
            name="budget"
            fill={BUDGET_COLOR}
            radius={[4, 4, 0, 0]}
            maxBarSize={20}
          />
          <Bar dataKey="actual" name="actual" radius={[4, 4, 0, 0]} maxBarSize={20}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.actual > entry.budget ? OVER_COLOR : UNDER_COLOR} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </AnalyticsChartCard>
  );
}
