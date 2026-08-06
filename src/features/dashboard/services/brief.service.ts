import { supabase } from '@/lib/supabase';
import { generateTripBrief } from '@/services/ai/ai.service';
import type { TripBriefStatus, TripBriefPayload } from '@/services/ai/ai.types';
import type { Json } from '@/types/database.types';

function toJson(value: unknown): Json {
  return value as Json;
}

export interface TripBriefRow {
  id: string;
  trip_id: string;
  status: TripBriefStatus;
  trip_summary: string | null;
  weather_summary: Json | null;
  packing_checklist: Json | null;
  day_one_itinerary: Json | null;
  required_documents: Json | null;
  budget_estimate: Json | null;
  safety_advice: string | null;
  error_message: string | null;
}

export async function getTripBrief(tripId: string): Promise<TripBriefRow | null> {
  const { data, error } = await supabase
    .from('trip_briefs')
    .select(
      'id, trip_id, status, trip_summary, weather_summary, packing_checklist, day_one_itinerary, required_documents, budget_estimate, safety_advice, error_message',
    )
    .eq('trip_id', tripId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as TripBriefRow | null;
}

export async function regenerateTripBrief(tripId: string, userId: string): Promise<void> {
  const { data: trip, error: tripErr } = await supabase
    .from('trips')
    .select('destination, destination_category, start_date, end_date, group_type, budget_tier')
    .eq('id', tripId)
    .single();

  if (tripErr || !trip) throw new Error('Trip not found');

  const { data: existing } = await supabase
    .from('trip_briefs')
    .select('id')
    .eq('trip_id', tripId)
    .maybeSingle();

  let briefId: string;

  if (existing?.id) {
    briefId = existing.id;
    await supabase
      .from('trip_briefs')
      .update({ status: 'generating' as const, error_message: null })
      .eq('id', briefId);
  } else {
    const { data: newBrief, error: insertErr } = await supabase
      .from('trip_briefs')
      .insert({ trip_id: tripId, user_id: userId, status: 'generating' as const })
      .select('id')
      .single();
    if (insertErr || !newBrief) throw new Error('Failed to initialise brief');
    briefId = newBrief.id;
  }

  let payload: TripBriefPayload | undefined;
  let finalStatus: TripBriefStatus = 'failed';
  let errorMessage: string | undefined;

  try {
    payload = await generateTripBrief({
      destination: trip.destination,
      destinationCategory: trip.destination_category ?? 'custom',
      startDate: trip.start_date,
      endDate: trip.end_date,
      groupType: trip.group_type ?? 'solo',
      budgetTier: trip.budget_tier,
    });
    finalStatus = 'complete';
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : 'AI_ERROR';
    if (import.meta.env.DEV) {
      console.warn('[brief.service] regenerateTripBrief failed:', errorMessage);
    }
  }

  if (finalStatus === 'complete' && payload) {
    await supabase
      .from('trip_briefs')
      .update({
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
      })
      .eq('id', briefId);
  } else {
    await supabase
      .from('trip_briefs')
      .update({ status: 'failed' as const, error_message: errorMessage ?? 'Unknown error' })
      .eq('id', briefId);
  }
}
