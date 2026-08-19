import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Loader2, AlertTriangle, ArrowRight, PhoneCall } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth.store';
import { regenerateTripBrief } from '@/features/dashboard/services/brief.service';
import { getEmergencyNumbers } from '@/features/destination-intel/data/countryDefaults';
import type { TripBriefRow } from '@/features/dashboard/hooks/useTripBrief';

interface Props {
  tripId: string;
  countryCode: string | null;
  brief: TripBriefRow | null;
  briefLoading: boolean;
}

export function PrepareTripGuideSection({ tripId, countryCode, brief, briefLoading }: Props) {
  const user = useAuthStore((s) => s.user);
  const [triggering, setTriggering] = useState(false);

  const emergency = getEmergencyNumbers(countryCode ?? 'IN');

  async function handleGenerate() {
    if (!user || triggering) return;
    setTriggering(true);
    try {
      await regenerateTripBrief(tripId, user.id);
    } catch {
      // regenerateTripBrief already persists a 'failed' status on error —
      // the realtime subscription in useTripBrief will pick it up.
    } finally {
      setTriggering(false);
    }
  }

  const isGenerating = triggering || brief?.status === 'generating';
  const isFailed = brief?.status === 'failed';
  const isComplete = brief?.status === 'complete';

  return (
    <section id="guide" className="scroll-mt-20 rounded-2xl border border-border/60 bg-card p-5">
      <div className="mb-1 flex items-center gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-foreground">Trip information</h2>
          <p className="text-xs text-muted-foreground">
            Review useful information before you travel.
          </p>
        </div>
      </div>

      {/* Emergency numbers — real, deterministic data, independent of AI */}
      <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-border/50 bg-background/60 px-3.5 py-2.5">
        <PhoneCall className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
        <p className="text-xs text-foreground">
          Emergency: <span className="font-semibold tabular-nums">{emergency.general}</span>
          {emergency.touristHelpline && (
            <>
              {' '}
              · Tourist helpline:{' '}
              <span className="font-semibold tabular-nums">{emergency.touristHelpline}</span>
            </>
          )}
        </p>
      </div>

      <div className="mt-3">
        {briefLoading ? (
          <div className="h-16 animate-pulse rounded-xl bg-muted/50" />
        ) : isGenerating ? (
          <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-background/60 px-4 py-4">
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">Putting together your trip guide…</p>
          </div>
        ) : isComplete ? (
          <div className="space-y-3">
            {brief?.trip_summary && (
              <p className="text-sm leading-relaxed text-foreground/90">{brief.trip_summary}</p>
            )}
            <Link
              to={`/trips/${tripId}/itinerary`}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              View day-by-day plan
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>
        ) : isFailed ? (
          <div className="flex flex-col items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">
                Trip guide couldn't be generated right now.
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => void handleGenerate()}>
              Try again
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-start gap-2.5 rounded-xl border border-dashed border-border/60 px-4 py-4">
            <p className="text-sm text-muted-foreground">
              Get a short trip summary, a first-day plan idea, and packing pointers — grounded in
              your actual trip details.
            </p>
            <Button size="sm" onClick={() => void handleGenerate()}>
              <Sparkles className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
              Generate trip guide
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
