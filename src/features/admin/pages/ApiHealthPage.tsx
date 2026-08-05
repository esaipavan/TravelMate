import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, XCircle, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { supabase } from '@/lib/supabase';

interface HealthCheck {
  name: string;
  description: string;
  status: 'ok' | 'error';
  latencyMs?: number;
  detail?: string;
}

async function checkSupabaseDB(): Promise<HealthCheck> {
  const start = performance.now();
  try {
    const { error } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
    return {
      name: 'Supabase Database',
      description: 'Connection to the Supabase Postgres instance',
      status: error ? 'error' : 'ok',
      latencyMs: Math.round(performance.now() - start),
      detail: error?.message,
    };
  } catch (e) {
    return {
      name: 'Supabase Database',
      description: 'Connection to the Supabase Postgres instance',
      status: 'error',
      latencyMs: Math.round(performance.now() - start),
      detail: e instanceof Error ? e.message : 'Unknown error',
    };
  }
}

async function checkSupabaseFunctions(): Promise<HealthCheck> {
  const start = performance.now();
  try {
    // Test reachability of the Functions runtime without invoking LLM.
    // A non-network response (including 4xx from the function itself) means reachable.
    const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL ?? '');
    const anonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY ?? '');
    if (!supabaseUrl || !anonKey) {
      return {
        name: 'Supabase Functions',
        description: 'Edge Functions runtime reachability (no LLM invoked)',
        status: 'error',
        latencyMs: Math.round(performance.now() - start),
        detail: 'VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not configured',
      };
    }
    const res = await fetch(`${supabaseUrl}/functions/v1/`, {
      method: 'GET',
      headers: { apikey: anonKey },
      signal: AbortSignal.timeout(5000),
    });
    // 404 = endpoint exists but no index route — still reachable
    const reachable = res.status < 500 || res.status === 404;
    return {
      name: 'Supabase Functions',
      description: 'Edge Functions runtime reachability (no LLM invoked)',
      status: reachable ? 'ok' : 'error',
      latencyMs: Math.round(performance.now() - start),
      detail: reachable ? undefined : `HTTP ${res.status}`,
    };
  } catch (e) {
    return {
      name: 'Supabase Functions',
      description: 'Edge Functions runtime reachability (no LLM invoked)',
      status: 'error',
      latencyMs: Math.round(performance.now() - start),
      detail: e instanceof Error ? e.message : 'Network error',
    };
  }
}

function checkGeoapifyKey(): HealthCheck {
  const geoapifyKey = import.meta.env.VITE_GEOAPIFY_API_KEY;
  const keyPresent = Boolean(geoapifyKey) && String(geoapifyKey).length > 8;
  return {
    name: 'Geoapify API Key',
    description: 'VITE_GEOAPIFY_API_KEY environment variable',
    status: keyPresent ? 'ok' : 'error',
    detail: keyPresent ? 'Key present' : 'VITE_GEOAPIFY_API_KEY is not set',
  };
}

async function checkOpenMeteo(): Promise<HealthCheck> {
  const start = performance.now();
  try {
    const res = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=35.68&longitude=139.69&current_weather=true&forecast_days=1',
      { signal: AbortSignal.timeout(5000) },
    );
    return {
      name: 'Open-Meteo Weather API',
      description: 'Public weather API (no key required)',
      status: res.ok ? 'ok' : 'error',
      latencyMs: Math.round(performance.now() - start),
      detail: res.ok ? undefined : `HTTP ${res.status}`,
    };
  } catch (e) {
    return {
      name: 'Open-Meteo Weather API',
      description: 'Public weather API (no key required)',
      status: 'error',
      latencyMs: Math.round(performance.now() - start),
      detail: e instanceof Error ? e.message : 'Unknown error',
    };
  }
}

