import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getItineraryData,
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
