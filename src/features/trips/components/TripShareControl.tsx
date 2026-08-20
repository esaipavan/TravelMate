import { Share2, Copy, Globe, Lock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useUpdateTrip } from '../hooks/useTrips';
import type { TripRow } from '../types';

/**
 * Owner-only control to publish a read-only public itinerary link. Toggles the
 * trip's existing `is_public` flag; the link points at the public route which
 * renders the same itinerary read-only. Hidden from public/read-only viewers by
 * the caller (gated on canEdit).
 */
export function TripShareControl({ trip }: { trip: TripRow }) {
  const update = useUpdateTrip();
  const url = `${window.location.origin}/p/${trip.id}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Public link copied');
    } catch {
      toast.error('Couldn’t copy the link');
    }
  }

  function enable() {
    update.mutate(
      { id: trip.id, data: { is_public: true } },
      {
        onSuccess: () => {
          toast.success('Public link created');
          void copyLink();
        },
        onError: () => toast.error('Couldn’t enable sharing'),
      },
    );
  }

  function disable() {
    update.mutate(
      { id: trip.id, data: { is_public: false } },
      {
        onSuccess: () => toast.success('Public link disabled'),
        onError: () => toast.error('Couldn’t disable sharing'),
      },
    );
  }

  return (
    <section aria-label="Share trip" className="rounded-2xl border border-border/60 bg-card p-5">
      <div className="mb-3 flex items-center gap-2">
        <Share2 className="h-4 w-4 text-primary" aria-hidden />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Share
        </h2>
        <span
          className={
            trip.is_public
              ? 'inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400'
              : 'inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground'
          }
        >
          {trip.is_public ? (
            <>
              <Globe className="h-2.5 w-2.5" aria-hidden /> Public
            </>
          ) : (
            <>
              <Lock className="h-2.5 w-2.5" aria-hidden /> Private
            </>
          )}
        </span>
      </div>

      {trip.is_public ? (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Anyone with this link can view a read-only version of this itinerary.
          </p>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={url}
              aria-label="Public itinerary link"
              onFocus={(e) => e.currentTarget.select()}
              className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <Button size="sm" className="gap-1.5" onClick={() => void copyLink()}>
              <Copy className="h-3.5 w-3.5" aria-hidden />
              Copy
            </Button>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="gap-1.5 text-muted-foreground"
            disabled={update.isPending}
            onClick={disable}
          >
            {update.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            ) : (
              <Lock className="h-3.5 w-3.5" aria-hidden />
            )}
            Make private
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Create a public link to share a read-only itinerary — the plan, timeline and costs, with
            no editing.
          </p>
          <Button size="sm" className="gap-1.5" disabled={update.isPending} onClick={enable}>
            {update.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            ) : (
              <Globe className="h-3.5 w-3.5" aria-hidden />
            )}
            Create public link
          </Button>
        </div>
      )}
    </section>
  );
}
