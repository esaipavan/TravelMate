import { supabase } from '@/lib/supabase';
import { resolveTripCoverImage } from '@/utils/destinationTheme';
import { selectTripCoverImage } from '@/services/place-image/placeImage.service';
import type { TripRow } from '../types';

// One-time, idempotent backfill of legacy `cover_image_url` values for a user's
// own trips. It applies the SAME honest selection path used at creation
// (Task 4) — reusing the Task 2 reconciliation and Task 3 enrichment gate — so
// it never introduces a guessed image:
//
//   • curated / custom cover        → kept
//   • legacy guessed cover          → re-derived (curated → real image → null)
//   • null cover, recognised place  → real curated / Wikipedia image
//   • weak / unknown place          → left null
//
// A row is written only when the honest target differs from what's stored, so
// re-running the job is a no-op after the first successful pass.

// Cap enrichment (Wikipedia) lookups per run so a large account can't fan out
// unbounded external calls in one pass. Idempotent, so any remainder is picked
// up on a later run.
const MAX_ENRICH_PER_RUN = 25;

export interface BackfillResult {
  scanned: number;
  updated: number;
}

export async function backfillTripCovers(userId: string): Promise<BackfillResult> {
  const { data, error } = await supabase.from('trips').select('*').eq('user_id', userId);
  if (error) throw new Error(error.message);

  const trips = (data ?? []) as TripRow[];
  let updated = 0;
  let enrichBudget = MAX_ENRICH_PER_RUN;

  for (const trip of trips) {
    try {
      const stored = trip.cover_image_url;

      // Sync reconcile first — resolves curated / custom / legacy without any
      // network call. Only genuinely uncovered (null-after-reconcile) places
      // spend the enrichment budget.
      const reconciled = resolveTripCoverImage(trip.destination, stored);
      let target: string | null;

      if (reconciled) {
        target = reconciled;
      } else if (enrichBudget > 0) {
        enrichBudget -= 1;
        target = await selectTripCoverImage(trip.destination);
      } else {
        // Out of enrichment budget this run — leave for a later pass. It still
        // renders correctly via the render-time reconciliation (Task 2).
        continue;
      }

      if (target !== stored) {
        const { error: upErr } = await supabase
          .from('trips')
          .update({ cover_image_url: target })
          .eq('id', trip.id);
        if (!upErr) updated += 1;
      }
    } catch (err) {
      // Best-effort per trip — one failure never aborts the whole backfill.
      if (import.meta.env.DEV) {
        console.warn('[cover-backfill] skipped a trip:', err);
      }
    }
  }

  return { scanned: trips.length, updated };
}
