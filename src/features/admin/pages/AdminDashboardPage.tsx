import { Link } from 'react-router-dom';
import {
  Users,
  Map,
  Bug,
  MessageCircle,
  Zap,
  Flag,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BarChart2,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { PageHeader } from '@/components/shared/PageHeader';
import { ErrorState } from '@/components/shared/ErrorState';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useDashboardMetrics, useFeedbackList, useBugReportList } from '../hooks/useAdminMetrics';

// ── KPI card ─────────────────────────────────────────────────────────────────

function KPICard({
  label,
  value,
  icon: Icon,
  href,
  accent,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  href: string;
  accent: string;
}) {
  return (
    <Link
      to={href}
      className="flex items-center gap-4 rounded-2xl border bg-card p-5 transition-shadow hover:shadow-lifted"
    >
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent}`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold tabular-nums text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </Link>
  );
}

// ── Severity badge ────────────────────────────────────────────────────────────

const SEVERITY_CLASS: Record<string, string> = {
  critical: 'bg-destructive/15 text-destructive border-destructive/30',
  high: 'bg-orange-500/15 text-orange-600 border-orange-500/30',
  medium: 'bg-amber-500/15 text-amber-600 border-amber-500/30',
  low: 'bg-muted text-muted-foreground',
};

const STATUS_CLASS: Record<string, string> = {
  new: 'bg-blue-500/15 text-blue-600',
  in_review: 'bg-amber-500/15 text-amber-600',
  in_progress: 'bg-primary/15 text-primary',
  resolved: 'bg-emerald-500/15 text-emerald-600',
  open: 'bg-red-500/15 text-red-600',
  closed: 'bg-muted text-muted-foreground',
  wont_fix: 'bg-muted text-muted-foreground',
};

export default function AdminDashboardPage() {
  const { data: metrics, isLoading: mLoading, isError: mError, refetch } = useDashboardMetrics();
  const { data: feedback = [] } = useFeedbackList('new');
  const { data: bugs = [] } = useBugReportList('open');

  if (mError) {
    return (
      <ErrorState
        title="Couldn't load admin metrics"
        message="Check your admin role and Supabase connection."
        onRetry={() => void refetch()}
      />
    );
  }

  const recentFeedback = [...feedback].slice(0, 5);
  const criticalBugs = [...bugs]
    .filter((b) => b.severity === 'critical' || b.severity === 'high')
    .slice(0, 5);

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        title="Admin Dashboard"
        description="Beta health metrics — refreshes every 5 minutes."
      />

      {/* KPI Grid */}
      <section aria-label="Key metrics">
        {mLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <KPICard
              label="Total Users"
              value={metrics!.totalUsers ?? '—'}
              icon={Users}
              href="/admin/users"
              accent="bg-primary/10 text-primary"
            />
            <KPICard
              label="Trips This Week"
              value={metrics!.tripsThisWeek ?? '—'}
              icon={Map}
              href="/admin/analytics"
              accent="bg-violet-500/10 text-violet-500"
            />
            <KPICard
              label="Open Bugs"
              value={metrics!.openBugs ?? '—'}
              icon={Bug}
              href="/admin/bugs"
              accent="bg-destructive/10 text-destructive"
            />
            <KPICard
              label="Pending Feedback"
              value={metrics!.pendingFeedback ?? '—'}
              icon={MessageCircle}
              href="/admin/feedback"
              accent="bg-amber-500/10 text-amber-500"
            />
            <KPICard
              label="AI Calls Today"
              value={metrics!.aiCallsToday ?? '—'}
              icon={Zap}
              href="/admin/ai"
              accent="bg-emerald-500/10 text-emerald-500"
            />
            <KPICard
              label="Active Flags"
              value={metrics!.activeFlags ?? '—'}
              icon={Flag}
              href="/admin/flags"
              accent="bg-sky-500/10 text-sky-500"
            />
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent feedback */}
        <section aria-labelledby="feedback-heading" className="rounded-2xl border bg-card">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2
              id="feedback-heading"
              className="flex items-center gap-2 font-semibold text-foreground"
            >
              <MessageCircle className="h-4 w-4 text-primary" aria-hidden="true" />
              New Feedback
            </h2>
            <Link to="/admin/feedback" className="text-xs text-primary hover:underline">
              View all →
            </Link>
          </div>
          <div className="divide-y">
            {recentFeedback.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-5 py-10 text-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                <p className="text-sm text-muted-foreground">All caught up!</p>
              </div>
            ) : (
              recentFeedback.map((f) => (
                <div key={f.id} className="px-5 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{f.subject}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {f.message.slice(0, 80)}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <Badge
                        className={`text-[10px] ${STATUS_CLASS[f.status] ?? ''}`}
                        variant="outline"
                      >
                        {f.type}
                      </Badge>
                      {f.rating && (
                        <span className="text-[10px] text-amber-500">{'★'.repeat(f.rating)}</span>
                      )}
                    </div>
                  </div>
                  <p className="mt-1 text-[10px] text-muted-foreground/60">
                    {format(parseISO(f.created_at), 'MMM d, HH:mm')}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* High/critical bugs */}
        <section aria-labelledby="bugs-heading" className="rounded-2xl border bg-card">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 id="bugs-heading" className="flex items-center gap-2 font-semibold text-foreground">
              <AlertTriangle className="h-4 w-4 text-destructive" aria-hidden="true" />
              High Priority Bugs
            </h2>
            <Link to="/admin/bugs" className="text-xs text-primary hover:underline">
              View all →
            </Link>
          </div>
          <div className="divide-y">
            {criticalBugs.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-5 py-10 text-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                <p className="text-sm text-muted-foreground">No high/critical open bugs</p>
              </div>
            ) : (
              criticalBugs.map((b) => (
                <div key={b.id} className="px-5 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{b.title}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {b.description.slice(0, 80)}
                      </p>
                    </div>
                    <Badge
                      className={`shrink-0 border text-[10px] ${SEVERITY_CLASS[b.severity] ?? ''}`}
                      variant="outline"
                    >
                      {b.severity}
                    </Badge>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <Clock className="h-2.5 w-2.5 text-muted-foreground/50" />
                    <span className="text-[10px] text-muted-foreground/60">
                      {format(parseISO(b.created_at), 'MMM d, HH:mm')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Admin nav grid */}
      <section aria-label="Admin sections">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
          <TrendingUp className="h-4 w-4 text-primary" aria-hidden="true" />
          All Sections
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { to: '/admin/founder', label: 'Growth', icon: BarChart2, color: 'text-indigo-500' },
            { to: '/admin/users', label: 'Users', icon: Users, color: 'text-primary' },
            {
              to: '/admin/feedback',
              label: 'Feedback',
              icon: MessageCircle,
              color: 'text-amber-500',
            },
            { to: '/admin/bugs', label: 'Bug Reports', icon: Bug, color: 'text-destructive' },
            {
              to: '/admin/analytics',
              label: 'Analytics',
              icon: TrendingUp,
              color: 'text-violet-500',
            },
            { to: '/admin/flags', label: 'Feat. Flags', icon: Flag, color: 'text-sky-500' },
            { to: '/admin/ai', label: 'AI Usage', icon: Zap, color: 'text-emerald-500' },
            {
              to: '/admin/health',
              label: 'API Health',
              icon: CheckCircle2,
              color: 'text-teal-500',
            },
          ].map(({ to, label, icon: Icon, color }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Icon className={`h-4 w-4 shrink-0 ${color}`} aria-hidden="true" />
              {label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
