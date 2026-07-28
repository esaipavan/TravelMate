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
import { Star } from 'lucide-react';
import { AnalyticsChartCard } from '../AnalyticsChartCard';

interface DestinationRatingsChartProps {
  data: { destination: string; rating: number; count: number }[];
}

const TICK = { fontSize: 11, fill: '#94a3b8' };

function ratingColor(rating: number): string {
  if (rating >= 4.5) return '#10b981';
  if (rating >= 3.5) return '#6366f1';
  if (rating >= 2.5) return '#f59e0b';
  return '#ef4444';
}

function truncate(name: string, max = 14): string {
  return name.length > max ? `${name.slice(0, max)}…` : name;
}

interface RatingsPayload {
  value: number;
  payload: { count: number };
}

function RatingsTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: RatingsPayload[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const rating = payload[0].value;
  const count = payload[0].payload.count;
  return (
    <div className="rounded-xl border border-border/60 bg-card/95 px-3 py-2.5 shadow-float backdrop-blur-md">
      <p className="mb-1 max-w-[160px] truncate text-xs font-medium text-foreground">{label}</p>
      <p className="text-sm font-semibold" style={{ color: ratingColor(rating) }}>
        ★ {rating.toFixed(1)} / 5.0
      </p>
      <p className="mt-0.5 text-[10px] text-muted-foreground">
        {count} {count === 1 ? 'entry' : 'entries'}
      </p>
    </div>
  );
}

export function DestinationRatingsChart({ data }: DestinationRatingsChartProps) {
  const isEmpty = data.length === 0;
  const chartData = data.map((d) => ({
    ...d,
    shortDest: truncate(d.destination),
  }));

  return (
    <AnalyticsChartCard
      title="Destination Ratings"
      subtitle="Average journal satisfaction by location — top 8"
      accentRgb="245,158,11"
      isEmpty={isEmpty}
      emptyMessage="Journal some trips to see satisfaction scores"
      emptyIcon={<Star className="h-5 w-5" />}
    >
      <ResponsiveContainer width="100%" height={Math.max(220, chartData.length * 36)}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 4, right: 16, left: 4, bottom: 0 }}
          barCategoryGap="30%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" horizontal={false} />
          <XAxis type="number" domain={[0, 5]} tick={TICK} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="shortDest"
            tick={TICK}
            axisLine={false}
            tickLine={false}
            width={96}
          />
          <Tooltip content={<RatingsTooltip />} cursor={{ fill: 'rgba(148,163,184,0.06)' }} />
          <Bar dataKey="rating" radius={[0, 6, 6, 0]} maxBarSize={14}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={ratingColor(entry.rating)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </AnalyticsChartCard>
  );
}
