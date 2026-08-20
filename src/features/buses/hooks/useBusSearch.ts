import { useQuery } from '@tanstack/react-query';
import { searchBuses } from '../services/buses.provider';
import type { Bus, BusSearchParams } from '../types';

/** Bus search over the (currently mock) provider, cached per query. */
export function useBusSearch(params: BusSearchParams | null) {
  const from = params?.from.trim() ?? '';
  const to = params?.to.trim() ?? '';

  return useQuery<Bus[], Error>({
    queryKey: [
      'buses',
      from.toLowerCase(),
      to.toLowerCase(),
      params?.date ?? '',
      params?.busClass ?? 'sleeper',
      params?.currency ?? 'INR',
    ],
    queryFn: () => searchBuses(params!),
    enabled: from.length > 0 && to.length > 0,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}
