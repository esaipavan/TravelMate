import { useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useJournalEntries } from '@/features/journal/hooks/useJournal';
import { useItineraryData } from '@/features/itinerary/hooks/useItinerary';
import { useExpenseData } from '@/features/expenses/hooks/useExpenses';
import { chatWithAI } from '@/services/ai/ai.service';
import { buildAIJournalPrompt } from '../services/concierge.prompts';
import type { TripRow } from '@/features/trips/types';
import type { JournalEntryRow } from '@/features/journal/types';

export interface AIJournalData {
  entries: JournalEntryRow[];
  narrative: string | null;
  generateNarrative: () => void;
  isGenerating: boolean;
  isLoading: boolean;
}

export function useAIJournal(trip: TripRow | null): AIJournalData {
  const tripId = trip?.id ?? '';

  const { data: entries = [], isLoading: journalLoading } = useJournalEntries(tripId);
  const { data: itineraryData, isLoading: itinLoading } = useItineraryData(tripId);
  const { data: expenseData, isLoading: expenseLoading } = useExpenseData(tripId);

  const placesVisited = useMemo(
    () =>
      itineraryData?.days
        .flatMap((d) => d.items.map((i) => i.location_name))
        .filter((l): l is string => !!l) ?? [],
    [itineraryData],
  );

  const totalSpent = useMemo(
    () => expenseData?.expenses.reduce((s, e) => s + e.amount, 0) ?? 0,
    [expenseData],
  );

  const currency = expenseData?.tripCurrency ?? trip?.currency ?? 'USD';

  const {
    mutate,
    data: narrative,
    isPending: isGenerating,
  } = useMutation<string, Error, void>({
    mutationFn: async () => {
      if (!trip) throw new Error('No trip');
      const messages = buildAIJournalPrompt(trip, entries, placesVisited, totalSpent, currency);
      const res = await chatWithAI(messages);
      return res.content;
    },
  });

  return {
    entries,
    narrative: narrative ?? null,
    generateNarrative: () => mutate(),
    isGenerating,
    isLoading: journalLoading || itinLoading || expenseLoading,
  };
}
