import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { getEffectiveRole } from '../services/collaboration.service';
import type { EffectiveRole } from '../types';

export function useTripRole(tripId: string): {
  role: EffectiveRole;
  isOwner: boolean;
  canEdit: boolean;
  isLoading: boolean;
} {
  const userId = useAuthStore((s) => s.user?.id);

  const { data: role = null, isLoading } = useQuery({
    queryKey: ['trip-role', tripId, userId],
    queryFn: () => getEffectiveRole(tripId),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
    enabled: !!tripId && !!userId,
    select: (r) => (r as EffectiveRole) ?? null,
  });

  return {
    role,
    isOwner: role === 'owner',
    canEdit: role === 'owner' || role === 'editor',
    isLoading,
  };
}
