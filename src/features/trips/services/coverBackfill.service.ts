import { supabase } from '@/lib/supabase';
import { resolveDestinationImageDetail } from '@/utils/destinationTheme';
import { selectTripCoverImage } from '@/services/place-image/placeImage.service';
import type { TripRow } from '../types';

// One-time, idempotent backfill of `cover_image_url` for a user's own trips.
// It RE-DERIVES the honest cover from scratch, so a stale or guessed auto-cover
// (e.g. a loosely-related regional photo) is corrected to the current
// place-specific result:
//
//   • genuine user upload / custom URL → always kept, never touched
//   • auto cover (our Unsplash stock or a Wikipedia enrichment) OR null →
//     re-derived: place-specific curated → strict place-specific Wikipedia
//     photo → null (honest gradient)
//
// A row is written only when the honest target differs from what's stored, so
// re-running the job is a no-op once every cover already matches.

// Auto-selected covers (our Unsplash stock or a Wikipedia enrichment) are
// re-derivable; a genuine user upload / custom URL is not, and must be kept.
function isAutoCover(url: string): boolean {
  return (
    url.includes('images.unsplash.com') ||
    url.includes('wikimedia.org') ||
    url.includes('wikipedia.org')
  );
}

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

      // Genuine user upload / custom URL → always keep, never re-derive.
      if (stored && !isAutoCover(stored)) continue;

      // Re-derive the honest cover from scratch so a stale/guessed auto-cover
      // gets corrected: place-specific curated (no network) → strict,
      // place-specific Wikipedia photo (budgeted) → null (honest gradient).
      let target: string | null;
      const detail = resolveDestinationImageDetail(trip.destination);
      if (detail.url && !detail.generic) {
        target = detail.url; // specific curated — no network
      } else if (enrichBudget > 0) {
        enrichBudget -= 1;
        target = await selectTripCoverImage(trip.destination);
      } else {
        // Out of enrichment budget this run — corrected on a later pass.
        continue;
      }

      if (target !== (stored ?? null)) {
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
