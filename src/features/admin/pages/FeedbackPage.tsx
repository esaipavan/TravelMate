import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { MessageCircle, Star, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
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
import { useFeedbackList, useUpdateFeedbackStatus } from '../hooks/useAdminMetrics';

const TYPE_COLOR: Record<string, string> = {
  general: 'bg-primary/10 text-primary',
  feature_request: 'bg-violet-500/10 text-violet-600',
  bug: 'bg-destructive/10 text-destructive',
  compliment: 'bg-emerald-500/10 text-emerald-600',
  complaint: 'bg-amber-500/10 text-amber-600',
};

const STATUS_OPTIONS = ['all', 'new', 'in_review', 'resolved', 'closed'];

export default function FeedbackPage() {
  const [status, setStatus] = useState('all');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const { data, isLoading, isError, refetch } = useFeedbackList(
    status === 'all' ? undefined : status,
  );
  const updateMutation = useUpdateFeedbackStatus();

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
        title="Couldn't load feedback"
        message="Check your admin role and Supabase connection."
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Feedback"
        description="User-submitted feedback, feature requests, and ratings."
      />

      {/* Filters */}
      <div className="flex items-center gap-3">
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
        <span className="text-sm text-muted-foreground">{data?.length ?? 0} entries</span>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : (data ?? []).length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed p-16 text-center">
          <MessageCircle className="h-8 w-8 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No feedback yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(data ?? []).map((f) => {
            const isOpen = expanded.has(f.id);
            return (
              <div key={f.id} className="rounded-xl border bg-card">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => toggle(f.id)}
                  className="w-full px-5 py-4 text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          className={`text-[10px] ${TYPE_COLOR[f.type] ?? ''}`}
                          variant="outline"
                        >
                          {f.type.replace('_', ' ')}
                        </Badge>
                        {f.rating && (
                          <span className="flex items-center gap-0.5 text-xs text-amber-500">
                            {Array.from({ length: f.rating }).map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-current" aria-hidden="true" />
                            ))}
                          </span>
                        )}
                        <Badge variant="outline" className="text-[10px]">
                          {f.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="mt-1 truncate text-sm font-medium text-foreground">
                        {f.subject}
                      </p>
                      {!isOpen && (
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {f.message.slice(0, 100)}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="text-[11px] text-muted-foreground">
                        {format(parseISO(f.created_at), 'MMM d, HH:mm')}
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
                    <p className="whitespace-pre-wrap text-sm text-foreground">{f.message}</p>

                    {f.page_url && (
                      <a
                        href={f.page_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" aria-hidden="true" />
                        {f.page_url}
                      </a>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {['new', 'in_review', 'resolved', 'closed'].map((s) => (
                        <Button
                          key={s}
                          size="sm"
                          variant={f.status === s ? 'default' : 'outline'}
                          className="h-7 text-xs"
                          disabled={updateMutation.isPending}
                          onClick={() => void updateMutation.mutate({ id: f.id, status: s })}
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
