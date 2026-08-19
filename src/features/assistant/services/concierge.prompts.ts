import type { AIMessage } from '@/services/ai/ai.types';
import type { TripRow } from '@/features/trips/types';
import type { WeatherResult } from '@/features/weather/types';
import type { ItineraryDay } from '@/features/itinerary/types';
import type { JournalEntryRow } from '@/features/journal/types';
import type { NearbyPlace } from '@/features/nearby/types';
import type { DestinationData } from '@/features/destination-intel/types';
import type { BudgetAnalysis } from '../types';

function wcLabel(code: number): string {
  if (code === 0) return 'Clear sky';
  if (code <= 2) return 'Partly cloudy';
  if (code <= 3) return 'Overcast';
  if (code <= 48) return 'Foggy';
  if (code <= 55) return 'Drizzle';
  if (code <= 67) return 'Rain';
  if (code <= 77) return 'Snow';
  if (code <= 82) return 'Rain showers';
  return 'Thunderstorm';
}

export function buildMorningBriefPrompt(
  trip: TripRow,
  weather: WeatherResult | null,
  todayItemTitles: string[],
  budget: BudgetAnalysis | null,
  today: string,
): AIMessage[] {
  const weatherStr = weather
    ? `${wcLabel(weather.current.weathercode)}, ${Math.round(weather.current.temperature)}°C, feels like ${Math.round(weather.current.feelsLike)}°C, UV ${weather.current.uvIndex}, wind ${Math.round(weather.current.windspeed)} km/h`
    : 'Weather unavailable';

  const budgetStr = budget
    ? `${Math.round(budget.percentUsed)}% of ${budget.currency} ${Math.round(budget.totalBudget).toLocaleString()} used, ${budget.currency} ${Math.round(budget.remaining).toLocaleString()} remaining (${budget.status})`
    : 'No budget set';

  const scheduleStr =
    todayItemTitles.length > 0
      ? todayItemTitles.slice(0, 5).join(', ')
      : 'No activities scheduled today';

  return [
    {
      role: 'system',
      content:
        'You are a personal travel assistant writing a warm, concise morning briefing. Write 2-3 sentences of engaging prose. No JSON. No markdown. No bullet points. Be specific to the weather and activities, not generic.',
    },
    {
      role: 'user',
      content: `Morning briefing for a traveller in ${trip.destination} on ${today}.
Weather: ${weatherStr}
Today's plan: ${scheduleStr}
Budget: ${budgetStr}

Write a natural morning briefing that mentions the weather impact on today's activities and one practical tip.`,
    },
  ];
}

export function buildBudgetAdvisorPrompt(
  trip: TripRow,
  budget: BudgetAnalysis,
  categoryBreakdown: Record<string, number>,
): AIMessage[] {
  const categoryLines = Object.entries(categoryBreakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([cat, amount]) => `  ${cat}: ${budget.currency} ${Math.round(amount).toLocaleString()}`)
    .join('\n');

  return [
    {
      role: 'system',
      content:
        'You are a travel budget coach. Respond ONLY with a JSON array of exactly 3 practical budget tips. Format: [{"title":"Short title (max 8 words)","body":"Specific actionable tip in 1-2 sentences.","emoji":"single emoji","severity":"info|warning|critical"}]',
    },
    {
      role: 'user',
      content: `Trip to ${trip.destination}. Budget status: ${budget.status}.
Total: ${budget.currency} ${Math.round(budget.totalBudget).toLocaleString()} | Spent: ${Math.round(budget.percentUsed)}% | Remaining: ${budget.currency} ${Math.round(budget.remaining).toLocaleString()} over ${budget.daysRemaining} days
Daily plan: ${budget.currency} ${Math.round(budget.dailyAllowance).toLocaleString()}/day | Actual: ${budget.currency} ${Math.round(budget.dailyActual).toLocaleString()}/day
Projected: ${budget.currency} ${Math.round(budget.projectedTotal).toLocaleString()}

Spending by category:
${categoryLines || '  (no expenses recorded)'}

Give 3 specific, actionable budget tips for this traveller's exact situation.`,
    },
  ];
}

export function buildItineraryOptimizerPrompt(
  trip: TripRow,
  day: ItineraryDay,
  weather: WeatherResult | null,
): AIMessage[] {
  const forecast = weather?.forecast.find((f) => f.date === day.date);
  const weatherNote = forecast
    ? `${wcLabel(forecast.weathercode)}, ${forecast.tempMin}–${forecast.tempMax}°C, UV max ${forecast.uvIndexMax}, ${forecast.precipProbabilityMax}% rain chance`
    : 'Weather data unavailable';

  const sorted = [...day.items].sort((a, b) =>
    (a.start_time ?? '').localeCompare(b.start_time ?? ''),
  );
  const itemsStr =
    sorted.length > 0
      ? sorted
          .map(
            (it) =>
              `${it.start_time ?? 'unscheduled'} | ${it.title} (${it.category})${it.location_name ? ` @ ${it.location_name}` : ''}${it.description ? ` — ${it.description.slice(0, 80)}` : ''}`,
          )
          .join('\n')
      : 'No activities planned for this day';

  return [
    {
      role: 'system',
      content:
        'You are an itinerary optimizer. Respond ONLY with valid JSON: {"suggestions":["tip1","tip2","tip3"],"warnings":["warning if weather/timing issues, else empty"],"reorderHint":"one sentence on optimal order or null if already optimal"}',
    },
    {
      role: 'user',
      content: `Optimize itinerary for ${trip.destination} on ${day.date}.
Weather: ${weatherNote}
Activities:
${itemsStr}

Suggest 3 specific optimization tips (timing, order, weather considerations, travel time). Keep warnings only if genuinely needed.`,
    },
  ];
}

