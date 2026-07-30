import type { Database } from '@/types/database.types';

/**
 * Domain type for a feature flag row.
 * Aliased from the generated DB type so it stays in sync with schema changes
 * without requiring manual updates here.
 */
export type FeatureFlag = Database['public']['Tables']['feature_flags']['Row'];
