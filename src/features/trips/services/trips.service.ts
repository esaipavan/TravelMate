import { supabase } from '@/lib/supabase';
import { resolveTripCoverImage, isGenericTempleCover } from '@/utils/destinationTheme';
import { selectTripCoverImage } from '@/services/place-image/placeImage.service';
import type { TripRow, TripInsert, TripUpdate } from '../types';

export async function getTrips(_userId: string): Promise<TripRow[]> {
  // RLS now returns both owned trips and shared trips (via trip_members policy).
  // The userId parameter is kept for API compatibility but is no longer used as a filter.
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .order('start_date', { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getTripById(id: string): Promise<TripRow | null> {
  const { data, error } = await supabase.from('trips').select('*').eq('id', id).single();
  if (error) throw new Error(error.message);
  return data;
}

/**
 * Fetch a trip for the PUBLIC read-only itinerary page. Only returns the trip
 * when it is marked is_public — RLS + this explicit filter keep private trips
 * private even for unauthenticated viewers. Returns null when not found/public.
 */
export async function getPublicTripById(id: string): Promise<TripRow | null> {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('id', id)
    .eq('is_public', true)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function createTrip(trip: TripInsert): Promise<TripRow> {
  const { data, error } = await supabase.from('trips').insert(trip).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateTrip(id: string, trip: TripUpdate): Promise<TripRow> {
  const { data, error } = await supabase
    .from('trips')
    .update({ ...trip, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteTrip(id: string): Promise<void> {
  const { error } = await supabase.from('trips').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function duplicateTrip(trip: TripRow): Promise<TripRow> {
  // Reconcile the source cover (drops legacy guesses, keeps curated/custom),
  // then enrich if the place has no image yet OR only the generic temple-gopuram
  // stand-in — never copy a guessed image.
  const reconciled = resolveTripCoverImage(trip.destination, trip.cover_image_url);
  const cover =
    reconciled && !isGenericTempleCover(reconciled)
      ? reconciled
      : ((await selectTripCoverImage(trip.destination)) ?? reconciled);
  const { data, error } = await supabase
    .from('trips')
    .insert({
      user_id: trip.user_id,
      title: `${trip.title} (Copy)`,
      destination: trip.destination,
      country_code: trip.country_code,
      cover_image_url: cover,
      start_date: trip.start_date,
      end_date: trip.end_date,
      currency: trip.currency,
      total_budget: trip.total_budget,
      notes: trip.notes,
      status: 'planning' as const,
      is_public: false,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function toggleFavourite(id: string, isFavourite: boolean): Promise<void> {
  const { error } = await supabase
    .from('trips')
    .update({ is_favourite: isFavourite, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(error.message);
}