async function checkNominatim(): Promise<HealthCheck> {
  const start = performance.now();
  try {
    const res = await fetch(
      'https://nominatim.openstreetmap.org/search?q=Tokyo&format=json&limit=1',
      {
        headers: { 'User-Agent': 'TravelMate/1.0' },
        signal: AbortSignal.timeout(5000),
      },
    );
    return {
      name: 'Nominatim Geocoding',
      description: 'OpenStreetMap geocoding API (no key required)',
      status: res.ok ? 'ok' : 'error',
      latencyMs: Math.round(performance.now() - start),
      detail: res.ok ? undefined : `HTTP ${res.status}`,
    };
  } catch (e) {
    return {
      name: 'Nominatim Geocoding',
      description: 'OpenStreetMap geocoding API (no key required)',
      status: 'error',
      latencyMs: Math.round(performance.now() - start),
      detail: e instanceof Error ? e.message : 'Unknown error',
    };
  }
}

async function runHealthChecks(): Promise<HealthCheck[]> {
  return Promise.all([
    checkSupabaseDB(),
    checkSupabaseFunctions(),
    Promise.resolve(checkGeoapifyKey()),
    checkOpenMeteo(),
    checkNominatim(),
  ]);
}

function CheckRow({ check }: { check: HealthCheck }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-4">
      {check.status === 'ok' ? (
        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" aria-label="Healthy" />
      ) : (
        <XCircle className="h-5 w-5 shrink-0 text-destructive" aria-label="Error" />
      )}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{check.name}</span>
          {check.latencyMs != null && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] tabular-nums text-muted-foreground">
              {check.latencyMs} ms
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{check.description}</p>
        {check.detail && check.status === 'error' && (
          <p className="mt-1 rounded bg-destructive/5 px-2 py-1 text-[11px] text-destructive">
            {check.detail}
          </p>
        )}
      </div>

      <span
        className={[
          'shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide',
          check.status === 'ok'
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            : 'bg-destructive/10 text-destructive',
        ].join(' ')}
      >
        {check.status === 'ok' ? 'healthy' : 'error'}
      </span>
    </div>
  );
}

export default function ApiHealthPage() {
  const {
    data: checks,
    isLoading,
    error,
    refetch,
    isFetching,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ['admin', 'api-health'],
    queryFn: runHealthChecks,
    staleTime: 30_000,
    refetchInterval: false,
  });

  const errorCount = checks?.filter((c) => c.status === 'error').length ?? 0;
  const allOk = checks != null && errorCount === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title="API Health"
          description="Live status of all external services and integrations."
        />
        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isFetching}
          className="mt-1 flex shrink-0 items-center gap-1.5 rounded-xl border border-border/60 bg-card px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
          aria-label="Re-run health checks"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`}
            aria-hidden="true"
          />
          Refresh
        </button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2
            className="h-6 w-6 animate-spin text-muted-foreground"
            aria-label="Running checks…"
          />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          Health check runner failed unexpectedly.
        </div>
      )}

      {checks && (
        <>
          {/* Overall status banner */}
          <div
            className={[
              'flex items-center gap-3 rounded-2xl p-4',
              allOk
                ? 'border border-emerald-500/20 bg-emerald-500/5'
                : 'border border-destructive/20 bg-destructive/5',
            ].join(' ')}
          >
            {allOk ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" aria-hidden="true" />
            ) : (
              <AlertCircle className="h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
            )}
            <div>
              <p
                className={`text-sm font-semibold ${allOk ? 'text-emerald-700 dark:text-emerald-400' : 'text-destructive'}`}
              >
                {allOk
                  ? 'All systems operational'
                  : `${errorCount} service${errorCount !== 1 ? 's' : ''} degraded`}
              </p>
              <p className="text-xs text-muted-foreground">
                Last checked{' '}
                {dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : 'never'}
              </p>
            </div>
          </div>

          {/* Check list */}
          <div className="space-y-3">
            {checks.map((check) => (
              <CheckRow key={check.name} check={check} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
