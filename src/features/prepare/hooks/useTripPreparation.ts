import { useChecklistData } from '@/features/checklist/hooks/useChecklist';
import { useDocuments } from '@/features/documents/hooks/useDocuments';
import { useHasItineraryItems } from '@/features/itinerary/hooks/useItinerary';
import { useTripBrief } from '@/features/dashboard/hooks/useTripBrief';
import { getTripPreparation } from '../utils/tripPreparation';
import type { TripPreparation } from '../utils/tripPreparation';

interface TripLike {
  id: string;
  total_budget: number | null;
  currency: string;
}

interface UseTripPreparationResult {
  preparation: TripPreparation | null;
  isLoading: boolean;
}

/**
 * The one place every screen (dashboard Next Action, Prepare Trip page)
 * pulls trip-preparation state from — keeps Dashboard, NextActionBanner and
 * PrepareTripPage from each computing their own (possibly diverging)
 * version of "what's left to do."
 */
export function useTripPreparation(trip: TripLike | null | undefined): UseTripPreparationResult {
  const tripId = trip?.id ?? '';
  const { data: checklist, isLoading: loadingChecklist } = useChecklistData(tripId);
  const { data: documents, isLoading: loadingDocs } = useDocuments(trip?.id);
  const { data: hasItineraryItems, isLoading: loadingItinerary } = useHasItineraryItems(tripId);
  const { brief, isLoading: loadingBrief } = useTripBrief(trip?.id ?? null);

  if (!trip) return { preparation: null, isLoading: false };

  const isLoading = loadingChecklist || loadingDocs || loadingItinerary || loadingBrief;
  if (isLoading) return { preparation: null, isLoading: true };

  const preparation = getTripPreparation({
    tripId: trip.id,
    totalBudget: trip.total_budget,
    currency: trip.currency,
    packingItems: checklist?.items ?? [],
    documentsCount: documents?.length ?? 0,
    hasItineraryItems: hasItineraryItems ?? false,
    guideStatus: brief?.status ?? null,
  });

  return { preparation, isLoading: false };
}
