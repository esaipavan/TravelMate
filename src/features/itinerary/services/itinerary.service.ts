import { supabase } from '@/lib/supabase';
import type {
  ItineraryData,
  ItineraryDay,
  ItineraryItemInsert,
  ItineraryItemUpdate,
  ItineraryItemRow,
} from '../types';

function getDaysBetween(startDate: string, endDate: string): string[] {
  const days: string[] = [];
  const curr = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  while (curr <= end) {
    // Use local date components, not toISOString() (UTC), to avoid a one-day
    // shift for timezones ahead of UTC (e.g. UTC+5:30).
    const y = curr.getFullYear();
    const m = String(curr.getMonth() + 1).padStart(2, '0');
    const d = String(curr.getDate()).padStart(2, '0');
    days.push(`${y}-${m}-${d}`);
    curr.setDate(curr.getDate() + 1);
  }
  return days;
}

async function initializeDays(tripId: string, startDate: string, endDate: string): Promise<void> {
  // Plain GET + limit(1) instead of `{ count: 'exact', head: true }` — Supabase's
  // PostgREST HEAD+count path intermittently 503s on this project while the
  // equivalent GET succeeds; see dashboard 500 investigation. limit(1) also
  // avoids counting every row just to check existence.
  const { data: existingDays, error } = await supabase
    .from('itinerary_days')
    .select('id')
    .eq('trip_id', tripId)
    .limit(1);

  if (error) throw new Error(error.message);
  if ((existingDays ?? []).length > 0) return;

  const inserts = getDaysBetween(startDate, endDate).map((date, i) => ({
    trip_id: tripId,
    day_number: i + 1,
    date,
  }));

  await supabase.from('itinerary_days').insert(inserts);
}

// Read-only existence check — deliberately does NOT call initializeDays().
// getItineraryData() auto-scaffolds one itinerary_days row per trip day as a
// side effect of loading the itinerary UI (which needs day placeholders even
// when empty). A boolean "has the user added anything" check must not carry
// that side effect, or merely opening the Dashboard/Prepare page would write
// itinerary_days rows for every trip viewed.
export async function hasItineraryItems(tripId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('itinerary_items')
    .select('id, itinerary_days!inner(trip_id)')
    .eq('itinerary_days.trip_id', tripId)
    .limit(1);

  if (error) throw new Error(error.message);
  return (data ?? []).length > 0;
}

async function fetchItineraryData(tripId: string, scaffold: boolean): Promise<ItineraryData> {
  const { data: trip, error: tripError } = await supabase
    .from('trips')
    .select('title, currency, start_date, end_date')
    .eq('id', tripId)
    .single();

  if (tripError) throw new Error(tripError.message);

  const tripTitle = trip?.title ?? '';
  const tripCurrency = trip?.currency ?? 'INR';
  const startDate = trip?.start_date ?? '';
  const endDate = trip?.end_date ?? '';

  if (scaffold && startDate && endDate) {
    await initializeDays(tripId, startDate, endDate);
  }

  const { data: dayRows, error: daysError } = await supabase
    .from('itinerary_days')
    .select('*')
    .eq('trip_id', tripId)
    .order('day_number', { ascending: true });

  if (daysError) throw new Error(daysError.message);

  const days = dayRows ?? [];

  if (days.length === 0) {
    return { tripTitle, tripCurrency, startDate, endDate, days: [] };
  }

  const dayIds = days.map((d) => d.id);
  const { data: itemRows, error: itemsError } = await supabase
    .from('itinerary_items')
    .select('*')
    .in('day_id', dayIds)
    .order('order_index', { ascending: true });

  if (itemsError) throw new Error(itemsError.message);

  const itemsByDay = new Map<string, ItineraryItemRow[]>();
  for (const item of itemRows ?? []) {
    const list = itemsByDay.get(item.day_id) ?? [];
    list.push(item);
    itemsByDay.set(item.day_id, list);
  }

  const hydratedDays: ItineraryDay[] = days.map((day) => ({
    ...day,
    items: itemsByDay.get(day.id) ?? [],
  }));

  return { tripTitle, tripCurrency, startDate, endDate, days: hydratedDays };
}

export async function getItineraryData(tripId: string): Promise<ItineraryData> {
  return fetchItineraryData(tripId, true);
}

// Read-only variant — never scaffolds itinerary_days. For passive summary
// surfaces (e.g. the Dashboard's "Today's Plan" widget) that display
// itinerary content but must never write to the database just from being
// viewed. Days that don't exist yet simply render as absent, matching what
// initializeDays() would have inserted anyway — the widget only needs to
// find today's day if one has already been created via the actual Itinerary
// page.
export async function getItineraryDataReadOnly(tripId: string): Promise<ItineraryData> {
  return fetchItineraryData(tripId, false);
}

export async function createItem(data: ItineraryItemInsert): Promise<ItineraryItemRow> {
  const { data: row, error } = await supabase
    .from('itinerary_items')
    .insert(data)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return row;
}

export async function updateItem(id: string, data: ItineraryItemUpdate): Promise<ItineraryItemRow> {
  const { data: row, error } = await supabase
    .from('itinerary_items')
    .update(data)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return row;
}

export async function deleteItem(id: string): Promise<void> {
  const { error } = await supabase.from('itinerary_items').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function reorderItems(updates: { id: string; order_index: number }[]): Promise<void> {
  const results = await Promise.all(
    updates.map(({ id, order_index }) =>
      supabase.from('itinerary_items').update({ order_index }).eq('id', id),
    ),
  );
  const firstError = results.find((r) => r.error)?.error;
  if (firstError) throw new Error(firstError.message);
}
