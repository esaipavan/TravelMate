import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Flag, ToggleLeft, ToggleRight, Loader2, AlertCircle, Users } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { getFeatureFlags, updateFeatureFlag } from '../services/admin.service';
import type { FeatureFlag } from '../services/admin.service';

function RolloutSlider({
  flag,
  onSave,
  saving,
}: {
  flag: FeatureFlag;
  onSave: (pct: number) => void;
  saving: boolean;
}) {
  const [pct, setPct] = useState(flag.rollout_percentage);
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={pct}
        disabled={saving || !flag.is_enabled}
        onChange={(e) => setPct(Number(e.target.value))}
        onMouseUp={() => onSave(pct)}
        onTouchEnd={() => onSave(pct)}
        className="h-1.5 w-28 cursor-pointer accent-primary disabled:cursor-not-allowed disabled:opacity-40"
        aria-label={`Rollout percentage for ${flag.name}`}
      />
      <span className="w-10 text-right text-xs font-semibold tabular-nums text-foreground">
        {pct}%
      </span>
    </div>
  );
}

function FlagRow({ flag }: { flag: FeatureFlag }) {
  const qc = useQueryClient();

  const toggle = useMutation({
    mutationFn: (is_enabled: boolean) => updateFeatureFlag(flag.id, { is_enabled }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'feature-flags'] });
      toast.success(`${flag.name} ${flag.is_enabled ? 'disabled' : 'enabled'}`);
    },
    onError: () => toast.error('Could not update flag'),
  });

  const setRollout = useMutation({
    mutationFn: (rollout_percentage: number) => updateFeatureFlag(flag.id, { rollout_percentage }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['admin', 'feature-flags'] }),
    onError: () => toast.error('Could not update rollout'),
  });

  const isSaving = toggle.isPending || setRollout.isPending;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4 sm:flex-row sm:items-center sm:gap-6">
      {/* Toggle */}
      <button
        type="button"
        aria-pressed={flag.is_enabled}
        aria-label={`${flag.is_enabled ? 'Disable' : 'Enable'} ${flag.name}`}
        onClick={() => toggle.mutate(!flag.is_enabled)}
        disabled={isSaving}
        className="shrink-0 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
      >
        {isSaving ? (
          <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
        ) : flag.is_enabled ? (
          <ToggleRight className="h-6 w-6 text-emerald-500" aria-hidden="true" />
        ) : (
          <ToggleLeft className="h-6 w-6" aria-hidden="true" />
        )}
      </button>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{flag.name}</span>
          <span
            className={[
              'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
              flag.is_enabled
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-muted text-muted-foreground',
            ].join(' ')}
          >
            {flag.is_enabled ? 'enabled' : 'disabled'}
          </span>
        </div>
        {flag.description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{flag.description}</p>
        )}
        <p className="mt-1 text-[10px] text-muted-foreground/60">
          Updated {new Date(flag.updated_at).toLocaleString()}
        </p>
      </div>

      {/* Rollout */}
      <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
        <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          <Users className="h-3 w-3" aria-hidden="true" />
          Rollout
        </div>
        <RolloutSlider flag={flag} onSave={(pct) => setRollout.mutate(pct)} saving={isSaving} />
      </div>
    </div>
  );
}

export default function FeatureFlagsPage() {
  const {
    data: flags,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['admin', 'feature-flags'],
    queryFn: getFeatureFlags,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Feature Flags"
        description="Enable or disable features and control rollout percentages."
      />

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-label="Loading…" />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          Failed to load feature flags. Check your admin permissions.
        </div>
      )}

      {flags && flags.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border p-12 text-center">
          <Flag className="h-8 w-8 text-muted-foreground/40" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">
            No feature flags found. Add rows to the{' '}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">feature_flags</code> table.
          </p>
        </div>
      )}

      {flags && flags.length > 0 && (
        <div className="space-y-3">
          {flags.map((flag) => (
            <FlagRow key={flag.id} flag={flag} />
          ))}
        </div>
      )}
    </div>
  );
}
