import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useWeather } from '@/features/weather/hooks/useWeather';
import { useItineraryData } from '@/features/itinerary/hooks/useItinerary';
import { useExpenseData } from '@/features/expenses/hooks/useExpenses';
import { useReminders } from '@/features/reminders/hooks/useReminders';
import { chatWithAI } from '@/services/ai/ai.service';
import { formatDate } from '@/utils/formatters';
import type { TripRow } from '@/features/trips/types';
import type { WeatherResult } from '@/features/weather/types';
import type { ItineraryItemRow } from '@/features/itinerary/types';
import type { ReminderRow } from '@/features/reminders/types';
import type { BudgetAnalysis } from '../types';
import { buildMorningBriefPrompt } from '../services/concierge.prompts';
import { computeTripInsight, computeBudgetAnalysis } from '../services/recommendation.engine';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export interface MorningBriefData {
  greeting: string;
  formattedDate: string;
  weather: WeatherResult | null;
  todayItems: ItineraryItemRow[];
  dayNumber: number | null;
  totalDays: number;
  budgetAnalysis: BudgetAnalysis | null;
  todayReminders: ReminderRow[];
  aiSummary: string | null;
  isAILoading: boolean;
  isAIError: boolean;
  refetchAI: () => void;
  isLoading: boolean;
}

export function useMorningBrief(trip: TripRow | null): MorningBriefData {
  const TODAY = new Date().toISOString().split('T')[0];
  const destination = trip?.destination ?? '';
  const tripId = trip?.id ?? '';

  const { data: weather, isLoading: weatherLoading } = useWeather(destination);
  const { data: itineraryData, isLoading: itinLoading } = useItineraryData(tripId);
  const { data: expenseData, isLoading: expenseLoading } = useExpenseData(tripId);
  const { data: allReminders = [], isLoading: remindersLoading } = useReminders();

  const insight = useMemo(() => (trip ? computeTripInsight(trip, TODAY) : null), [trip, TODAY]);

  const budgetAnalysis = useMemo(
    () => (trip && insight ? computeBudgetAnalysis(trip, expenseData ?? null, insight) : null),
    [trip, expenseData, insight],
  );

  const todayItems = useMemo((): ItineraryItemRow[] => {
    if (!itineraryData) return [];
    const todayDay = itineraryData.days.find((d) => d.date === TODAY);
    return todayDay?.items ?? [];
  }, [itineraryData, TODAY]);

  const todayReminders = useMemo((): ReminderRow[] => {
    if (!trip) return [];
    return allReminders.filter(
      (r) =>
        r.status !== 'completed' &&
        (r.trip_id === trip.id || r.trip_id === null) &&
        r.reminder_date <= TODAY,
    );
  }, [allReminders, trip, TODAY]);

  const aiEnabled = !!trip && !!weather && !weatherLoading && !itinLoading;

  // Stable, primitive signals for the exact prompt inputs that aren't already
  // in the key (see buildMorningBriefPrompt) — a plain object/array reference
  // would change every render and defeat caching, so each is reduced to a
  // short derived string that only changes when the content it represents
  // actually changes.
  const weatherKey = weather
    ? `${weather.current.weathercode}-${Math.round(weather.current.temperature)}-${Math.round(weather.current.feelsLike)}`
    : 'no-weather';
  const scheduleKey = todayItems
    .map((i) => i.title)
    .slice(0, 5)
    .join('|');
  const budgetKey = budgetAnalysis
    ? `${Math.round(budgetAnalysis.percentUsed)}-${budgetAnalysis.status}`
    : 'no-budget';

  const {
    data: aiSummary,
    isLoading: isAILoading,
    isError: isAIError,
    refetch: refetchAI,
  } = useQuery<string | null, Error>({
    queryKey: ['ai-morning-brief', tripId, TODAY, destination, weatherKey, scheduleKey, budgetKey],
    queryFn: async () => {
      if (!trip || !weather) return null;
      const itemTitles = todayItems.map((i) => i.title);
      const messages = buildMorningBriefPrompt(trip, weather, itemTitles, budgetAnalysis, TODAY);
      const res = await chatWithAI(messages);
      return res.content;
    },
    enabled: aiEnabled,
    staleTime: 12 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: 1,
  });

  return {
    greeting: getGreeting(),
    formattedDate: formatDate(TODAY, 'EEEE, MMMM d'),
    weather: weather ?? null,
    todayItems,
    dayNumber: insight?.isActive ? insight.daysIntoTrip + 1 : null,
    totalDays: insight?.daysTotal ?? 0,
    budgetAnalysis,
    todayReminders,
    aiSummary: aiSummary ?? null,
    isAILoading,
    isAIError,
    refetchAI: () => void refetchAI(),
    isLoading: weatherLoading || itinLoading || expenseLoading || remindersLoading,
  };
}
