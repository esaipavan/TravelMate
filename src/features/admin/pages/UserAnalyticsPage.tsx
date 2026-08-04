import { TrendingUp } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { PageHeader } from '@/components/shared/PageHeader';
import { ErrorState } from '@/components/shared/ErrorState';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserGrowth, useFeatureAdoption, useDashboardMetrics } from '../hooks/useAdminMetrics';

function AdoptionBar({
  feature,
  userCount,
  totalUsers,
}: {
  feature: string;
  userCount: number;
  totalUsers: number;
}) {
  const pct = totalUsers > 0 ? Math.round((userCount / totalUsers) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{feature}</span>
        <span className="tabular-nums text-muted-foreground">
          {userCount} / {totalUsers} ({pct}%)
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${feature} adoption: ${pct}%`}
        />
      </div>
    </div>
  );
}

export default function UserAnalyticsPage() {
  const { data: growth, isLoading: growthLoading, isError: growthError, refetch } = useUserGrowth();
  const { data: adoption, isLoading: adoptionLoading } = useFeatureAdoption();
  const { data: metrics } = useDashboardMetrics();

  if (growthError) {
    return (
      <ErrorState
        title="Couldn't load analytics"
        message="Check your admin role and Supabase connection."
        onRetry={() => void refetch()}
      />
    );
  }

  const chartData = (growth ?? []).map((d) => ({
    date: format(parseISO(d.date), 'MMM d'),
    signups: d.count,
  }));

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        title="User Analytics"
        description="Growth and feature adoption for the Private Beta."
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[
          { label: 'Total Beta Users', value: metrics?.totalUsers ?? '—' },
          { label: 'Trips This Week', value: metrics?.tripsThisWeek ?? '—' },
          { label: 'AI Calls Today', value: metrics?.aiCallsToday ?? '—' },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border bg-card p-4">
            <p className="text-2xl font-bold tabular-nums text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Signup growth */}
      <section aria-labelledby="growth-heading" className="rounded-2xl border bg-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" aria-hidden="true" />
          <h2 id="growth-heading" className="font-semibold text-foreground">
            Signups — Last 30 Days
          </h2>
        </div>
        {growthLoading ? (
          <Skeleton className="h-48 w-full rounded-xl" />
        ) : chartData.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">No signup data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="signupGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="signups"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#signupGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </section>

      {/* Feature adoption */}
      <section aria-labelledby="adoption-heading" className="rounded-2xl border bg-card p-5">
        <h2 id="adoption-heading" className="mb-5 font-semibold text-foreground">
          Feature Adoption
        </h2>
        {adoptionLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {(adoption ?? []).map((a) => (
              <AdoptionBar key={a.feature} {...a} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