export function buildPackingAssistantPrompt(
  trip: TripRow,
  weather: WeatherResult | null,
  tripLengthDays: number,
  intel: DestinationData | null,
): AIMessage[] {
  const forecastSummary =
    weather?.forecast
      .slice(0, 5)
      .map((f) => `${f.date}: ${wcLabel(f.weathercode)}, ${f.tempMin}–${f.tempMax}°C`)
      .join('; ') ?? 'Weather unavailable';

  const existingLabels =
    intel?.checklist
      .map((i) => i.label)
      .slice(0, 20)
      .join(', ') ?? 'None';
  const safetyRating = intel?.meta?.isFallback ? undefined : intel?.safety.overallRating;
  const safetyNote =
    safetyRating && safetyRating !== 'very-safe' && safetyRating !== 'safe'
      ? `Safety concern level: ${safetyRating}`
      : '';

  return [
    {
      role: 'system',
      content:
        'You are a packing expert. Respond ONLY with valid JSON: {"mustHave":[{"item":"name","reason":"why needed for this specific trip"}],"recommended":[{"item":"name","reason":"why useful"}],"leaveHome":["item commonly packed but unnecessary here"]}. Max 4 items per array.',
    },
    {
      role: 'user',
      content: `Packing list for ${trip.destination}, ${tripLengthDays} days.
5-day forecast: ${forecastSummary}
${safetyNote}
Destination checklist already includes: ${existingLabels}

Suggest additional items specific to this destination and weather. Do NOT repeat items already in the checklist.`,
    },
  ];
}

export function buildFoodGuidePrompt(
  destination: string,
  restaurants: NearbyPlace[],
  intel: DestinationData | null,
  mealTime: 'breakfast' | 'lunch' | 'dinner',
): AIMessage[] {
  const restaurantNames = restaurants
    .slice(0, 8)
    .map((r) => r.name)
    .join(', ');
  const localDishes = intel?.food.dishes
    .slice(0, 6)
    .map((d) => `${d.name} (${d.priceRange})`)
    .join(', ');
  const streetFood = intel?.food.streetFood.slice(0, 4).join(', ');
  const waterSafety = intel?.food.waterSafety;

  return [
    {
      role: 'system',
      content:
        'You are a local food guide. Respond ONLY with valid JSON array of exactly 3 items: [{"name":"specific name","type":"local_dish|restaurant|street_food|experience","description":"1 sentence why worth it","emoji":"food emoji","priceRange":"$|$$|$$$","tip":"one practical tip"}]',
    },
    {
      role: 'user',
      content: `${mealTime} recommendations in ${destination}.
Nearby restaurants: ${restaurantNames || 'None found nearby'}
Local specialties: ${localDishes || 'Unknown'}
Street food: ${streetFood || 'None listed'}
${waterSafety === 'bottled' ? 'Note: Drink bottled water here.' : ''}

Recommend 3 specific ${mealTime} options mixing local dishes and practical picks. Be specific, not generic.`,
    },
  ];
}

export function buildAIJournalPrompt(
  trip: TripRow,
  entries: JournalEntryRow[],
  placesVisited: string[],
  totalSpent: number,
  currency: string,
): AIMessage[] {
  const entrySummaries = entries
    .slice(0, 8)
    .map(
      (e) =>
        `${e.date}${e.location_name ? ` at ${e.location_name}` : ''}: ${e.title ?? ''} ${e.content?.slice(0, 120) ?? ''}`,
    )
    .join('\n');

  const places = placesVisited.slice(0, 12).join(', ');
  const isCompleted = new Date(trip.end_date) < new Date();

  return [
    {
      role: 'system',
      content: `You are a travel writer crafting a vivid personal narrative. Write in first person. ${isCompleted ? 'Past tense (the trip is over).' : 'Mix of past and present tense (the trip is ongoing).'} 150-220 words. Vivid, specific, emotionally resonant. No markdown. No headers.`,
    },
    {
      role: 'user',
      content: `Write a travel narrative for: "${trip.title}" — ${trip.destination}, ${trip.start_date} to ${trip.end_date}.

Journal entries:
${entrySummaries || 'No journal entries written yet.'}

Places visited: ${places || 'No specific places recorded'}
Total spent: ${currency} ${Math.round(totalSpent).toLocaleString()}

Create a personal travel story that captures the essence of this journey. If no entries exist, write an evocative piece about what someone might experience in ${trip.destination}.`,
    },
  ];
}
