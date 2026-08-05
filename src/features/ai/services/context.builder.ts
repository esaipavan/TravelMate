import type { TripRow } from '@/features/trips/types';
import type { ExpenseData } from '@/features/expenses/types';
import type { WeatherResult } from '@/features/weather/types';
import type { DestinationData } from '@/features/destination-intel/types';

export interface TripContext {
  trip: TripRow | null | undefined;
  expenses: ExpenseData | null | undefined;
  weather: WeatherResult | null | undefined;
  intel: DestinationData | null | undefined;
}

function formatDate(d: string | null | undefined): string {
  if (!d) return '';
  try {
    return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return d;
  }
}

function tripStatusLine(trip: TripRow): string {
  const today = new Date();
  const start = trip.start_date ? new Date(trip.start_date + 'T00:00:00') : null;
  const end = trip.end_date ? new Date(trip.end_date + 'T00:00:00') : null;
  if (start && end) {
    if (today < start) {
      const days = Math.ceil((start.getTime() - today.getTime()) / 86400000);
      return `Status: upcoming in ${days} day${days !== 1 ? 's' : ''}`;
    }
    if (today > end) return 'Status: completed';
    const dayIn = Math.floor((today.getTime() - start.getTime()) / 86400000) + 1;
    const total = Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1;
    return `Status: active (day ${dayIn} of ${total})`;
  }
  return '';
}

function formatExpenses(expenses: ExpenseData): string {
  if (!expenses.expenses.length) return 'No expenses recorded yet.';
  const total = expenses.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const currency = expenses.tripCurrency;

  // Group by category
  const byCat: Record<string, number> = {};
  for (const e of expenses.expenses) {
    byCat[e.category] = (byCat[e.category] ?? 0) + Number(e.amount);
  }
  const topCats = Object.entries(byCat)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)
    .map(([cat, amt]) => `${cat}: ${currency} ${Math.round(amt)}`)
    .join(', ');

  return `Total spent: ${currency} ${Math.round(total)} across ${expenses.expenses.length} expense${expenses.expenses.length !== 1 ? 's' : ''}. Top categories: ${topCats}.`;
}

function weatherDescription(code: number | undefined): string {
  if (code === undefined) return '';
  if (code === 0) return 'Clear sky';
  if (code <= 3) return 'Partly cloudy';
  if (code <= 48) return 'Foggy';
  if (code <= 57) return 'Drizzle';
  if (code <= 67) return 'Rain';
  if (code <= 77) return 'Snow';
  if (code <= 82) return 'Rain showers';
  if (code <= 86) return 'Snow showers';
  return 'Thunderstorm';
}

function formatWeather(weather: WeatherResult): string {
  const c = weather.current;
  const desc = weatherDescription(c.weathercode);
  const parts: string[] = [
    desc ? `${desc}, ${Math.round(c.temperature)}°C` : `${Math.round(c.temperature)}°C`,
    c.humidity !== undefined ? `${c.humidity}% humidity` : '',
    c.uvIndex !== undefined ? `UV ${c.uvIndex}` : '',
    c.windspeed !== undefined ? `wind ${Math.round(c.windspeed)} km/h` : '',
  ].filter(Boolean);
  return `Current: ${parts.join(', ')}.`;
}

/**
 * Builds a rich system prompt for the AI assistant from all available trip context.
 * Every field is optional — the prompt degrades gracefully when data is missing.
 */
export function buildRichContext(ctx: TripContext): string {
  const { trip, expenses, weather, intel } = ctx;

  const lines: string[] = [
    'You are an expert AI travel assistant embedded in TravelMate.',
    'Answer using markdown: **bold** key points, bullet lists for steps, headers for sections, tables for comparisons.',
    'Be specific, actionable, and personalized to this exact trip context.',
    '',
  ];

  if (trip) {
    lines.push('## Current Trip');
    if (trip.title) lines.push(`Name: ${trip.title}`);
    if (trip.destination) lines.push(`Destination: ${trip.destination}`);
    if (trip.start_date || trip.end_date) {
      lines.push(
        `Dates: ${formatDate(trip.start_date)}${trip.end_date ? ` → ${formatDate(trip.end_date)}` : ''}`,
      );
    }
    const status = tripStatusLine(trip);
    if (status) lines.push(status);
    if (trip.total_budget) {
      lines.push(`Budget: ${trip.currency ?? 'USD'} ${trip.total_budget.toLocaleString()} total`);
    }
    if (trip.notes) {
      const notes = trip.notes.slice(0, 300);
      lines.push(`Notes: ${notes}${trip.notes.length > 300 ? '…' : ''}`);
    }
    lines.push('');
  }

  if (expenses?.expenses.length) {
    lines.push('## Spending');
    lines.push(formatExpenses(expenses));
    lines.push('');
  }

  if (weather) {
    lines.push('## Current Weather');
    lines.push(formatWeather(weather));
    if (weather.forecast.length > 0) {
      const next3 = weather.forecast
        .slice(0, 3)
        .map(
          (d) =>
            `${d.date}: ${Math.round(d.tempMin)}–${Math.round(d.tempMax)}°C${d.precipProbabilityMax ? `, ${d.precipProbabilityMax}% rain` : ''}`,
        )
        .join('; ');
      lines.push(`Forecast: ${next3}.`);
    }
    lines.push('');
  }

  if (intel) {
    lines.push('## Destination Intelligence');
    if (intel.overview.description) lines.push(intel.overview.description);
    if (intel.overview.visaInfo) lines.push(`Visa: ${intel.overview.visaInfo}`);
    if (intel.overview.currency && intel.overview.currencyCode) {
      lines.push(`Local currency: ${intel.overview.currency} (${intel.overview.currencyCode})`);
    }
    if (intel.overview.language) lines.push(`Language: ${intel.overview.language}`);
    if (intel.safety?.overallRating) {
      lines.push(`Safety: ${intel.safety.overallRating}. ${intel.safety.ratingNote}`);
    }
    if (intel.cost) {
      lines.push(
        `Daily costs: Budget USD ${intel.cost.dailyTotalBudget} · Mid-range USD ${intel.cost.dailyTotalMidrange} · Luxury USD ${intel.cost.dailyTotalLuxury}`,
      );
    }
    if (intel.food?.dishes.length) {
      const dishes = intel.food.dishes
        .filter((d) => d.mustTry)
        .slice(0, 3)
        .map((d) => d.name)
        .join(', ');
      if (dishes) lines.push(`Must-try dishes: ${dishes}`);
    }
    lines.push('');
  }

  if (trip?.destination) {
    lines.push(
      `Personalise every answer specifically to ${trip.destination}. If you don't know something, say so rather than guessing.`,
    );
  }

  return lines.join('\n');
}
