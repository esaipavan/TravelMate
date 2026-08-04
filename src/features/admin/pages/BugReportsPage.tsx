import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Bug, ChevronDown, ChevronUp, Monitor } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { ErrorState } from '@/components/shared/ErrorState';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBugReportList, useUpdateBugStatus } from '../hooks/useAdminMetrics';

const SEVERITY_CLASS: Record<string, string> = {
  critical: 'bg-destructive/15 text-destructive border-destructive/30',
  high: 'bg-orange-500/15 text-orange-600 border-orange-500/30',
  medium: 'bg-amber-500/15 text-amber-600 border-amber-500/30',
  low: 'bg-muted text-muted-foreground border-border',
};

const STATUS_OPTIONS = ['all', 'open', 'in_progress', 'resolved', 'wont_fix', 'duplicate'];
const SEVERITY_OPTIONS = ['all', 'critical', 'high', 'medium', 'low'];

export default function BugReportsPage() {
  const [status, setStatus] = useState('open');
  const [severity, setSeverity] = useState('all');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const { data, isLoading, isError, refetch } = useBugReportList(
    status === 'all' ? undefined : status,
    severity === 'all' ? undefined : severity,
  );
  const updateMutation = useUpdateBugStatus();

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (isError) {
    return (
      <ErrorState
        title="Couldn't load bug reports"
        message="Check your admin role and Supabase connection."
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <PageHeader title="Bug Reports" description="User-submitted and auto-captured bug reports." />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {s === 'all' ? 'All statuses' : s.replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={severity} onValueChange={setSeverity}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            {SEVERITY_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {s === 'all' ? 'All severities' : s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-sm text-muted-foreground">{data?.length ?? 0} reports</span>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : (data ?? []).length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed p-16 text-center">
          <Bug className="h-8 w-8 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No bug reports matching these filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(data ?? []).map((b) => {
            const isOpen = expanded.has(b.id);
            let parsedBrowserInfo: Record<string, unknown> | null = null;
            if (b.browser_info) {
              try {
                parsedBrowserInfo = JSON.parse(b.browser_info) as Record<string, unknown>;
              } catch {
                /* ignore */
              }
            }

            return (
              <div key={b.id} className="rounded-xl border bg-card">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => toggle(b.id)}
                  className="w-full px-5 py-4 text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          className={`border text-[10px] ${SEVERITY_CLASS[b.severity] ?? ''}`}
                          variant="outline"
                        >
                          {b.severity}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {b.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="mt-1 truncate text-sm font-medium text-foreground">{b.title}</p>
                      {!isOpen && (
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {b.description.slice(0, 100)}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="text-[11px] text-muted-foreground">
                        {format(parseISO(b.created_at), 'MMM d, HH:mm')}
                      </span>
                      {isOpen ? (
                        <ChevronUp
                          className="h-4 w-4 text-muted-foreground/50"
                          aria-hidden="true"
                        />
                      ) : (
                        <ChevronDown
                          className="h-4 w-4 text-muted-foreground/50"
                          aria-hidden="true"
                        />
                      )}
                    </div>
                  </div>
                </button>

                {isOpen && (
                  <div className="space-y-4 border-t px-5 py-4">
                    <div>
                      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Description
                      </p>
                      <p className="whitespace-pre-wrap text-sm text-foreground">{b.description}</p>
                    </div>

                    {b.steps_to_reproduce && (
                      <div>
                        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Steps to Reproduce
                        </p>
                        <p className="whitespace-pre-wrap text-sm text-foreground">
                          {b.steps_to_reproduce}
                        </p>
                      </div>
                    )}

                    {parsedBrowserInfo && (
                      <details className="text-xs">
                        <summary className="flex cursor-pointer items-center gap-1 text-muted-foreground hover:text-foreground">
                          <Monitor className="h-3 w-3" aria-hidden="true" /> Browser info
                        </summary>
                        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 text-[10px]">
                          {JSON.stringify(parsedBrowserInfo, null, 2)}
                        </pre>
                      </details>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {['open', 'in_progress', 'resolved', 'wont_fix', 'duplicate'].map((s) => (
                        <Button
                          key={s}
                          size="sm"
                          variant={b.status === s ? 'default' : 'outline'}
                          className="h-7 text-xs"
                          disabled={updateMutation.isPending}
                          onClick={() => void updateMutation.mutate({ id: b.id, status: s })}
                        >
                          {s.replace('_', ' ')}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
