import { getDestinationData } from '../data/mockData';
import type { DestinationData } from '../types';

// ─── Provider interface ────────────────────────────────────────────
// Swap the implementation when live APIs become available.
// Candidates: OpenWeatherMap (weather), Google Places (attractions),
//             Amadeus (transport/cost), TripAdvisor (reviews).

export interface DestinationProvider {
  getDestinationData(destination: string): Promise<DestinationData>;
}

// ─── Mock provider (Sprint 5.1) ────────────────────────────────────

class MockDestinationProvider implements DestinationProvider {
  async getDestinationData(destination: string): Promise<DestinationData> {
    await new Promise<void>((resolve) => setTimeout(resolve, 200));
    return getDestinationData(destination);
  }
}

// ─── Active provider ───────────────────────────────────────────────
// Future: replace with LiveDestinationProvider once API keys are in
// Supabase Edge Function secrets.

const provider: DestinationProvider = new MockDestinationProvider();

export async function fetchDestinationIntel(destination: string): Promise<DestinationData> {
  return provider.getDestinationData(destination);
}
