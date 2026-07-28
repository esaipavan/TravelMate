import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import {
  getTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
  duplicateTrip,
  toggleFavourite,
} from '../services/trips.service';
import type { TripInsert, TripRow, TripUpdate } from '../types';

const STALE = 5 * 60 * 1000;

export function useTrips() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: ['trips', userId],
    queryFn: () => getTrips(userId!),
    enabled: !!userId,
    staleTime: STALE,
  });
}

export function useTrip(id: string) {
  return useQuery({
    queryKey: ['trip', id],
    queryFn: () => getTripById(id),
    enabled: !!id,
    staleTime: STALE,
  });
}

export function useCreateTrip() {
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  return useMutation({
    mutationFn: (data: TripInsert) => createTrip(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['trips', userId] });
      void qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateTrip() {
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TripUpdate }) => updateTrip(id, data),
    onSuccess: (_result, { id }) => {
      void qc.invalidateQueries({ queryKey: ['trip', id] });
      void qc.invalidateQueries({ queryKey: ['trips', userId] });
      void qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteTrip() {
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  return useMutation({
    mutationFn: (id: string) => deleteTrip(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['trips', userId] });
      void qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDuplicateTrip() {
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  return useMutation({
    mutationFn: (trip: TripRow) => duplicateTrip(trip),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['trips', userId] });
      void qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useToggleFavourite() {
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  return useMutation({
    mutationFn: ({ id, isFavourite }: { id: string; isFavourite: boolean }) =>
      toggleFavourite(id, isFavourite),
    onSuccess: (_result, { id }) => {
      void qc.invalidateQueries({ queryKey: ['trip', id] });
      void qc.invalidateQueries({ queryKey: ['trips', userId] });
    },
  });
}
