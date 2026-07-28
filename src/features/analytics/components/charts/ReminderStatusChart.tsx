import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Bell } from 'lucide-react';
import { AnalyticsChartCard } from '../AnalyticsChartCard';

interface ReminderStatusChartProps {
  data: { name: string; value: number; color: string }[];
}

interface StatusPayload {
  name: string;
  value: number;
  payload: { color: string };
}

function StatusTooltip({ active, payload }: { active?: boolean; payload?: StatusPayload[] }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="rounded-xl border border-border/60 bg-card/95 px-3 py-2.5 shadow-float backdrop-blur-md">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ background: item.payload.color }} />
        <p className="text-xs font-medium text-foreground">{item.name}</p>
      </div>
      <p className="mt-0.5 text-sm font-semibold text-foreground">
        {item.value} {item.value === 1 ? 'reminder' : 'reminders'}
      </p>
    </div>
  );
}

export function ReminderStatusChart({ data }: ReminderStatusChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const isEmpty = total === 0;

  return (
    <AnalyticsChartCard
      title="Reminder Status"
      subtitle="Pending, completed, and overdue"
      accentRgb="6,182,212"
      isEmpty={isEmpty}
      emptyMessage="No reminders set yet"
      emptyIcon={<Bell className="h-5 w-5" />}
    >
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
        {/* Donut */}
        <div className="relative h-40 w-40 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={46}
                outerRadius={68}
                strokeWidth={2}
                stroke="transparent"
                paddingAngle={4}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<StatusTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Center */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-xl font-bold tabular-nums text-foreground">{total}</p>
            <p className="text-[10px] text-muted-foreground">total</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-1 flex-col gap-2.5">
          {data.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{ background: `${item.color}18` }}
              >
                <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-foreground">{item.name}</p>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: total > 0 ? `${(item.value / total) * 100}%` : '0%',
                      background: item.color,
                    }}
                  />
                </div>
              </div>
              <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </AnalyticsChartCard>
  );
}
