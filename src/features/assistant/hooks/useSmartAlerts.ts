import { useMemo } from 'react';
import { useWeather } from '@/features/weather/hooks/useWeather';
import { useExpenseData } from '@/features/expenses/hooks/useExpenses';
import { useReminders } from '@/features/reminders/hooks/useReminders';
import { weatherCodeToLabel } from '@/features/weather/utils';
import { computeTripInsight, computeBudgetAnalysis } from '../services/recommendation.engine';
import type { TripRow } from '@/features/trips/types';

export interface SmartAlert {
  id: string;
  type: 'budget' | 'weather' | 'document' | 'timing' | 'health';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  emoji: string;
}

export function useSmartAlerts(trip: TripRow | null): SmartAlert[] {
  const TODAY = new Date().toISOString().split('T')[0];
  const TOMORROW = new Date(Date.now() + 86_400_000).toISOString().split('T')[0];

  const { data: weather } = useWeather(trip?.destination ?? '');
  const { data: expenseData } = useExpenseData(trip?.id ?? '');
  const { data: allReminders = [] } = useReminders();

  return useMemo((): SmartAlert[] => {
    if (!trip) return [];

    const alerts: SmartAlert[] = [];
    const insight = computeTripInsight(trip, TODAY);
    const budget = computeBudgetAnalysis(trip, expenseData ?? null, insight);

    // Budget alerts
    if (budget?.status === 'over-budget') {
      alerts.push({
        id: 'budget-over',
        type: 'budget',
        severity: 'critical',
        title: 'Over budget',
        description: `${Math.round(budget.percentUsed)}% spent — ${budget.currency} ${Math.round(Math.abs(budget.remaining)).toLocaleString()} over limit.`,
        emoji: '⚠️',
      });
    } else if (budget?.status === 'near-limit') {
      alerts.push({
        id: 'budget-near',
        type: 'budget',
        severity: 'warning',
        title: 'Approaching budget limit',
        description: `${Math.round(budget.percentUsed)}% spent. ${budget.currency} ${Math.round(budget.remaining).toLocaleString()} left for ${budget.daysRemaining} days.`,
        emoji: '💰',
      });
    }

    // Trip timing alerts
    if (insight.isUpcoming && insight.daysUntilTrip <= 1) {
      alerts.push({
        id: 'departing-soon',
        type: 'timing',
        severity: 'critical',
        title: insight.daysUntilTrip === 0 ? 'Departing today!' : 'Departing tomorrow!',
        description: 'Check passport, confirm all bookings, and arrange airport transport.',
        emoji: '✈️',
      });
    }

    if (insight.isActive && insight.daysRemaining === 1) {
      alerts.push({
        id: 'last-day',
        type: 'timing',
        severity: 'info',
        title: 'Last day of the trip',
        description: `Final day in ${trip.destination}. Check checkout time and any last must-sees.`,
        emoji: '⏳',
      });
    }

    // Weather alerts
    if (weather) {
      if (weather.current.uvIndex >= 8) {
        alerts.push({
          id: 'uv-high',
          type: 'health',
          severity: weather.current.uvIndex >= 11 ? 'critical' : 'warning',
          title: `UV index ${weather.current.uvIndex} — ${weather.current.uvIndex >= 11 ? 'extreme' : 'very high'}`,
          description: 'Apply SPF 50+ sunscreen every 2 hours. Seek shade between 11am–3pm.',
          emoji: '☀️',
        });
      }

      if (weather.current.temperature >= 35) {
        alerts.push({
          id: 'heat',
          type: 'health',
          severity: weather.current.temperature >= 38 ? 'critical' : 'warning',
          title: `Extreme heat: ${Math.round(weather.current.temperature)}°C`,
          description: 'Stay hydrated. Avoid prolonged outdoor activity during midday heat.',
          emoji: '🌡️',
        });
      }

      const tomorrowForecast = weather.forecast.find((f) => f.date === TOMORROW);
      if (tomorrowForecast && tomorrowForecast.precipProbabilityMax >= 60) {
        alerts.push({
          id: 'rain-tomorrow',
          type: 'weather',
          severity: 'info',
          title: `Rain tomorrow (${tomorrowForecast.precipProbabilityMax}%)`,
          description: `${weatherCodeToLabel(tomorrowForecast.weathercode)} forecast. Pack a waterproof layer.`,
          emoji: '🌧️',
        });
      }
    }

    // Document reminders
    const urgentDocs = allReminders.filter(
      (r) =>
        r.status !== 'completed' &&
        (r.trip_id === trip.id || r.trip_id === null) &&
        ['passport', 'visa', 'insurance', 'vaccination'].includes(r.type) &&
        r.reminder_date <= TODAY,
    );
    for (const rem of urgentDocs.slice(0, 2)) {
      alerts.push({
        id: `doc-${rem.id}`,
        type: 'document',
        severity: 'warning',
        title: rem.title,
        description: rem.description ?? `${rem.type} — action required`,
        emoji: '📋',
      });
    }

    return alerts;
  }, [trip, expenseData, weather, allReminders, TODAY, TOMORROW]);
}
