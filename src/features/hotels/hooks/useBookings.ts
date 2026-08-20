import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import {
  listBookings,
  createBooking,
  deleteBooking,
  updateBookingStatus,
} from '../services/bookings.service';
import { useBookingStore } from '../store/booking.store';
import type { BookingDraft, BookingStatus } from '../types';

/**
 * Unified booking-drafts API with a Supabase-synced source of truth and a
 * local (localStorage) fallback. Deterministic behaviour:
 *
 *   • Signed in + server reachable → Supabase is the source of truth; writes
 *     go to the DB (scoped to the user via RLS) and are mirrored locally.
 *   • Signed in but server unreachable (offline / table not deployed) → falls
 *     back to the local store, exactly like the pre-sync behaviour.
 *   • Signed out → local store only.
 *
 * Consumers keep using `{ drafts, addDraft, removeDraft }` unchanged, so the
 * compare / review / save UX is preserved.
 */
export function useBookings() {
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const qc = useQueryClient();

  const localDrafts = useBookingStore((s) => s.drafts);
  const localAdd = useBookingStore((s) => s.addDraft);
  const localRemove = useBookingStore((s) => s.removeDraft);
  const localSetStatus = useBookingStore((s) => s.setStatus);

  const query = useQuery<BookingDraft[], Error>({
    queryKey: ['bookings', userId],
    queryFn: () => listBookings(userId!),
    enabled: !!userId,
    // Fail fast so a missing table / offline state degrades to local quickly.
    retry: 0,
    staleTime: 5 * 60 * 1000,
  });

  // Server is authoritative only once its read has actually succeeded.
  const useServer = !!userId && query.isSuccess;
  const drafts = useServer ? (query.data ?? []) : localDrafts;

  async function addDraft(draft: BookingDraft): Promise<void> {
    if (userId) {
      try {
        const saved = await createBooking(userId, draft);
        await qc.invalidateQueries({ queryKey: ['bookings', userId] });
        localAdd(saved); // mirror for offline use
        return;
      } catch (err) {
        if (import.meta.env.DEV) console.warn('[bookings] save fell back to local:', err);
        localAdd(draft);
        return;
      }
    }
    localAdd(draft);
  }

  async function setStatus(id: string, status: BookingStatus): Promise<void> {
    if (userId) {
      try {
        await updateBookingStatus(id, status);
        await qc.invalidateQueries({ queryKey: ['bookings', userId] });
        localSetStatus(id, status); // mirror for offline use
        return;
      } catch (err) {
        if (import.meta.env.DEV) console.warn('[bookings] status update fell back to local:', err);
        localSetStatus(id, status);
        return;
      }
    }
    localSetStatus(id, status);
  }

  async function removeDraft(id: string): Promise<void> {
    if (userId) {
      try {
        await deleteBooking(id);
        await qc.invalidateQueries({ queryKey: ['bookings', userId] });
      } catch (err) {
        if (import.meta.env.DEV) console.warn('[bookings] delete fell back to local:', err);
      }
    }
    localRemove(id);
  }

  return {
    drafts,
    addDraft,
    removeDraft,
    setStatus,
    isLoading: !!userId && query.isLoading,
  };
}
