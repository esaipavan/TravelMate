import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useWeather } from '@/features/weather/hooks/useWeather';
import { useItineraryData } from '@/features/itinerary/hooks/useItinerary';
import { chatWithAI } from '@/services/ai/ai.service';
import { buildItineraryOptimizerPrompt } from '../services/concierge.prompts';
import type { TripRow } from '@/features/trips/types';
import type { ItineraryDay } from '@/features/itinerary/types';

export interface OptimizationResult {
  suggestions: string[];
  warnings: string[];
  reorderHint: string | null;
}

export interface ItineraryOptimizerData {
  days: ItineraryDay[];
  selectedDayIndex: number;
  setSelectedDayIndex: (i: number) => void;
  optimize: () => void;
  result: OptimizationResult | null;
  isOptimizing: boolean;
  isLoading: boolean;
}

export function useItineraryOptimizer(trip: TripRow | null): ItineraryOptimizerData {
  const { data: itineraryData, isLoading } = useItineraryData(trip?.id ?? '');
  const { data: weather } = useWeather(trip?.destination ?? '');

  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  const {
    mutate,
    data: result,
    isPending: isOptimizing,
  } = useMutation<OptimizationResult, Error, void>({
    mutationFn: async () => {
      if (!trip || !itineraryData) throw new Error('No trip data');
      const days = itineraryData.days;
      const day = days[selectedDayIndex];
      if (!day) throw new Error('Day not found');
      const messages = buildItineraryOptimizerPrompt(trip, day, weather ?? null);
      const res = await chatWithAI(messages);
      const match = res.content.match(/\{[\s\S]*\}/);
      if (!match) return { suggestions: [], warnings: [], reorderHint: null };
      const parsed = JSON.parse(match[0]) as Record<string, unknown>;
      return {
        suggestions: Array.isArray(parsed.suggestions)
          ? (parsed.suggestions as unknown[]).filter((s): s is string => typeof s === 'string')
          : [],
        warnings: Array.isArray(parsed.warnings)
          ? (parsed.warnings as unknown[]).filter((s): s is string => typeof s === 'string')
          : [],
        reorderHint:
          typeof parsed.reorderHint === 'string' && parsed.reorderHint !== 'null'
            ? parsed.reorderHint
            : null,
      };
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return {
    days: itineraryData?.days ?? [],
    selectedDayIndex,
    setSelectedDayIndex,
    optimize: () => mutate(),
    result: result ?? null,
    isOptimizing,
    isLoading,
  };
}
