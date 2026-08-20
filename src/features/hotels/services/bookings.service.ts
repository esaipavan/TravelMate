import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database.types';
import type { BookingDraft, BookingMode, BookingStatus } from '../types';

type BookingRow = Database['public']['Tables']['bookings']['Row'];

// ── Row ↔ draft mapping ─────────────────────────────────────────────────────

function rowToDraft(row: BookingRow): BookingDraft {
  return {
    id: row.id,
    mode: row.mode as BookingMode,
    title: row.title,
    subtitle: row.subtitle ?? '',
    destination: row.destination,
    checkIn: row.check_in ?? undefined,
    checkOut: row.check_out ?? undefined,
    startTime: row.start_time ?? undefined,
    endTime: row.end_time ?? undefined,
    guests: row.guests ?? undefined,
    nights: row.nights,
    unitPrice: Number(row.unit_price),
    total: Number(row.total),
    currency: row.currency,
    tripId: row.trip_id,
    createdAt: new Date(row.created_at).getTime(),
    status: (row.status as BookingStatus) ?? 'draft',
  };
}

// ── CRUD ────────────────────────────────────────────────────────────────────

export async function listBookings(userId: string): Promise<BookingDraft[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToDraft);
}

/**
 * List bookings for a PUBLIC trip's read-only itinerary. RLS (migration 023)
 * only returns rows whose trip is is_public, so this is safe for unauthenticated
 * viewers and never leaks private-trip bookings.
 */
export async function listPublicBookings(tripId: string): Promise<BookingDraft[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToDraft);
}

// Insert lets the DB assign the uuid id — the client draft.id is only used for
// the local fallback cache, never as the server primary key.
export async function createBooking(userId: string, draft: BookingDraft): Promise<BookingDraft> {
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      user_id: userId,
      trip_id: draft.tripId ?? null,
      mode: draft.mode,
      title: draft.title,
      subtitle: draft.subtitle,
      destination: draft.destination,
      check_in: draft.checkIn ?? null,
      check_out: draft.checkOut ?? null,
      start_time: draft.startTime ?? null,
      end_time: draft.endTime ?? null,
      guests: draft.guests ?? null,
      nights: draft.nights,
      unit_price: draft.unitPrice,
      total: draft.total,
      currency: draft.currency,
      status: draft.status ?? 'draft',
    })
    .select()
    .single();
  if (error || !data) throw new Error(error?.message ?? 'Failed to save booking');
  return rowToDraft(data);
}

export async function updateBookingStatus(id: string, status: BookingStatus): Promise<void> {
  const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteBooking(id: string): Promise<void> {
  const { error } = await supabase.from('bookings').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
