import { supabase } from '@/lib/supabase';
import type { ChecklistData, PackingItemInsert, PackingItemUpdate, PackingItemRow } from '../types';

export async function getChecklistData(tripId: string): Promise<ChecklistData> {
  const [{ data: trip, error: tripError }, { data: items, error: itemsError }] = await Promise.all([
    supabase.from('trips').select('title').eq('id', tripId).single(),
    supabase
      .from('packing_items')
      .select('*')
      .eq('trip_id', tripId)
      .order('category', { ascending: true })
      .order('order_index', { ascending: true }),
  ]);

  if (tripError) throw new Error(tripError.message);
  if (itemsError) throw new Error(itemsError.message);

  return {
    tripTitle: trip?.title ?? '',
    items: items ?? [],
  };
}

export async function createItem(data: PackingItemInsert): Promise<PackingItemRow> {
  const { data: row, error } = await supabase.from('packing_items').insert(data).select().single();
  if (error) throw new Error(error.message);
  return row;
}

export async function updateItem(id: string, data: PackingItemUpdate): Promise<PackingItemRow> {
  const { data: row, error } = await supabase
    .from('packing_items')
    .update(data)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return row;
}

export async function deleteItem(id: string): Promise<void> {
  const { error } = await supabase.from('packing_items').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function togglePacked(id: string, is_packed: boolean): Promise<void> {
  const { error } = await supabase.from('packing_items').update({ is_packed }).eq('id', id);
  if (error) throw new Error(error.message);
}
