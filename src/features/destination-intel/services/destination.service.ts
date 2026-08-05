import { AIDestinationProvider } from './ai-destination.provider';
import type { DestinationData } from '../types';

export type { DestinationProvider } from './ai-destination.provider';

// ─── Active provider ───────────────────────────────────────────────
// AIDestinationProvider:
//  - Known cities (Goa, Bali, Bangkok, Tokyo, Paris, Dubai, London) → curated static data
//  - All other destinations → AI-generated via chatWithAI (ai-chat Edge Function)
//  - Falls back to generic template if AI call fails

const provider = new AIDestinationProvider();

export async function fetchDestinationIntel(destination: string): Promise<DestinationData> {
  return provider.getDestinationData(destination);
}
