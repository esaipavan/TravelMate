import { supabase } from '@/lib/supabase';
import type { TripRow, TripInsert, TripUpdate } from '../types';

export async function getTrips(userId: string): Promise<TripRow[]> {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('user_id', userId)
    .order('start_date', { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getTripById(id: string): Promise<TripRow | null> {
  const { data, error } = await supabase.from('trips').select('*').eq('id', id).single();
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
  const { data, error } = await supabase
    .from('trips')
    .insert({
      user_id: trip.user_id,
      title: `${trip.title} (Copy)`,
      destination: trip.destination,
      country_code: trip.country_code,
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
