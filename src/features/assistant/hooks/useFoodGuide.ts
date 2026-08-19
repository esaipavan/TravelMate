import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNearbyPlaces } from '@/features/nearby/hooks/useNearby';
import { useDestinationData } from '@/features/destination-intel/hooks/useDestinationData';
import { chatWithAI } from '@/services/ai/ai.service';
import { buildFoodGuidePrompt } from '../services/concierge.prompts';
import type { TripRow } from '@/features/trips/types';
import type { NearbyPlace } from '@/features/nearby/types';
import type { FoodGuide } from '@/features/destination-intel/types';

export type MealTime = 'breakfast' | 'lunch' | 'dinner';

export interface FoodSuggestion {
  name: string;
  type: string;
  description: string;
  emoji: string;
  priceRange: string;
  tip: string;
}

export interface FoodGuideData {
  restaurants: NearbyPlace[];
  foodIntel: FoodGuide | null;
  suggestions: FoodSuggestion[];
  mealTime: MealTime;
  setMealTime: (m: MealTime) => void;
  isLoading: boolean;
  isAILoading: boolean;
  isAIError: boolean;
  refetchAI: () => void;
}

function getDefaultMealTime(): MealTime {
  const hour = new Date().getHours();
  if (hour < 10) return 'breakfast';
  if (hour < 15) return 'lunch';
  return 'dinner';
}

// Module-level (per trip), not component state — Radix unmounts inactive
// TabsContent, which would otherwise reset a manually-picked meal time back
// to the current-hour default every time the user leaves and returns to the
// Eat tab. Keyed by tripId so switching between trips doesn't leak one
// trip's selection into another's.
const lastMealTimeByTrip = new Map<string, MealTime>();

function isFoodSuggestion(x: unknown): x is FoodSuggestion {
  return (
    typeof x === 'object' &&
    x !== null &&
    typeof (x as Record<string, unknown>).name === 'string' &&
    typeof (x as Record<string, unknown>).description === 'string'
  );
}

export function useFoodGuide(trip: TripRow | null): FoodGuideData {
  const destination = trip?.destination ?? '';
  const tripId = trip?.id ?? '';

  const [mealTime, setMealTimeState] = useState<MealTime>(
    () => lastMealTimeByTrip.get(tripId) ?? getDefaultMealTime(),
  );

  function setMealTime(m: MealTime) {
    if (tripId) lastMealTimeByTrip.set(tripId, m);
    setMealTimeState(m);
  }

  const { data: nearbyResult, isLoading: nearbyLoading } = useNearbyPlaces(destination);
  const { data: intel, isLoading: intelLoading } = useDestinationData(destination);

  const restaurants = nearbyResult?.places.filter((p) => p.category === 'restaurants') ?? [];

  const aiEnabled = !!trip && !nearbyLoading && !intelLoading;

  const {
    data: rawSuggestions,
    isLoading: isAILoading,
    isError: isAIError,
    refetch: refetchAI,
  } = useQuery<FoodSuggestion[], Error>({
    queryKey: ['ai-food-guide', destination, mealTime],
    queryFn: async () => {
      const messages = buildFoodGuidePrompt(destination, restaurants, intel ?? null, mealTime);
      const res = await chatWithAI(messages);
      try {
        const match = res.content.match(/\[[\s\S]*\]/);
        if (!match) throw new Error('AI response did not contain the expected JSON array.');
        const parsed = JSON.parse(match[0]) as unknown[];
        return parsed.filter(isFoodSuggestion).map((s) => ({
          name: s.name,
          type: s.type ?? 'local_dish',
          description: s.description,
          emoji: s.emoji ?? '🍽️',
          priceRange: s.priceRange ?? '$',
          tip: s.tip ?? '',
        }));
      } catch (err) {
        throw err instanceof Error ? err : new Error('Failed to parse AI food suggestions.');
      }
    },
    enabled: aiEnabled,
    staleTime: 4 * 60 * 60 * 1000,
    gcTime: 8 * 60 * 60 * 1000,
    retry: 1,
  });

  return {
    restaurants,
    foodIntel: intel?.food ?? null,
    suggestions: rawSuggestions ?? [],
    mealTime,
    setMealTime,
    isLoading: nearbyLoading || intelLoading,
    isAILoading,
    isAIError,
    refetchAI: () => void refetchAI(),
  };
}
