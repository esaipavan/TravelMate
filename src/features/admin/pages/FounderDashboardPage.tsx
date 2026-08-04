import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import {
  Users,
  TrendingUp,
  Zap,
  Target,
  Globe,
  Monitor,
  BarChart2,
  Cpu,
  RefreshCw,
  MapPin,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import {
  useActiveUserCounts,
  useDauTrend,
  useActivationRate,
  useRetention,
  useFunnelCounts,
  useAiSummary,
  useTopDestinations,
  useDeviceBreakdown,
  useFeatureAdoptionV2,
} from '../hooks/useFounderMetrics';

// ── Small helpers ─────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function pct(n: number): string {
  return `${n.toFixed(1)}%`;
}

// ── KPI Card ─────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  loading?: boolean;
  accent?: string;
}

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  loading,
  accent = 'text-primary',
}: KpiCardProps) {
  return (
    <div className="space-y-3 rounded-2xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
          {label}
        </span>
        <Icon className={`h-4 w-4 ${accent}`} aria-hidden="true" />
      </div>
      {loading ? (
        <Skeleton className="h-8 w-24" />
      ) : (
        <div>
          <p className="text-3xl font-black tabular-nums text-foreground">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
        </div>
      )}
    </div>
  );
}

// ── Section header ────────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground/80">
        {title}
      </h2>
    </div>
  );
}

// ── Funnel bar ────────────────────────────────────────────────────────────────

