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
}

function getDefaultMealTime(): MealTime {
  const hour = new Date().getHours();
  if (hour < 10) return 'breakfast';
  if (hour < 15) return 'lunch';
  return 'dinner';
}

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

  const [mealTime, setMealTime] = useState<MealTime>(getDefaultMealTime());

  const { data: nearbyResult, isLoading: nearbyLoading } = useNearbyPlaces(destination);
  const { data: intel, isLoading: intelLoading } = useDestinationData(destination);

  const restaurants = nearbyResult?.places.filter((p) => p.category === 'restaurants') ?? [];

  const aiEnabled = !!trip && !nearbyLoading && !intelLoading;

  const { data: rawSuggestions, isLoading: isAILoading } = useQuery<FoodSuggestion[], Error>({
    queryKey: ['ai-food-guide', destination, mealTime],
    queryFn: async () => {
      const messages = buildFoodGuidePrompt(destination, restaurants, intel ?? null, mealTime);
      const res = await chatWithAI(messages);
      const match = res.content.match(/\[[\s\S]*\]/);
      if (!match) return [];
      const parsed = JSON.parse(match[0]) as unknown[];
      return parsed.filter(isFoodSuggestion).map((s) => ({
        name: s.name,
        type: s.type ?? 'local_dish',
        description: s.description,
        emoji: s.emoji ?? '🍽️',
        priceRange: s.priceRange ?? '$',
        tip: s.tip ?? '',
      }));
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
  };
}
