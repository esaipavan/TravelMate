import type { TripRow } from '@/features/trips/types';
import type { DestinationData } from '@/features/destination-intel/types';
import type { BudgetAnalysis, TripInsight } from '../types';
import type { AIMessage } from '@/services/ai/ai.types';

export function buildCompanionPrompt(
  trip: TripRow,
  intel: DestinationData | null,
  budget: BudgetAnalysis | null,
  insight: TripInsight,
): AIMessage[] {
  const statusLine = insight.isActive
    ? `Currently on this trip (day ${insight.daysIntoTrip + 1} of ${insight.daysTotal}).`
    : insight.isUpcoming
      ? `Trip starts in ${insight.daysUntilTrip} days.`
      : 'Trip has ended.';

  const budgetLine = budget
    ? `Budget: ${budget.currency} ${Math.round(budget.totalBudget).toLocaleString()} total, ${Math.round(budget.percentUsed)}% spent, status: ${budget.status}.`
    : 'No budget data.';

  const weatherLine = intel?.weather
    ? `Current: ${intel.weather.current.condition}, ${intel.weather.current.temp}°C, UV ${intel.weather.current.uvIndex}. Season: ${intel.weather.seasonNote}.`
    : 'No weather data.';

  const safetyLine = intel?.safety ? `Safety rating: ${intel.safety.overallRating}.` : '';

  const systemPrompt = `You are a contextual travel advisor for TravelMate. Provide exactly 3 short, specific, actionable travel tips based on the trip context. Each tip must be genuinely useful and non-generic. Respond ONLY with a valid JSON array in this exact format:
[{"id":"tip1","title":"Short title","body":"Specific actionable tip in 1-2 sentences.","emoji":"single emoji","priority":"medium","category":"experience","dismissible":true}]
Valid categories: weather, budget, packing, timing, safety, experience, alert
Valid priorities: critical, high, medium, low`;

  const userMessage = `Trip context:
Destination: ${trip.destination}
Dates: ${trip.start_date} to ${trip.end_date}
${statusLine}
${budgetLine}
${weatherLine}
${safetyLine}

Give 3 specific, actionable tips relevant to this exact trip context that would genuinely help this traveller.`;

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
  ];
}
