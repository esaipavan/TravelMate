import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { AnalyticsChartCard } from '../AnalyticsChartCard';

interface SpendingTrendChartProps {
  data: { month: string; amount: number }[];
  currency: string;
}

const STROKE = '#6366f1';
const TICK = { fontSize: 11, fill: '#94a3b8' };

interface SpendingPayload {
  value: number;
  payload: { currency: string };
}

function SpendingTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: SpendingPayload[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border/60 bg-card/95 px-3 py-2.5 shadow-float backdrop-blur-md">
      <p className="mb-1 text-xs font-medium text-foreground">{label}</p>
      <p className="text-sm font-semibold" style={{ color: STROKE }}>
        {formatCurrency(payload[0].value, payload[0].payload.currency)}
      </p>
    </div>
  );
}

function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return String(value);
}

export function SpendingTrendChart({ data, currency }: SpendingTrendChartProps) {
  const dataWithCurrency = data.map((d) => ({ ...d, currency }));
  const isEmpty = data.length === 0 || data.every((d) => d.amount === 0);

  return (
    <AnalyticsChartCard
      title="Spending Trend"
      subtitle="Monthly expense overview — last 12 months"
      accentRgb="99,102,241"
      isEmpty={isEmpty}
      emptyMessage="No expense data recorded yet"
      emptyIcon={<TrendingUp className="h-5 w-5" />}
    >
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={dataWithCurrency} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="spending-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={STROKE} stopOpacity={0.18} />
              <stop offset="95%" stopColor={STROKE} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" vertical={false} />

          <XAxis dataKey="month" tick={TICK} axisLine={false} tickLine={false} dy={6} />
          <YAxis
            tick={TICK}
            axisLine={false}
            tickLine={false}
            tickFormatter={formatCompact}
            width={44}
            domain={[0, 'auto']}
            tickCount={5}
            allowDecimals={false}
          />

          <Tooltip
            content={<SpendingTooltip />}
            cursor={{ stroke: STROKE, strokeWidth: 1, strokeDasharray: '4 4' }}
          />

          <Area
            type="monotone"
            dataKey="amount"
            stroke={STROKE}
            strokeWidth={2.5}
            fill="url(#spending-grad)"
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0, fill: STROKE }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </AnalyticsChartCard>
  );
}
