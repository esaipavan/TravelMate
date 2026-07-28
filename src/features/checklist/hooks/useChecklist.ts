import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getChecklistData,
  createItem,
  updateItem,
  deleteItem,
  togglePacked,
} from '../services/checklist.service';
import type { PackingItemInsert, PackingItemUpdate } from '../types';

function invalidate(qc: ReturnType<typeof useQueryClient>, tripId: string) {
  void qc.invalidateQueries({ queryKey: ['checklist', tripId] });
  void qc.invalidateQueries({ queryKey: ['dashboard'] });
}

export function useChecklistData(tripId: string) {
  return useQuery({
    queryKey: ['checklist', tripId],
    queryFn: () => getChecklistData(tripId),
    staleTime: 3 * 60 * 1000,
    enabled: !!tripId,
  });
}

export function useCreatePackingItem(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PackingItemInsert) => createItem(data),
    onSuccess: () => invalidate(qc, tripId),
  });
}

export function useUpdatePackingItem(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PackingItemUpdate }) => updateItem(id, data),
    onSuccess: () => invalidate(qc, tripId),
  });
}

export function useDeletePackingItem(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteItem(id),
    onSuccess: () => invalidate(qc, tripId),
  });
}

export function useTogglePacked(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, is_packed }: { id: string; is_packed: boolean }) =>
      togglePacked(id, is_packed),
    onSuccess: () => invalidate(qc, tripId),
  });
}
