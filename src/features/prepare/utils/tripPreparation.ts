import { formatCurrency } from '@/utils/formatters';
import type { TripBriefStatus } from '@/services/ai/ai.types';

// Single source of truth for "how prepared is this trip" — every field here
// is a fact read straight from persisted data (trips.total_budget,
// packing_items, travel_documents, itinerary_items, trip_briefs.status).
// Nothing here is AI-derived, invented, or weighted — each category is a
// plain complete/incomplete based on something that actually exists.

export type PreparationCategoryKey = 'budget' | 'packing' | 'documents' | 'itinerary' | 'guide';
export type PreparationStatus = 'complete' | 'incomplete';

export interface PreparationCategory {
  key: PreparationCategoryKey;
  label: string;
  status: PreparationStatus;
  detail: string;
  /** Real route for this category — always present, regardless of status,
   * so a completed category can still be reviewed/edited, not just the one
   * currently "next." */
  href: string;
}

export interface NextAction {
  label: string;
  href: string;
}

export interface TripPreparation {
  tripId: string;
  categories: PreparationCategory[];
  completedCount: number;
  totalCount: number;
  /** True only when every category above is genuinely complete — never
   * inferred from a percentage or partial state. */
  allComplete: boolean;
  nextAction: NextAction;
}

export interface TripPreparationInput {
  tripId: string;
  totalBudget: number | null;
  currency: string;
  /** Real packing_items rows for this trip — not AI suggestions. */
  packingItems: { is_packed: boolean }[];
  /** Count of real travel_documents rows for this trip — never suggestions. */
  documentsCount: number;
  /** True only if at least one real itinerary_items row exists. itinerary_days
   * rows are auto-scaffolded (one per trip day) the moment anyone opens the
   * itinerary, so day existence alone is not a signal — only items count. */
  hasItineraryItems: boolean;
  /** null = no trip_briefs row exists yet for this trip at all. */
  guideStatus: TripBriefStatus | null;
}

export function getTripPreparation(input: TripPreparationInput): TripPreparation {
  const {
    tripId,
    totalBudget,
    currency,
    packingItems,
    documentsCount,
    hasItineraryItems,
    guideStatus,
  } = input;

  const hasBudget = !!totalBudget && totalBudget > 0;
  const hasPacking = packingItems.length > 0;
  const packedCount = packingItems.filter((i) => i.is_packed).length;
  const hasDocuments = documentsCount > 0;
  const hasGuide = guideStatus === 'complete';

  const categories: PreparationCategory[] = [
    {
      key: 'budget',
      label: 'Budget',
      status: hasBudget ? 'complete' : 'incomplete',
      detail: hasBudget ? `${formatCurrency(totalBudget, currency)} added` : 'Not set yet',
      href: `/trips/${tripId}/budget`,
    },
    {
      key: 'packing',
      label: 'Packing',
      status: hasPacking ? 'complete' : 'incomplete',
      detail: hasPacking
        ? `${packedCount} of ${packingItems.length} packed`
        : "Your packing list hasn't been created yet",
      href: `/trips/${tripId}/prepare#packing`,
    },
    {
      key: 'documents',
      label: 'Documents',
      status: hasDocuments ? 'complete' : 'incomplete',
      detail: hasDocuments
        ? `${documentsCount} document${documentsCount !== 1 ? 's' : ''} added`
        : 'Add the documents you need',
      href: `/trips/${tripId}/prepare#documents`,
    },
    {
      key: 'itinerary',
      label: 'Itinerary',
      status: hasItineraryItems ? 'complete' : 'incomplete',
      detail: hasItineraryItems ? 'Itinerary started' : 'Review your itinerary',
      href: `/trips/${tripId}/itinerary`,
    },
    {
      key: 'guide',
      label: 'Trip Guide',
      status: hasGuide ? 'complete' : 'incomplete',
      detail: hasGuide
        ? 'Ready to review'
        : guideStatus === 'failed'
          ? 'Generation failed — you can try again'
          : guideStatus === 'generating'
            ? 'Generating…'
            : 'Not generated yet',
      href: `/trips/${tripId}/prepare#guide`,
    },
  ];

  const completedCount = categories.filter((c) => c.status === 'complete').length;
  const allComplete = completedCount === categories.length;

  // Always the first genuinely incomplete category, in priority order — this
  // loop and the `categories` array above are the same 5, so "next action"
  // can never point at something already complete.
  const firstIncomplete = categories.find((c) => c.status === 'incomplete');

  const nextAction: NextAction = firstIncomplete
    ? {
        label:
          firstIncomplete.key === 'budget'
            ? 'Set your trip budget'
            : firstIncomplete.key === 'packing'
              ? 'Prepare your packing list'
              : firstIncomplete.key === 'documents'
                ? 'Review your travel documents'
                : firstIncomplete.key === 'itinerary'
                  ? 'Review your itinerary'
                  : 'Generate your trip guide',
        href: firstIncomplete.href,
      }
    : { label: 'Trip preparation complete', href: `/trips/${tripId}` };

  return {
    tripId,
    categories,
    completedCount,
    totalCount: categories.length,
    allComplete,
    nextAction,
  };
}
