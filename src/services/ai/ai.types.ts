export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIRequestOptions {
  systemPrompt?: string;
  tripContext?: {
    tripId: string;
    destination: string;
    startDate: string;
    endDate: string;
    budget?: number;
    currency?: string;
  };
}

export interface AIResponse {
  content: string;
  provider: string;
  model: string;
  tokensUsed?: number;
}

export interface AIStreamChunk {
  delta: string;
  done: boolean;
}

// ── Onboarding 2.0: Trip Brief ─────────────────────────────────────────────────

export interface TripBriefParams {
  destination: string;
  destinationCategory: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  groupType: string;
  budgetTier: string | null;
}

export interface TripBriefPayload {
  trip_summary: string;
  day_one_itinerary: unknown;
  weather_summary: unknown;
  packing_checklist: unknown[];
  required_documents: string[];
  permits: unknown;
  darshan_info: unknown;
  emergency_contacts: unknown[];
  budget_estimate: unknown;
  local_transport: unknown[];
  hotel_suggestions: unknown[];
  food_recommendations: unknown[];
  safety_advice: string;
}

export type TripBriefStatus = 'generating' | 'complete' | 'failed';
