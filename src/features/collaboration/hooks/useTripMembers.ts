import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getTripMembers, updateMemberRole, removeMember } from '../services/collaboration.service';
import type { TripMemberRole } from '../types';

export function useTripMembers(tripId: string) {
  return useQuery({
    queryKey: ['trip-members', tripId],
    queryFn: () => getTripMembers(tripId),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
    enabled: !!tripId,
  });
}

export function useUpdateMemberRole(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: TripMemberRole }) =>
      updateMemberRole(tripId, userId, role),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['trip-members', tripId] });
      toast.success('Role updated');
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}

export function useRemoveMember(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => removeMember(tripId, userId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['trip-members', tripId] });
      void qc.invalidateQueries({ queryKey: ['trip-activity', tripId] });
      toast.success('Member removed');
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}
