import { useQuery } from '@tanstack/react-query';
import { getActivityFeed } from '../services/activity.service';

export function useActivityFeed(tripId: string, limit = 30) {
  return useQuery({
    queryKey: ['trip-activity', tripId, limit],
    queryFn: () => getActivityFeed(tripId, limit),
    staleTime: 2 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 1,
    enabled: !!tripId,
  });
}
