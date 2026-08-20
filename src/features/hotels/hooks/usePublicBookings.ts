import { useQuery } from '@tanstack/react-query';
import { listPublicBookings } from '../services/bookings.service';
import type { BookingDraft } from '../types';

/**
 * Read-only bookings for a PUBLIC trip's shared itinerary. Server-only (no local
 * fallback) — a public viewer sees exactly what the owner has synced, and RLS
 * ensures only bookings on a public trip are returned. `enabled` is gated so it
 * doesn't fire until we know the trip id.
 */
export function usePublicBookings(tripId: string | undefined, enabled = true) {
  return useQuery<BookingDraft[], Error>({
    queryKey: ['public-bookings', tripId],
    queryFn: () => listPublicBookings(tripId!),
    enabled: !!tripId && enabled,
    retry: 0,
    staleTime: 5 * 60 * 1000,
  });
}
