import { useQuery } from '@tanstack/react-query';
import { searchLocalRides } from '../services/local.provider';
import type { LocalRide, LocalSearchParams } from '../types';

/** Local-ride search over the (currently mock) provider, cached per query. */
export function useLocalSearch(params: LocalSearchParams | null) {
  const pickup = params?.pickup.trim() ?? '';
  const dropoff = params?.dropoff.trim() ?? '';

  return useQuery<LocalRide[], Error>({
    queryKey: [
      'local',
      pickup.toLowerCase(),
      dropoff.toLowerCase(),
      params?.dateTime ?? '',
      params?.vehicle ?? 'sedan',
      params?.currency ?? 'INR',
    ],
    queryFn: () => searchLocalRides(params!),
    enabled: pickup.length > 0 && dropoff.length > 0,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}
