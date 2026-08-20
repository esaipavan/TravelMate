import { useQuery } from '@tanstack/react-query';
import { searchHotels } from '../services/hotels.provider';
import type { Hotel, HotelSearchParams } from '../types';

/**
 * Hotel search over the (currently mock) provider. Keyed by the search inputs
 * so results are cached per query; only runs once a destination is submitted.
 */
export function useHotelSearch(params: HotelSearchParams | null) {
  const destination = params?.destination.trim() ?? '';

  return useQuery<Hotel[], Error>({
    queryKey: [
      'hotels',
      destination.toLowerCase(),
      params?.currency ?? 'INR',
      params?.checkIn ?? '',
      params?.checkOut ?? '',
      params?.guests ?? 1,
    ],
    queryFn: () => searchHotels(params!),
    enabled: destination.length > 0,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}
