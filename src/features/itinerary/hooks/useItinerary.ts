import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getItineraryData,
  getItineraryDataReadOnly,
  hasItineraryItems,
  createItem,
  updateItem,
  deleteItem,
  reorderItems,
} from '../services/itinerary.service';
import type { ItineraryItemInsert, ItineraryItemUpdate } from '../types';

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
  });
}
