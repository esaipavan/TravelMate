import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles, AlertTriangle, RefreshCw, ArrowRight, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { SPRING } from '@/lib/motion';
import { useOnboarding } from '@/features/onboarding/hooks/useOnboarding';
import { useAuthStore } from '@/store/auth.store';
import { useTripBrief } from '../hooks/useTripBrief';
import { regenerateTripBrief } from '../services/brief.service';

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
        className="rounded-2xl border border-border/50 bg-card p-5"
        role="status"
        aria-label="Loading AI brief"
      >
        <Skeleton className="mb-3 h-3 w-1/3" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
          <Skeleton className="h-3 w-3/5" />
        </div>
      </div>
    );
  }

  if (!brief) return null;

  // `primary` is this app's established "AI-generated content" accent —
  // TripAIPanel's violet header badge and the destination-intel SourceTag AI
  // kind both already use it — so the generating/complete states below stay
  // visibly "AI-branded" without inventing a second ad hoc color (indigo-*)
  // to mean the same thing.
  if (brief.status === 'generating') {
    return (
      <div
        className="rounded-2xl border border-primary/20 bg-primary/5 p-5"
        role="status"
        aria-live="polite"
        aria-label={`Preparing AI brief for ${destination}`}
      >
        <div className="mb-3 flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-primary" aria-hidden="true" />
          <span className="text-xs font-semibold uppercase tracking-wide text-primary">
            Preparing your AI brief for {destination}...
          </span>
        </div>
        <div className="animate-pulse space-y-2" aria-hidden="true">
          <div className="h-3 w-full rounded bg-primary/10" />
          <div className="h-3 w-4/5 rounded bg-primary/10" />
          <div className="h-3 w-3/5 rounded bg-primary/10" />
        </div>
      </div>
    );
  }

  if (brief.status === 'complete') {
    return (
      <motion.div
        initial={reduced ? {} : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING.gentle}
        className="rounded-2xl border border-primary/20 bg-primary/5 p-5"
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-wide text-primary">
              AI brief ready
            </span>
          </div>
          <Link
            to={`/trips/${tripId}`}
            className="flex items-center gap-1 rounded text-xs text-primary hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
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
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-border/60 bg-background/60 px-3 text-xs font-medium text-foreground hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <FileText className="h-3.5 w-3.5" aria-hidden="true" />
          View Day 1 plan
        </Link>
      </motion.div>
    );
  }

  // Failed state (brief.status === 'failed') — `warning`, not `destructive`:
  // the trip itself was created fine, only the AI brief generation didn't
  // complete, so this isn't a hard error the rest of the app uses
  // `destructive`/`ErrorState` for.
  return (
    <div className="rounded-2xl border border-warning/20 bg-warning/5 p-5">
      <p className="sr-only" role="status" aria-live="polite">
        AI brief could not be generated for {destination}.
      </p>

      <div className="mb-2 flex items-center gap-1.5">
        <AlertTriangle className="h-3.5 w-3.5 text-warning" aria-hidden="true" />
        <span className="text-xs font-semibold uppercase tracking-wide text-warning">
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
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg bg-warning/15 px-3 text-xs font-medium text-warning hover:bg-warning/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning disabled:opacity-50"
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
        <p className="mt-2 text-xs text-destructive" role="alert">
          {initError}
        </p>
      )}
    </div>
  );
}
