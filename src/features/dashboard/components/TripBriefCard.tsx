import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles, AlertTriangle, RefreshCw, ArrowRight, FileText } from 'lucide-react';
import { useOnboarding } from '@/features/onboarding/hooks/useOnboarding';
import { useAuthStore } from '@/store/auth.store';
import { useTripBrief } from '../hooks/useTripBrief';
import { regenerateTripBrief } from '../services/brief.service';

const SPRING = { type: 'spring', damping: 24, stiffness: 100 } as const;

export function TripBriefCard() {
  const reduced = useReducedMotion() ?? false;
  const { state } = useOnboarding();
  const user = useAuthStore((s) => s.user);
  const tripId = state.data.tripId;
  const destination = state.data.destination ?? 'your destination';

  const { brief, isLoading } = useTripBrief(tripId);
  const [isInitiating, setIsInitiating] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  if (!state.completed || !tripId) return null;

  async function handleRegenerate() {
    if (!tripId || !user?.id || isInitiating) return;
    setIsInitiating(true);
    setInitError(null);
    try {
      await regenerateTripBrief(tripId, user.id);
    } catch (err) {
      setInitError(err instanceof Error ? err.message : 'Failed to start generation');
    } finally {
      setIsInitiating(false);
    }
  }

  if (isLoading) {
    return (
      <div
        className="animate-pulse rounded-2xl border border-border/50 bg-card p-5"
        role="status"
        aria-label="Loading AI brief"
      >
        <div className="mb-3 h-3 w-1/3 rounded bg-muted" />
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-muted" />
          <div className="h-3 w-4/5 rounded bg-muted" />
          <div className="h-3 w-3/5 rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (!brief) return null;

  if (brief.status === 'generating') {
    return (
      <div
        className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-5"
        role="status"
        aria-live="polite"
        aria-label={`Preparing AI brief for ${destination}`}
      >
        <div className="mb-3 flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-indigo-400" aria-hidden="true" />
          <span className="text-xs font-semibold uppercase tracking-wide text-indigo-400">
            Preparing your AI brief for {destination}...
          </span>
        </div>
        <div className="animate-pulse space-y-2" aria-hidden="true">
          <div className="h-3 w-full rounded bg-indigo-500/10" />
          <div className="h-3 w-4/5 rounded bg-indigo-500/10" />
          <div className="h-3 w-3/5 rounded bg-indigo-500/10" />
        </div>
      </div>
    );
  }

  if (brief.status === 'complete') {
    return (
      <motion.div
        initial={reduced ? {} : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        className="rounded-2xl border border-indigo-500/20 p-5"
        style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.06))',
        }}
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-wide text-indigo-400">
              AI brief ready
            </span>
          </div>
          <Link
            to={`/trips/${tripId}`}
            className="flex items-center gap-1 rounded text-xs text-indigo-400 hover:text-indigo-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1"
          >
            View full brief
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        </div>

        {brief.trip_summary && (
          <p className="mb-3 line-clamp-3 text-sm text-foreground/80">{brief.trip_summary}</p>
        )}

        <Link
          to={`/trips/${tripId}/itinerary`}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-border/60 bg-background/60 px-3 text-xs font-medium text-foreground hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <FileText className="h-3.5 w-3.5" aria-hidden="true" />
          View Day 1 plan
        </Link>
      </motion.div>
    );
  }

  // Failed state (brief.status === 'failed')
  return (
    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
      <p className="sr-only" role="status" aria-live="polite">
        AI brief could not be generated for {destination}.
      </p>

      <div className="mb-2 flex items-center gap-1.5">
        <AlertTriangle className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
        <span className="text-xs font-semibold uppercase tracking-wide text-amber-400">
          AI brief unavailable
        </span>
      </div>

      <p className="mb-3 text-sm text-muted-foreground">
        Your {destination} trip was created. The AI brief could not be generated.
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            void handleRegenerate();
          }}
          disabled={isInitiating}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg bg-amber-500/15 px-3 text-xs font-medium text-amber-300 hover:bg-amber-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:opacity-50"
        >
          <RefreshCw
            className={['h-3.5 w-3.5', isInitiating ? 'animate-spin' : ''].join(' ')}
            aria-hidden="true"
          />
          {isInitiating ? 'Starting...' : 'Generate again'}
        </button>

        <Link
          to={`/trips/${tripId}`}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-border/60 px-3 text-xs font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border"
        >
          View trip
        </Link>
      </div>

      {initError && (
        <p className="mt-2 text-xs text-rose-400" role="alert">
          {initError}
        </p>
      )}
    </div>
  );
}