function FunnelBar({ label, count, max }: { label: string; count: number; max: number }) {
  const width = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="tabular-nums text-muted-foreground">{fmt(count)}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${width}%` }}
          role="progressbar"
          aria-valuenow={width}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}

// ── Feature adoption bar ──────────────────────────────────────────────────────

function AdoptionRow({
  feature,
  pct: p,
  adopters,
}: {
  feature: string;
  pct: number;
  adopters: number;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{feature}</span>
        <span className="tabular-nums text-muted-foreground">
          {fmt(adopters)} <span className="text-xs opacity-60">({pct(p)})</span>
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary/70 transition-all duration-500"
          style={{ width: `${Math.min(p, 100)}%` }}
          role="progressbar"
          aria-valuenow={p}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}

// ── Device chip ───────────────────────────────────────────────────────────────

const DEVICE_COLORS: Record<string, string> = {
  desktop: 'bg-primary/15 text-primary',
  mobile: 'bg-violet-500/15 text-violet-600',
  tablet: 'bg-amber-500/15 text-amber-600',
  unknown: 'bg-muted text-muted-foreground',
};

const BROWSER_COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#06b6d4',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#64748b',
];

// ── Page ─────────────────────────────────────────────────────────────────────

export default function FounderDashboardPage() {
  const qc = useQueryClient();

  const { data: counts, isLoading: loadingCounts } = useActiveUserCounts();
  const { data: dauTrend, isLoading: loadingTrend } = useDauTrend(30);
  const { data: activation, isLoading: loadingActivation } = useActivationRate();
  const { data: retention, isLoading: loadingRetention } = useRetention();
  const { data: funnel, isLoading: loadingFunnel } = useFunnelCounts();
  const { data: ai, isLoading: loadingAi } = useAiSummary();
  const { data: destinations, isLoading: loadingDest } = useTopDestinations(10);
  const { data: devices, isLoading: loadingDevices } = useDeviceBreakdown();
  const { data: adoption, isLoading: loadingAdoption } = useFeatureAdoptionV2();

  function refreshAll() {
    void qc.invalidateQueries({ queryKey: ['founder'] });
  }

  // Device rollup
  const deviceRollup = (devices ?? []).reduce<Record<string, number>>((acc, r) => {
    acc[r.deviceType] = (acc[r.deviceType] ?? 0) + r.userCount;
    return acc;
  }, {});

  // Browser rollup
  const browserRollup = (devices ?? []).reduce<Record<string, number>>((acc, r) => {
    acc[r.browser] = (acc[r.browser] ?? 0) + r.userCount;
    return acc;
  }, {});
  const browserData = Object.entries(browserRollup)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

  const funnelMax = funnel?.[0]?.userCount ?? 1;

  const totalTokens = (ai?.totalPromptTokens ?? 0) + (ai?.totalCompletionTokens ?? 0);
  const estCostUsd = ((totalTokens / 1000) * 0.003).toFixed(2);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Founder Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live metrics from your production Supabase database — no mock data.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refreshAll} className="gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          Refresh
        </Button>
      </div>

      {/* ── Pulse KPIs ───────────────────────────────────────── */}
      <section aria-labelledby="pulse-heading">
        <SectionHeader icon={TrendingUp} title="Business Pulse" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard
            label="DAU"
            value={fmt(counts?.dau ?? 0)}
            sub="active today"
            icon={Users}
            loading={loadingCounts}
          />
          <KpiCard
            label="WAU"
            value={fmt(counts?.wau ?? 0)}
            sub="active last 7 days"
            icon={Users}
            loading={loadingCounts}
            accent="text-violet-500"
          />
          <KpiCard
            label="MAU"
            value={fmt(counts?.mau ?? 0)}
            sub="active last 30 days"
            icon={Users}
            loading={loadingCounts}
            accent="text-sky-500"
          />
          <KpiCard
            label="Activation"
            value={loadingActivation ? '—' : pct(activation ?? 0)}
            sub="trip within 7d of signup"
            icon={Target}
            loading={false}
            accent="text-emerald-500"
          />
        </div>
      </section>

      {/* ── Retention ────────────────────────────────────────── */}
      <section aria-labelledby="retention-heading">
        <SectionHeader icon={RefreshCw} title="Retention" />
        <div className="grid grid-cols-2 gap-4">
          <KpiCard
            label="Day-7 Retention"
            value={loadingRetention ? '—' : pct(retention?.day7Pct ?? 0)}
            sub="returned on day 7"
            icon={TrendingUp}
            loading={false}
            accent="text-primary"
          />
          <KpiCard
            label="Day-30 Retention"
            value={loadingRetention ? '—' : pct(retention?.day30Pct ?? 0)}
            sub="returned on day 30"
            icon={TrendingUp}
            loading={false}
            accent="text-violet-500"
          />
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground/60">
          Retention requires users who signed up 30+ days ago and at least one analytics_events row
          per qualifying day.
        </p>
      </section>

      {/* ── DAU Trend chart ───────────────────────────────────── */}
      <section aria-labelledby="trend-heading">
        <SectionHeader icon={BarChart2} title="30-day DAU Trend" />
        <div className="rounded-2xl border bg-card p-5">
          {loadingTrend ? (
            <Skeleton className="h-48 w-full" />
          ) : (dauTrend ?? []).length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
              No event data yet — events appear after users visit authenticated pages.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={dauTrend} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="dauGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(v: string) => format(parseISO(v), 'MMM d')}
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  labelFormatter={(v: string) => format(parseISO(v), 'MMMM d, yyyy')}
                  formatter={(v: number) => [v, 'Active users']}
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.75rem',
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="dau"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#dauGrad)"
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* ── User Funnel ───────────────────────────────────────── */}
      <section aria-labelledby="funnel-heading">
        <SectionHeader icon={Target} title="User Funnel" />
        <div className="space-y-4 rounded-2xl border bg-card p-5">
          {loadingFunnel ? (
            Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)
          ) : (funnel ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No funnel data yet.</p>
          ) : (
            (funnel ?? []).map((step) => (
              <FunnelBar key={step.step} label={step.step} count={step.userCount} max={funnelMax} />
            ))
          )}
          <p className="pt-1 text-[11px] text-muted-foreground/60">
            "Onboarding Done" and "Feature Engaged" require analytics_events rows — they start
            populating after migration is applied.
          </p>
        </div>
      </section>

      {/* ── Feature Adoption ──────────────────────────────────── */}
      <section aria-labelledby="adoption-heading">
        <SectionHeader icon={Zap} title="Feature Adoption" />
        <div className="space-y-4 rounded-2xl border bg-card p-5">
          {loadingAdoption ? (
            Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)
          ) : (adoption ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No data yet.</p>
          ) : (
            (adoption ?? []).map((f) => (
              <AdoptionRow key={f.feature} feature={f.feature} pct={f.pct} adopters={f.adopters} />
            ))
          )}
        </div>
      </section>

      {/* ── AI Metrics ────────────────────────────────────────── */}
      <section aria-labelledby="ai-heading">
        <SectionHeader icon={Cpu} title="AI Usage" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard
            label="Total AI Calls"
            value={loadingAi ? '—' : fmt(ai?.totalCalls ?? 0)}
            sub="all time"
            icon={Cpu}
            loading={false}
          />
          <KpiCard
            label="Calls Today"
            value={loadingAi ? '—' : fmt(ai?.callsToday ?? 0)}
            sub="since midnight"
            icon={Zap}
            loading={false}
            accent="text-violet-500"
          />
          <KpiCard
            label="Avg Latency"
            value={loadingAi ? '—' : `${Math.round(ai?.avgLatencyMs ?? 0)}ms`}
            sub="per request"
            icon={TrendingUp}
            loading={false}
            accent="text-sky-500"
          />
          <KpiCard
            label="Success Rate"
            value={loadingAi ? '—' : pct(ai?.successRate ?? 0)}
            sub="non-error responses"
            icon={Target}
            loading={false}
            accent="text-emerald-500"
          />
        </div>

        {/* Token breakdown */}
        {!loadingAi && (ai?.totalCalls ?? 0) > 0 && (
          <div className="mt-4 rounded-2xl border bg-card p-5">
            <div className="grid grid-cols-3 gap-6 text-sm">
              <div>
                <p className="mb-1 text-xs uppercase tracking-widest text-muted-foreground">
                  Prompt tokens
                </p>
                <p className="text-xl font-bold tabular-nums">{fmt(ai?.totalPromptTokens ?? 0)}</p>
              </div>
              <div>
                <p className="mb-1 text-xs uppercase tracking-widest text-muted-foreground">
                  Completion tokens
                </p>
                <p className="text-xl font-bold tabular-nums">
                  {fmt(ai?.totalCompletionTokens ?? 0)}
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs uppercase tracking-widest text-muted-foreground">
                  Est. cost
                </p>
                <p className="text-xl font-bold tabular-nums">${estCostUsd}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground/60">
                  ~$0.003/1k tokens blended
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── Top Destinations ──────────────────────────────────── */}
      <section aria-labelledby="destinations-heading">
        <SectionHeader icon={MapPin} title="Top Destinations" />
        <div className="overflow-hidden rounded-2xl border bg-card">
          {loadingDest ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : (destinations ?? []).length === 0 ? (
            <div className="p-5 text-sm text-muted-foreground">No trips created yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
                    #
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
                    Destination
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
                    Trips
                  </th>
                </tr>
              </thead>
              <tbody>
                {(destinations ?? []).map((d, i) => (
                  <tr key={d.destination} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-5 py-3 tabular-nums text-muted-foreground">{i + 1}</td>
                    <td className="px-5 py-3 font-medium text-foreground">
                      {d.destination}
                      {d.countryCode && (
                        <Badge
                          variant="outline"
                          className="ml-2 text-[10px] uppercase tracking-wide"
                        >
                          {d.countryCode}
                        </Badge>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
                      {d.tripCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* ── Device & Browser ──────────────────────────────────── */}
      <section aria-labelledby="devices-heading">
        <SectionHeader icon={Monitor} title="Devices & Browsers (last 30 days)" />
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Device breakdown */}
          <div className="rounded-2xl border bg-card p-5">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
              Device Type
            </p>
            {loadingDevices ? (
              <Skeleton className="h-24 w-full" />
            ) : Object.keys(deviceRollup).length === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet.</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(deviceRollup)
                  .sort((a, b) => b[1] - a[1])
                  .map(([dt, count]) => {
                    const total = Object.values(deviceRollup).reduce((s, v) => s + v, 0);
                    const p = total > 0 ? Math.round((count / total) * 100) : 0;
                    return (
                      <div key={dt} className="flex items-center gap-3">
                        <Badge
                          className={`w-20 justify-center text-[10px] capitalize ${DEVICE_COLORS[dt] ?? DEVICE_COLORS['unknown']}`}
                        >
                          {dt}
                        </Badge>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${p}%` }}
                          />
                        </div>
                        <span className="w-16 text-right text-xs tabular-nums text-muted-foreground">
                          {count} ({p}%)
                        </span>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Browser breakdown */}
          <div className="rounded-2xl border bg-card p-5">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
              Browser
            </p>
            {loadingDevices ? (
              <Skeleton className="h-24 w-full" />
            ) : browserData.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart
                  data={browserData}
                  layout="vertical"
                  margin={{ top: 0, right: 8, bottom: 0, left: 8 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={false}
                    axisLine={false}
                    width={54}
                  />
                  <Tooltip
                    formatter={(v: number) => [v, 'Users']}
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.75rem',
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {browserData.map((_, i) => (
                      <Cell key={i} fill={BROWSER_COLORS[i % BROWSER_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground/60">
          Device and browser data populate from <code className="font-mono">analytics_events</code>{' '}
          after the migration is applied and users trigger page views.
        </p>
      </section>

      {/* ── Data freshness note ───────────────────────────────── */}
      <div className="flex items-start gap-2 rounded-xl border border-dashed p-4 text-xs text-muted-foreground">
        <Globe className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <span>
          All metrics are live Supabase queries — no mock data, no caching beyond TanStack Query
          staleTime. KPI counts auto-refresh every 5 minutes. Run{' '}
          <code className="font-mono">supabase db push</code> to apply migration 012 and activate
          event tracking.
        </span>
      </div>
    </div>
  );
}
