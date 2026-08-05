import { useQuery } from '@tanstack/react-query';
import { useTrips, useTrip } from '@/features/trips/hooks/useTrips';
import { useExpenseData } from '@/features/expenses/hooks/useExpenses';
import { useDestinationData } from '@/features/destination-intel/hooks/useDestinationData';
import { buildCompanionData } from '../services/companion.service';
import type { CompanionData } from '../services/companion.service';

export function useTripList() {
  return useTrips();
}

export function useCompanion(tripId: string | null) {
  const { data: trip, isLoading: tripLoading } = useTrip(tripId ?? '');
  const { data: expenseData, isLoading: expenseLoading } = useExpenseData(tripId ?? '');
  const { data: intel, isLoading: intelLoading } = useDestinationData(trip?.destination);

  const allReady = !!tripId && !!trip && !tripLoading && !expenseLoading && !intelLoading;

  const expenseCount = expenseData?.expenses.length ?? 0;

  return useQuery<CompanionData, Error>({
    queryKey: ['companion', tripId, !!intel, expenseCount],
    queryFn: () =>
      buildCompanionData(
        trip!,
        expenseData ?? null,
        intel ?? null,
        new Date().toISOString().split('T')[0],
      ),
    enabled: allReady,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}
