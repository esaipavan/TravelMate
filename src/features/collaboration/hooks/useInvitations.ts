import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getInvitations, createInvitation, cancelInvitation } from '../services/invitation.service';
import type { TripMemberRole } from '../types';

export function useInvitations(tripId: string) {
  return useQuery({
    queryKey: ['trip-invitations', tripId],
    queryFn: () => getInvitations(tripId),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
    enabled: !!tripId,
  });
}

export function useCreateInvitation(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      email,
      role,
      invitedBy,
    }: {
      email: string;
      role: TripMemberRole;
      invitedBy: string;
    }) => createInvitation(tripId, email, role, invitedBy),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['trip-invitations', tripId] });
      toast.success('Invitation sent');
    },
    onError: (err: Error) => {
      const msg = err.message.includes('unique')
        ? 'A pending invitation already exists for this email'
        : err.message;
      toast.error(msg);
    },
  });
}

export function useCancelInvitation(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) => cancelInvitation(invitationId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['trip-invitations', tripId] });
      toast.success('Invitation cancelled');
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}
