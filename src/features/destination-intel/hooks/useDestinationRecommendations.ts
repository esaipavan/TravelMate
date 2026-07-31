import { useQuery } from '@tanstack/react-query';
import { differenceInDays, parseISO } from 'date-fns';
import { chatWithAI } from '@/services/ai/ai.service';
import type { TripRow } from '@/features/trips/types';
import type { DestinationOverview } from '../types';

export interface AIRecommendation {
  emoji: string;
  title: string;
  description: string;
  bestFor: string;
  category: 'experience' | 'food' | 'culture' | 'nature' | 'budget' | 'adventure';
}

function buildPrompt(trip: TripRow, overview: DestinationOverview): string {
  const tripDays =
    differenceInDays(
      parseISO(trip.end_date + 'T00:00:00'),
      parseISO(trip.start_date + 'T00:00:00'),
    ) + 1;
  const budget = trip.total_budget ? `${trip.total_budget} ${trip.currency}` : 'flexible budget';

  return `Destination: ${overview.destination}, ${overview.country}
Trip duration: ${tripDays} days (${trip.start_date} to ${trip.end_date})
Budget: ${budget}
Best season info: ${overview.bestSeason}
Travel styles: ${overview.travelStyles.join(', ')}
${overview.visaInfo ? `Visa: ${overview.visaInfo}` : ''}

Generate 6 specific, actionable travel recommendations tailored to this exact trip. Mix hidden gems, local food experiences, cultural insights, and practical advice based on duration and budget.`;
}

function parseResponse(content: string): AIRecommendation[] {
  const cleaned = content.trim();
  const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
  const json = jsonMatch ? jsonMatch[1] : cleaned;

  const parsed = JSON.parse(json) as unknown;
  if (!Array.isArray(parsed)) throw new Error('Expected JSON array');

  const VALID_CATEGORIES = new Set([
    'experience',
    'food',
    'culture',
    'nature',
    'budget',
    'adventure',
  ]);

  return (parsed as Record<string, unknown>[]).slice(0, 6).map((item) => ({
    emoji: typeof item.emoji === 'string' ? item.emoji : '✨',
    title: typeof item.title === 'string' ? item.title : 'Recommendation',
    description: typeof item.description === 'string' ? item.description : '',
    bestFor: typeof item.bestFor === 'string' ? item.bestFor : '',
    category:
      typeof item.category === 'string' && VALID_CATEGORIES.has(item.category)
        ? (item.category as AIRecommendation['category'])
        : 'experience',
  }));
}

export function useDestinationRecommendations(trip: TripRow, overview: DestinationOverview) {
  return useQuery<AIRecommendation[], Error>({
    queryKey: ['destination-recommendations', trip.id, trip.destination],
    queryFn: async () => {
      const response = await chatWithAI([
        {
          role: 'system',
          content:
            'You are a travel expert. Return ONLY a valid JSON array of exactly 6 recommendations — no markdown, no text before or after. Schema: [{ "emoji": string, "title": string, "description": string (max 110 chars), "bestFor": string (max 35 chars), "category": "experience"|"food"|"culture"|"nature"|"budget"|"adventure" }]',
        },
        {
          role: 'user',
          content: buildPrompt(trip, overview),
        },
      ]);
      return parseResponse(response.content);
    },
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 1,
    throwOnError: false,
  });
}
