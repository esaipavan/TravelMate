import { useQuery } from '@tanstack/react-query';
import { Loader2, AlertCircle, Zap, CheckCircle2, XCircle, Clock, Database } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { getAIUsageLogs } from '../services/admin.service';
import type { AIUsageLog } from '../services/admin.service';

interface ProviderStats {
  provider: string;
  model: string;
  calls: number;
  successes: number;
  avgLatencyMs: number;
  totalTokens: number;
}

function buildStats(logs: AIUsageLog[]): ProviderStats[] {
  const map = new Map<string, ProviderStats>();
  for (const log of logs) {
    const key = `${log.provider}::${log.model}`;
    const s = map.get(key) ?? {
      provider: log.provider,
      model: log.model,
      calls: 0,
      successes: 0,
      avgLatencyMs: 0,
      totalTokens: 0,
    };
    s.calls++;
    if (log.success) s.successes++;
    s.avgLatencyMs += log.latency_ms ?? 0;
    s.totalTokens += (log.prompt_tokens ?? 0) + (log.completion_tokens ?? 0);
    map.set(key, s);
  }
  return Array.from(map.values()).map((s) => ({
    ...s,
    avgLatencyMs: s.calls > 0 ? Math.round(s.avgLatencyMs / s.calls) : 0,
  }));
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: typeof Zap;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accent}`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-bold tabular-nums text-foreground">{value}</p>
      </div>
    </div>
  );
}

export default function AIUsagePage() {
  const {
    data: logs,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['admin', 'ai-usage-logs'],
    queryFn: () => getAIUsageLogs(200),
    staleTime: 60_000,
  });

  const stats = logs ? buildStats(logs) : [];
  const totalCalls = logs?.length ?? 0;
  const totalSuccess = logs?.filter((l) => l.success).length ?? 0;
  const successRate = totalCalls > 0 ? Math.round((totalSuccess / totalCalls) * 100) : 0;
  const avgLatency =
    logs && logs.length > 0
      ? Math.round(logs.reduce((s, l) => s + (l.latency_ms ?? 0), 0) / logs.length)
      : 0;
  const totalTokens = logs
    ? logs.reduce((s, l) => s + (l.prompt_tokens ?? 0) + (l.completion_tokens ?? 0), 0)
    : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Usage Statistics"
        description="Real-time view of AI provider calls, token usage, and latency."
      />

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-label="Loading…" />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          Failed to load AI usage logs.
        </div>
      )}

      {logs && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              label="Total calls"
              value={totalCalls.toLocaleString()}
              icon={Zap}
              accent="bg-primary/10 text-primary"
            />
            <StatCard
              label="Success rate"
              value={`${successRate}%`}
              icon={CheckCircle2}
              accent="bg-emerald-500/10 text-emerald-500"
            />
            <StatCard
              label="Avg latency"
              value={`${avgLatency} ms`}
              icon={Clock}
              accent="bg-amber-500/10 text-amber-500"
            />
            <StatCard
              label="Total tokens"
              value={totalTokens.toLocaleString()}
              icon={Database}
              accent="bg-violet-500/10 text-violet-500"
            />
          </div>

          {/* Per-provider breakdown */}
          {stats.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold text-foreground">By Provider / Model</h2>
              <div className="space-y-2">
                {stats.map((s) => {
                  const rate = s.calls > 0 ? Math.round((s.successes / s.calls) * 100) : 0;
                  return (
                    <div
                      key={`${s.provider}::${s.model}`}
                      className="flex flex-wrap items-center gap-4 rounded-2xl border border-border/60 bg-card px-4 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold capitalize text-foreground">
                          {s.provider}
                        </p>
                        <p className="text-xs text-muted-foreground">{s.model}</p>
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs">
                        <span className="tabular-nums">
                          <span className="font-semibold text-foreground">{s.calls}</span>{' '}
                          <span className="text-muted-foreground">calls</span>
                        </span>
                        <span className="tabular-nums">
                          <span
                            className={`font-semibold ${rate >= 90 ? 'text-emerald-500' : rate >= 70 ? 'text-amber-500' : 'text-destructive'}`}
                          >
                            {rate}%
                          </span>{' '}
                          <span className="text-muted-foreground">success</span>
                        </span>
                        <span className="tabular-nums">
                          <span className="font-semibold text-foreground">{s.avgLatencyMs}</span>{' '}
                          <span className="text-muted-foreground">ms avg</span>
                        </span>
                        <span className="tabular-nums">
                          <span className="font-semibold text-foreground">
                            {s.totalTokens.toLocaleString()}
                          </span>{' '}
                          <span className="text-muted-foreground">tokens</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent log table */}
          <div>
            <h2 className="mb-3 text-sm font-semibold text-foreground">Recent Calls</h2>
            <div className="overflow-x-auto rounded-2xl border border-border/60">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30">
                    <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">
                      Time
                    </th>
                    <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">
                      Provider
                    </th>
                    <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">
                      Model
                    </th>
                    <th className="px-4 py-2.5 text-right font-semibold text-muted-foreground">
                      Tokens
                    </th>
                    <th className="px-4 py-2.5 text-right font-semibold text-muted-foreground">
                      Latency
                    </th>
                    <th className="px-4 py-2.5 text-center font-semibold text-muted-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {logs.slice(0, 50).map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-border/40 last:border-0 hover:bg-muted/20"
                    >
                      <td className="px-4 py-2 tabular-nums text-muted-foreground">
                        {new Date(log.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-2 capitalize text-foreground">{log.provider}</td>
                      <td className="px-4 py-2 text-muted-foreground">{log.model}</td>
                      <td className="px-4 py-2 text-right tabular-nums text-foreground">
                        {((log.prompt_tokens ?? 0) + (log.completion_tokens ?? 0)).toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">
                        {log.latency_ms != null ? `${log.latency_ms} ms` : '—'}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {log.success ? (
                          <CheckCircle2
                            className="mx-auto h-3.5 w-3.5 text-emerald-500"
                            aria-label="Success"
                          />
                        ) : (
                          <XCircle
                            className="mx-auto h-3.5 w-3.5 text-destructive"
                            aria-label={log.error_message ?? 'Failed'}
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {logs.length === 0 && (
                <p className="py-8 text-center text-xs text-muted-foreground">
                  No AI calls logged yet.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
