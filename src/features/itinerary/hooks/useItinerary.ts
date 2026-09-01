import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getItineraryData,
  getItineraryDataReadOnly,
  hasItineraryItems,
  createItem,
  updateItem,
  deleteItem,
  reorderItems,
  findPlaceInTrips,
} from '../services/itinerary.service';
import type { ItineraryItemInsert, ItineraryItemUpdate, ItineraryItemRow } from '../types';

function invalidate(qc: ReturnType<typeof useQueryClient>, tripId: string) {
  void qc.invalidateQueries({ queryKey: ['itinerary', tripId] });
  void qc.invalidateQueries({ queryKey: ['dashboard'] });
}

export function useItineraryData(tripId: string) {
  return useQuery({
    queryKey: ['itinerary', tripId],
    queryFn: () => getItineraryData(tripId),
    staleTime: 3 * 60 * 1000,
    enabled: !!tripId,
  });
}

// For a boolean "has this trip got any itinerary items" check only — does not
// scaffold itinerary_days rows the way useItineraryData()/getItineraryData()
// does. Used by trip-preparation state (Dashboard, Prepare) so merely viewing
// those pages never writes to itinerary_days.
export function useHasItineraryItems(tripId: string) {
  return useQuery({
    queryKey: ['itinerary', tripId, 'hasItems'],
    queryFn: () => hasItineraryItems(tripId),
    staleTime: 3 * 60 * 1000,
    enabled: !!tripId,
  });
}

// Read-only counterpart to useItineraryData() — same shape, but never
// scaffolds itinerary_days. For passive display surfaces (e.g. the
// Dashboard's "Today's Plan" widget) that need real day/item content but
// must not write to the database just from being viewed.
export function useItineraryDataReadOnly(tripId: string) {
  return useQuery({
    queryKey: ['itinerary', tripId, 'readOnly'],
    queryFn: () => getItineraryDataReadOnly(tripId),
    staleTime: 3 * 60 * 1000,
    enabled: !!tripId,
  });
}

export function useCreateItem(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ItineraryItemInsert) => createItem(data),
    onSuccess: () => invalidate(qc, tripId),
  });
}

// Not bound to a fixed tripId — the caller (e.g. Explore's "Add to Trip")
// picks the destination trip AND day at call time. Reuses the same
// getItineraryData scaffold + createItem path the manual Itinerary UI uses.
// Does not create any new table or duplicate the itinerary write path.
export function useAddPlaceToTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      tripId,
      dayId,
      item,
    }: {
      tripId: string;
      dayId: string;
      item: Omit<ItineraryItemInsert, 'day_id' | 'order_index'>;
    }): Promise<ItineraryItemRow> => {
      const data = await getItineraryData(tripId);
      const day = data.days.find((d) => d.id === dayId);
      if (!day) {
        throw new Error('Selected day could not be found — it may have been removed.');
      }
      return createItem({ ...item, day_id: day.id, order_index: day.items.length });
    },
    onSuccess: (_row, { tripId }) => {
      void qc.invalidateQueries({ queryKey: ['itinerary', tripId] });
      void qc.invalidateQueries({ queryKey: ['dashboard'] });
      // Prefix-invalidate every place-placements query, not just this one
      // place's — cheap (it's just a refetch of whatever's mounted) and
      // guarantees the "Already added to..." badge and duplicate warning
      // update immediately instead of waiting out their staleTime.
      void qc.invalidateQueries({ queryKey: ['place-placements'] });
    },
  });
}

// Cross-trip "is this place already in one of my trips?" lookup — powers the
// Add-to-Trip duplicate warning and the place-detail "Already added to..."
// context (see itinerary.service.ts::findPlaceInTrips for the matching
// rules). Only enabled when a place with real coordinates is passed and the
// caller opts in (callers gate this on dialog-open so it never fires on
// every place card render).
export function usePlaceTripPlacements(
  place: { lat: number; lon: number } | null | undefined,
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: ['place-placements', place?.lat, place?.lon],
    queryFn: () => findPlaceInTrips(place!.lat, place!.lon),
    enabled: !!place && (options.enabled ?? true),
    staleTime: 60 * 1000,
  });
}

export function useUpdateItem(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ItineraryItemUpdate }) => updateItem(id, data),
    onSuccess: () => invalidate(qc, tripId),
  });
}

export function useDeleteItem(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteItem(id),
    onSuccess: () => invalidate(qc, tripId),
  });
}

export function useReorderItems(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (updates: { id: string; order_index: number }[]) => reorderItems(updates),
    onSuccess: () => invalidate(qc, tripId),
    // A partial failure (e.g. network drop mid-batch) previously failed
    // silently — the optimistic local order stayed on screen with no
    // indication the DB might now disagree. Surfacing the error and
    // refetching lets the user see the real persisted order.
    onError: () => {
      toast.error('Failed to save the new order. Refreshing…');
      void invalidate(qc, tripId);
    },
  });
}
