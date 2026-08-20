import { useQuery } from '@tanstack/react-query';
import { searchFlights } from '../services/flights.provider';
import type { Flight, FlightSearchParams } from '../types';

/** Flight search over the (currently mock) provider, cached per query. */
export function useFlightSearch(params: FlightSearchParams | null) {
  const from = params?.from.trim() ?? '';
  const to = params?.to.trim() ?? '';

  return useQuery<Flight[], Error>({
    queryKey: [
      'flights',
      from.toLowerCase(),
      to.toLowerCase(),
      params?.date ?? '',
      params?.cabin ?? 'economy',
      params?.currency ?? 'INR',
    ],
    queryFn: () => searchFlights(params!),
    enabled: from.length > 0 && to.length > 0,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}
