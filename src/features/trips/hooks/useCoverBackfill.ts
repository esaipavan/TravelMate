import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { backfillTripCovers } from '../services/coverBackfill.service';

// Bump when the backfill logic changes materially and every user should
// re-run it once. Older keys are simply left behind (harmless).
const VERSION = 'v3';
// Small delay so the one-time backfill never competes with the app's initial
// critical data fetches on login.
const START_DELAY_MS = 4000;

/**
 * Runs the legacy cover-image backfill once per user, in the background.
 *
 * - Guarded by a per-user localStorage flag, so it runs at most once per user
 *   per version (and only retries on a later session if it failed).
 * - Non-blocking and best-effort: failures are swallowed (the app renders
 *   correctly without it via the Task 2 render-time reconciliation).
 * - Idempotent at the data layer, so an accidental extra run is harmless.
 */
export function useCoverBackfill(): void {
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const qc = useQueryClient();
  const startedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!userId || startedFor.current === userId) return;

    const key = `tm:cover-backfill:${VERSION}:${userId}`;
    if (localStorage.getItem(key)) return;

    startedFor.current = userId;

    const timer = setTimeout(() => {
      void (async () => {
        try {
          const { updated } = await backfillTripCovers(userId);
          localStorage.setItem(key, String(Date.now()));
          // Covers were rewritten in the DB → refresh trip lists so the real
          // photos appear without a manual reload.
          if (updated > 0) void qc.invalidateQueries({ queryKey: ['trips'] });
        } catch (err) {
          // Leave the flag unset so a later session can retry; safe because the
          // job is idempotent.
          if (import.meta.env.DEV) {
            console.warn('[cover-backfill] run failed:', err);
          }
        }
      })();
    }, START_DELAY_MS);

    return () => clearTimeout(timer);
  }, [userId, qc]);
}
