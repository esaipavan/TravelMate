import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useWeather } from '@/features/weather/hooks/useWeather';
import { useDestinationData } from '@/features/destination-intel/hooks/useDestinationData';
import { chatWithAI } from '@/services/ai/ai.service';
import { buildPackingAssistantPrompt } from '../services/concierge.prompts';
import { computePackingAnalysis } from '../services/recommendation.engine';
import { tripDuration } from '@/utils/formatters';
import type { TripRow } from '@/features/trips/types';
import type { PackingAnalysis } from '../types';

export interface PackingSuggestion {
  item: string;
  reason: string;
}

export interface PackingAssistantData {
  packingAnalysis: PackingAnalysis | null;
  mustHave: PackingSuggestion[];
  recommended: PackingSuggestion[];
  leaveHome: string[];
  isLoading: boolean;
  isAILoading: boolean;
}

function isSuggestion(x: unknown): x is PackingSuggestion {
  return (
    typeof x === 'object' && x !== null && typeof (x as Record<string, unknown>).item === 'string'
  );
}

export function usePackingAssistant(trip: TripRow | null): PackingAssistantData {
  const destination = trip?.destination ?? '';

  const { data: weather, isLoading: weatherLoading } = useWeather(destination);
  const { data: intel, isLoading: intelLoading } = useDestinationData(destination);

  const packingAnalysis = useMemo(() => computePackingAnalysis(intel ?? null), [intel]);

  const tripLengthDays = useMemo(
    () => (trip ? tripDuration(trip.start_date, trip.end_date) : 7),
    [trip],
  );

  const aiEnabled = !!trip && !weatherLoading && !intelLoading;

  const { data: aiResult, isLoading: isAILoading } = useQuery<
    {
      mustHave: PackingSuggestion[];
      recommended: PackingSuggestion[];
      leaveHome: string[];
    },
    Error
  >({
    queryKey: ['ai-packing', destination, trip?.start_date, trip?.end_date],
    queryFn: async () => {
      if (!trip) return { mustHave: [], recommended: [], leaveHome: [] };
      const messages = buildPackingAssistantPrompt(
        trip,
        weather ?? null,
        tripLengthDays,
        intel ?? null,
      );
      const res = await chatWithAI(messages);
      const match = res.content.match(/\{[\s\S]*\}/);
      if (!match) return { mustHave: [], recommended: [], leaveHome: [] };
      const parsed = JSON.parse(match[0]) as Record<string, unknown>;

      const toSuggestions = (arr: unknown): PackingSuggestion[] =>
        Array.isArray(arr) ? arr.filter(isSuggestion) : [];

      const leaveHome = Array.isArray(parsed.leaveHome)
        ? (parsed.leaveHome as unknown[]).filter((x): x is string => typeof x === 'string')
        : [];

      return {
        mustHave: toSuggestions(parsed.mustHave),
        recommended: toSuggestions(parsed.recommended),
        leaveHome,
      };
    },
    enabled: aiEnabled,
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 48 * 60 * 60 * 1000,
    retry: 1,
  });

  return {
    packingAnalysis,
    mustHave: aiResult?.mustHave ?? [],
    recommended: aiResult?.recommended ?? [],
    leaveHome: aiResult?.leaveHome ?? [],
    isLoading: weatherLoading || intelLoading,
    isAILoading,
  };
}
