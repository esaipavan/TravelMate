import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { fetchFeatureFlags, featureFlagKeys } from '../services/feature-flags.service';
import type { FeatureFlag } from '../types';

// ─── Cache configuration ──────────────────────────────────────────────────────
//
// Flags are operationally stable: they are changed deliberately by admins, not
// by user actions. A 10-minute stale time means most sessions never refetch.
// retry: false enforces fail-closed behaviour — if the DB is unreachable,
// features default to OFF rather than stale-retrying with potentially wrong data.
//
const FLAG_STALE_TIME = 1_000 * 60 * 10; // 10 minutes
const FLAG_GC_TIME = 1_000 * 60 * 60; // 1 hour

// ─── Internal shared query ────────────────────────────────────────────────────

function useFeatureFlagsQuery() {
  return useQuery({
    queryKey: featureFlagKeys.all(),
    queryFn: fetchFeatureFlags,
    staleTime: FLAG_STALE_TIME,
    gcTime: FLAG_GC_TIME,
    retry: false,
  });
}

// ─── Rollout bucketing ────────────────────────────────────────────────────────
//
// Uses FNV-1a (32-bit) to deterministically assign each user to a bucket 0–99
// for a given flag name. The same user always lands in the same bucket for the
// same flag, giving a consistent experience across sessions and devices.
//
// FNV-1a is not cryptographically secure, but that is not required here —
// we only need uniform distribution and stability for feature rollouts.
//
function deterministicBucket(userId: string, flagName: string): number {
  const str = `${userId}:${flagName}`;
  let h = 0x811c9dc5; // FNV-1a offset basis (32-bit)
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0; // FNV prime, keep unsigned 32-bit
  }
  return h % 100;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns whether a named feature flag is enabled for the current user.
 *
 * Fail-closed guarantees:
 * - Returns false while flags are loading.
 * - Returns false if the network request fails.
 * - Returns false if the flag does not exist in the DB.
 * - Returns false if is_enabled is false, regardless of rollout_percentage.
 *
 * Partial rollouts: when rollout_percentage is 1–99, the current user's
 * bucket is computed deterministically from their user ID + flag name.
 * Anonymous (unauthenticated) users are always excluded from partial rollouts.
 */
export function useFeatureFlag(name: string): boolean {
  const userId = useAuthStore((s) => s.user?.id);
  const { data: flags } = useFeatureFlagsQuery();

  if (!flags) return false; // loading or error → fail closed

  const flag = flags.find((f) => f.name === name);
  if (!flag || !flag.is_enabled) return false;
  if (flag.rollout_percentage >= 100) return true;
  if (flag.rollout_percentage <= 0) return false;

  // Partial rollout — require an authenticated user for bucket assignment
  if (!userId) return false;
  return deterministicBucket(userId, name) < flag.rollout_percentage;
}

/**
 * Returns all readable feature flags.
 * Primarily useful for admin dashboards and debug tooling.
 * Returns an empty array until the first successful fetch.
 */
export function useFeatureFlags(): FeatureFlag[] {
  const { data } = useFeatureFlagsQuery();
  return data ?? [];
}
