import { supabase } from '@/lib/supabase';
import { selectTripCoverImage } from '@/services/place-image/placeImage.service';
import { generateTripBrief } from '@/services/ai/ai.service';
import type { TripBriefParams, TripBriefPayload, TripBriefStatus } from '@/services/ai/ai.types';
import type { Json } from '@/types/database.types';
import type { DestinationCategory, GroupType, BudgetTier } from '../types';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CreateTripWithBriefParams {
  userId: string;
  destination: string;
  destinationCategory: DestinationCategory | null;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  groupType: GroupType | null;
  budgetTier: BudgetTier | null;
}

export interface CreateTripWithBriefResult {
  tripId: string;
  briefId: string;
  status: TripBriefStatus;
  payload?: TripBriefPayload;
  errorMessage?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function toJson(value: unknown): Json {
  return value as Json;
}

function tripTitle(destination: string): string {
  return `${destination} Trip`;
}

// ── Service ───────────────────────────────────────────────────────────────────

export async function createTripWithBrief(
  params: CreateTripWithBriefParams,
): Promise<CreateTripWithBriefResult> {
  const { userId, destination, destinationCategory, startDate, endDate, groupType, budgetTier } =
    params;

  // Curated → real Wikipedia image → null. Persisted once so lists render the
  // correct photo without per-card fetches; never a guessed image.
  const coverImageUrl = await selectTripCoverImage(destination);

  // ── 1. Create trip ────────────────────────────────────────────────────────
  const { data: trip, error: tripError } = await supabase
    .from('trips')
    .insert({
      user_id: userId,
      title: tripTitle(destination),
      destination,
      country_code: null,
      cover_image_url: coverImageUrl,
      start_date: startDate,
      end_date: endDate,
      status: 'planning' as const,
      currency: 'INR',
      destination_category: destinationCategory,
      group_type: groupType,
      budget_tier: budgetTier,
      is_public: false,
      is_favourite: false,
    })
    .select()
    .single();

  if (tripError || !trip) {
    throw new Error(tripError?.message ?? 'Trip creation failed');
  }

  // ── 2. Insert trip_briefs row with status = 'generating' ──────────────────
  const { data: brief, error: briefInsertError } = await supabase
    .from('trip_briefs')
    .insert({ trip_id: trip.id, user_id: userId, status: 'generating' })
    .select()
    .single();

  if (briefInsertError || !brief) {
    // Trip was created but brief row failed — delete trip to keep DB clean
    await supabase.from('trips').delete().eq('id', trip.id);
    throw new Error(briefInsertError?.message ?? 'Failed to initialise trip brief');
  }

  // ── 3. Generate AI brief ──────────────────────────────────────────────────
  const briefParams: TripBriefParams = {
    destination,
    destinationCategory: destinationCategory ?? 'custom',
    startDate,
    endDate,
    groupType: groupType ?? 'solo',
    budgetTier,
  };

  let payload: TripBriefPayload | undefined;
  let finalStatus: TripBriefStatus = 'failed';
  let errorMessage: string | undefined;

  try {
    payload = await generateTripBrief(briefParams);
    finalStatus = 'complete';
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : 'AI_ERROR';
    if (import.meta.env.DEV) {
      console.warn('[onboarding] generateTripBrief failed:', errorMessage);
    }
  }

  // ── 4. Persist brief result ───────────────────────────────────────────────
  const briefUpdate =
    finalStatus === 'complete' && payload
      ? {
          status: 'complete' as const,
          trip_summary: payload.trip_summary,
          day_one_itinerary: toJson(payload.day_one_itinerary),
          weather_summary: toJson(payload.weather_summary),
          packing_checklist: toJson(payload.packing_checklist),
          required_documents: toJson(payload.required_documents),
          permits: toJson(payload.permits),
          darshan_info: toJson(payload.darshan_info),
          emergency_contacts: toJson(payload.emergency_contacts),
          budget_estimate: toJson(payload.budget_estimate),
          local_transport: toJson(payload.local_transport),
          hotel_suggestions: toJson(payload.hotel_suggestions),
          food_recommendations: toJson(payload.food_recommendations),
          safety_advice: payload.safety_advice,
        }
      : {
          status: 'failed' as const,
          error_message: errorMessage ?? 'Unknown error',
        };

  await supabase.from('trip_briefs').update(briefUpdate).eq('id', brief.id);

  // ── 5. Update profile preferences (non-critical — never throws) ───────────
  try {
    await supabase
      .from('profiles')
      .update({
        preferred_group_type: groupType,
        preferred_budget_tier: budgetTier,
        onboarding_version: 3,
      })
      .eq('id', userId);
  } catch {
    // Profile update failure does not block onboarding completion
  }

  // ── 6. Return result ──────────────────────────────────────────────────────
  return {
    tripId: trip.id,
    briefId: brief.id,
    status: finalStatus,
    payload,
    errorMessage,
  };
}
