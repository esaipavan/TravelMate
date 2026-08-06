import { supabase } from '@/lib/supabase';
import type {
  AIMessage,
  AIRequestOptions,
  AIResponse,
  TripBriefParams,
  TripBriefPayload,
} from './ai.types';

/** Single public function the entire app uses for AI — never calls a provider directly. */
export async function chatWithAI(
  messages: AIMessage[],
  options?: AIRequestOptions,
): Promise<AIResponse> {
  const result = await supabase.functions.invoke<AIResponse>('ai-chat', {
    body: { messages, options },
  });

  if (result.error) {
    const msg = result.error instanceof Error ? result.error.message : 'AI request failed';
    throw new Error(msg);
  }
  if (!result.data) throw new Error('No response from AI service');

  return result.data;
}

// ── Trip Brief generation ─────────────────────────────────────────────────────

const BRIEF_TIMEOUT_MS = 30_000;
const BRIEF_MAX_RETRIES = 1;

function buildBriefPrompt(p: TripBriefParams): string {
  const start = new Date(p.startDate + 'T00:00:00');
  const end = new Date(p.endDate + 'T00:00:00');
  const nights = Math.round((end.getTime() - start.getTime()) / 86_400_000);
  const category = p.destinationCategory.replace(/_/g, ' ');
  const budget = p.budgetTier ?? 'unspecified';

  return [
    `Generate a comprehensive trip brief for the following trip:`,
    ``,
    `Destination: ${p.destination}`,
    `Trip type: ${category}`,
    `Dates: ${p.startDate} to ${p.endDate} (${nights} night${nights !== 1 ? 's' : ''})`,
    `Group: ${p.groupType}`,
    `Budget tier: ${budget}`,
    ``,
    `Respond with ONLY a valid JSON object (no markdown, no explanation). Use these exact keys:`,
    `{`,
    `  "trip_summary": "2-3 sentence overview of the trip",`,
    `  "day_one_itinerary": [{"title": "string", "activities": ["string"], "tips": ["string"]}],`,
    `  "weather_summary": {"expected": "string", "temperature_range": "string", "clothing_advice": "string", "alerts": ["string"]},`,
    `  "packing_checklist": [{"category": "string", "items": ["string"]}],`,
    `  "required_documents": ["string"],`,
    `  "permits": [{"name": "string", "details": "string", "how_to_get": "string"}],`,
    `  "darshan_info": {"temple": "string", "timing": "string", "advance_booking": "string", "dress_code": "string", "tips": ["string"]} or null,`,
    `  "emergency_contacts": [{"label": "string", "number": "string"}],`,
    `  "budget_estimate": {"total_inr": 0, "accommodation_inr": 0, "food_inr": 0, "transport_inr": 0, "activities_inr": 0, "misc_inr": 0, "notes": "string"},`,
    `  "local_transport": [{"option": "string", "details": "string", "cost": "string"}],`,
    `  "hotel_suggestions": [{"name": "string", "type": "string", "area": "string", "price_range": "string", "booking_tip": "string"}],`,
    `  "food_recommendations": [{"dish": "string", "where": "string", "notes": "string"}],`,
    `  "safety_advice": "string"`,
    `}`,
    ``,
    `Focus on India-first context. Use INR for all budget estimates. Include local emergency numbers for ${p.destination}.`,
  ].join('\n');
}

function validateBriefPayload(raw: unknown): TripBriefPayload {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    throw new Error('AI_INVALID_JSON');
  }
  const obj = raw as Record<string, unknown>;

  if (typeof obj.trip_summary !== 'string' || obj.trip_summary.trim() === '') {
    throw new Error('AI_INVALID_JSON');
  }
  if (typeof obj.safety_advice !== 'string') {
    throw new Error('AI_INVALID_JSON');
  }
  if (!Array.isArray(obj.packing_checklist)) {
    throw new Error('AI_INVALID_JSON');
  }
  if (!Array.isArray(obj.required_documents)) {
    throw new Error('AI_INVALID_JSON');
  }
  if (!Array.isArray(obj.emergency_contacts)) {
    throw new Error('AI_INVALID_JSON');
  }

  return {
    trip_summary: obj.trip_summary,
    safety_advice: typeof obj.safety_advice === 'string' ? obj.safety_advice : '',
    day_one_itinerary: obj.day_one_itinerary ?? [],
    weather_summary: obj.weather_summary ?? {},
    packing_checklist: obj.packing_checklist as unknown[],
    required_documents: (obj.required_documents as unknown[]).filter(
      (d): d is string => typeof d === 'string',
    ),
    permits: obj.permits ?? [],
    darshan_info: obj.darshan_info ?? null,
    emergency_contacts: obj.emergency_contacts as unknown[],
    budget_estimate: obj.budget_estimate ?? {},
    local_transport: Array.isArray(obj.local_transport) ? obj.local_transport : [],
    hotel_suggestions: Array.isArray(obj.hotel_suggestions) ? obj.hotel_suggestions : [],
    food_recommendations: Array.isArray(obj.food_recommendations) ? obj.food_recommendations : [],
  };
}

async function invokeBrief(params: TripBriefParams): Promise<TripBriefPayload> {
  const messages: AIMessage[] = [{ role: 'user', content: buildBriefPrompt(params) }];
  const options: AIRequestOptions = {
    systemPrompt:
      'You are TravelMate AI, an expert India-first travel planning assistant. ' +
      'Respond ONLY with valid JSON — no markdown fences, no explanation, no text outside the JSON object.',
  };

  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('AI_TIMEOUT')), BRIEF_TIMEOUT_MS),
  );

  const invoke = supabase.functions.invoke<AIResponse>('ai-chat', {
    body: { messages, options },
  });

  const result = await Promise.race([invoke, timeout]);

  if (result.error) {
    throw new Error(result.error instanceof Error ? result.error.message : 'AI_ERROR');
  }
  if (!result.data?.content) throw new Error('AI_EMPTY_RESPONSE');

  let parsed: unknown;
  try {
    // Strip any accidental markdown fences the model may include
    const cleaned = result.data.content
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/i, '')
      .trim();
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error('AI_INVALID_JSON');
  }

  return validateBriefPayload(parsed);
}

export async function generateTripBrief(params: TripBriefParams): Promise<TripBriefPayload> {
  let lastError: Error = new Error('AI_ERROR');

  for (let attempt = 0; attempt <= BRIEF_MAX_RETRIES; attempt++) {
    try {
      return await invokeBrief(params);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error('AI_ERROR');
      const code = lastError.message;
      // Do not retry on timeout or malformed JSON — only on network / transient errors
      if (code === 'AI_TIMEOUT' || code === 'AI_INVALID_JSON') break;
      if (attempt < BRIEF_MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, 1_500));
      }
    }
  }

  throw lastError;
}

export async function streamChatWithAI(
  messages: AIMessage[],
  options: AIRequestOptions | undefined,
  _onChunk: (chunk: string) => void,
  onDone: (response: AIResponse) => void,
): Promise<void> {
  const result = await supabase.functions.invoke<AIResponse>('ai-chat', {
    body: { messages, options, stream: true },
  });

  if (result.error) {
    const msg = result.error instanceof Error ? result.error.message : 'AI stream failed';
    throw new Error(msg);
  }
  if (!result.data) throw new Error('No response from AI stream');

  onDone(result.data);
}
