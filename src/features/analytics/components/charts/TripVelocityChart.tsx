import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Map } from 'lucide-react';
import { AnalyticsChartCard } from '../AnalyticsChartCard';

interface TripVelocityChartProps {
  data: { month: string; count: number }[];
}

const STROKE = '#8b5cf6';
const TICK = { fontSize: 11, fill: '#94a3b8' };

interface VelocityPayload {
  value: number;
}

function VelocityTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: VelocityPayload[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const count = payload[0].value;
  return (
    <div className="rounded-xl border border-border/60 bg-card/95 px-3 py-2.5 shadow-float backdrop-blur-md">
      <p className="mb-0.5 text-xs font-medium text-foreground">{label}</p>
      <p className="text-sm font-semibold" style={{ color: STROKE }}>
        {count} {count === 1 ? 'trip' : 'trips'}
      </p>
    </div>
  );
}

export function TripVelocityChart({ data }: TripVelocityChartProps) {
  const isEmpty = data.length === 0 || data.every((d) => d.count === 0);

  return (
    <AnalyticsChartCard
      title="Trip Frequency"
      subtitle="Trips taken per month — last 12 months"
      accentRgb="139,92,246"
      isEmpty={isEmpty}
      emptyMessage="No trip history recorded yet"
      emptyIcon={<Map className="h-5 w-5" />}
    >
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="trips-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={STROKE} stopOpacity={0.2} />
              <stop offset="95%" stopColor={STROKE} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" vertical={false} />
          <XAxis dataKey="month" tick={TICK} axisLine={false} tickLine={false} dy={6} />
          <YAxis tick={TICK} axisLine={false} tickLine={false} allowDecimals={false} width={28} />
          <Tooltip
            content={<VelocityTooltip />}
            cursor={{ stroke: STROKE, strokeWidth: 1, strokeDasharray: '4 4' }}
          />

          <Area
            type="monotone"
            dataKey="count"
            stroke={STROKE}
            strokeWidth={2.5}
            fill="url(#trips-grad)"
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0, fill: STROKE }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </AnalyticsChartCard>
  );
}
