import { supabase } from '@/lib/supabase';
import type { FeatureFlag } from '../types';

/**
 * TanStack Query key factory for feature flags.
 * Centralised here so every hook that touches this data uses the same keys
 * and cache invalidation works correctly across the app.
 */
export const featureFlagKeys = {
  all: () => ['feature-flags'] as const,
} as const;

/**
 * Fetches all feature flags the current user is allowed to read.
 * RLS policy: authenticated users see enabled flags; admins see all flags.
 * Returns an empty array (never throws) so callers treat missing data as
 * "all flags disabled" rather than an error state.
 */
export async function fetchFeatureFlags(): Promise<FeatureFlag[]> {
  const { data, error } = await supabase
    .from('feature_flags')
    .select(
      'id, name, description, is_enabled, rollout_percentage, created_by, created_at, updated_at',
    )
    .order('name');

  if (error) throw new Error(error.message);
  return (data ?? []) as FeatureFlag[];
}
