import { useQuery } from '@tanstack/react-query';
import { fetchDestinationIntel } from '../services/destination.service';
import type { DestinationData } from '../types';

export function useDestinationData(destination: string | null | undefined) {
  return useQuery<DestinationData, Error>({
    queryKey: ['destination-intel', destination ?? ''] as const,
    queryFn: () => fetchDestinationIntel(destination!),
    enabled: !!destination?.trim(),
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
}
