import { useQuery } from '@tanstack/react-query';
import { searchTrains } from '../services/trains.provider';
import type { Train, TrainSearchParams } from '../types';

/** Train search over the (currently mock) provider, cached per query. */
export function useTrainSearch(params: TrainSearchParams | null) {
  const from = params?.from.trim() ?? '';
  const to = params?.to.trim() ?? '';

  return useQuery<Train[], Error>({
    queryKey: [
      'trains',
      from.toLowerCase(),
      to.toLowerCase(),
      params?.date ?? '',
      params?.travelClass ?? 'ac-3',
      params?.currency ?? 'INR',
    ],
    queryFn: () => searchTrains(params!),
    enabled: from.length > 0 && to.length > 0,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}
