import { useQuery } from '@tanstack/react-query';
import { usePublicBookings } from '@/features/hotels/hooks/usePublicBookings';
import { getPublicTripById } from '../services/trips.service';

/**
 * Data for the public, read-only itinerary page. Composes the public trip fetch
 * (only resolves when the trip is is_public) with its public bookings. No auth
 * required; private trips resolve as `notFound`.
 */
export function usePublicTrip(id: string | undefined) {
  const tripQuery = useQuery({
    queryKey: ['public-trip', id],
    queryFn: () => getPublicTripById(id!),
    enabled: !!id,
    retry: 0,
    staleTime: 5 * 60 * 1000,
  });

  const trip = tripQuery.data ?? null;
  const bookingsQuery = usePublicBookings(id, !!trip);

  return {
    trip,
    bookings: bookingsQuery.data ?? [],
    isLoading: tripQuery.isLoading || (!!trip && bookingsQuery.isLoading),
    notFound: tripQuery.isSuccess && !trip,
    isError: tripQuery.isError,
  };
}
