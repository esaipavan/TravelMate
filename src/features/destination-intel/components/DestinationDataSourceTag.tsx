import { SourceTag } from '@/components/shared/SourceTag';
import type { DestinationDataSource } from '../types';

// Shared trust label for every destination-intel section (Attractions, Food,
// Transport, Safety, Cost, Smart Recommendations). One badge per section,
// derived from the SAME `meta.source` the whole page's data already carries
// — never per-field, since every field in a section comes from the same
// curated/AI/fallback response. Required before AI_DESTINATION_GENERATION_ENABLED
// can ever be turned back on (see ai-destination.provider.ts's kill-switch
// comment) — an AI-generated section must never render without this.
export function DestinationDataSourceTag({
  source,
}: {
  source: DestinationDataSource | undefined;
}) {
  if (source === 'curated') {
    return <SourceTag kind="verified" label="Verified — curated guide" />;
  }
  if (source === 'ai') {
    return <SourceTag kind="ai" />;
  }
  // 'fallback' or missing — no trustworthy data for this destination yet.
  return <SourceTag kind="unknown" label="Not verified for this destination" />;
}
