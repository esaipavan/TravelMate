import { useMemo } from 'react';
import { useWeather } from '@/features/weather/hooks/useWeather';
import { useDestinationData } from '@/features/destination-intel/hooks/useDestinationData';
import { useReminders } from '@/features/reminders/hooks/useReminders';
import { weatherCodeToLabel } from '@/features/weather/utils';
import type { TripRow } from '@/features/trips/types';
import type { WeatherResult } from '@/features/weather/types';
import type { SafetyInfo } from '@/features/destination-intel/types';
import type { ReminderRow } from '@/features/reminders/types';

export interface SafetyAlert {
  id: string;
  type: 'weather' | 'document' | 'area' | 'health' | 'scam';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  emoji: string;
}

export interface SafetyAdvisorData {
  alerts: SafetyAlert[];
  safetyInfo: SafetyInfo | null;
  documentReminders: ReminderRow[];
  weather: WeatherResult | null;
  isLoading: boolean;
}

export function useSafetyAdvisor(trip: TripRow | null): SafetyAdvisorData {
  const TOMORROW = new Date(Date.now() + 86_400_000).toISOString().split('T')[0];

  const { data: weather, isLoading: weatherLoading } = useWeather(trip?.destination ?? '');
  const { data: intel, isLoading: intelLoading } = useDestinationData(trip?.destination);
  const { data: allReminders = [], isLoading: remindersLoading } = useReminders();

  const alerts = useMemo((): SafetyAlert[] => {
    if (!trip) return [];
    const result: SafetyAlert[] = [];

    if (weather) {
      if (weather.current.uvIndex >= 8) {
        result.push({
          id: 'uv',
          type: 'health',
          severity: weather.current.uvIndex >= 11 ? 'critical' : 'warning',
          title: `UV Index ${weather.current.uvIndex} — ${weather.current.uvIndex >= 11 ? 'Extreme' : 'Very High'}`,
          description:
            'Wear SPF 50+ sunscreen, UV-blocking sunglasses, and a hat. Limit direct sun exposure between 11am–3pm.',
          emoji: '☀️',
        });
      }

      if (weather.current.temperature >= 38) {
        result.push({
          id: 'heat',
          type: 'health',
          severity: 'critical',
          title: `Extreme heat: ${Math.round(weather.current.temperature)}°C`,
          description:
            'Risk of heatstroke. Stay hydrated (2L+ water), avoid midday outdoor activity, and seek air-conditioned spaces.',
          emoji: '🌡️',
        });
      }

      if (weather.current.windspeed >= 50) {
        result.push({
          id: 'wind',
          type: 'weather',
          severity: 'warning',
          title: `Strong winds: ${Math.round(weather.current.windspeed)} km/h`,
          description:
            'Be cautious near coastal areas and elevated terrain. Secure loose items. Outdoor activities may be affected.',
          emoji: '💨',
        });
      }

      const tomorrowForecast = weather.forecast.find((f) => f.date === TOMORROW);
      if (tomorrowForecast && tomorrowForecast.precipProbabilityMax >= 70) {
        result.push({
          id: 'rain',
          type: 'weather',
          severity: 'info',
          title: `Heavy rain expected tomorrow`,
          description: `${Math.round(tomorrowForecast.precipProbabilityMax)}% chance — ${weatherCodeToLabel(tomorrowForecast.weathercode)}. Plan indoor activities or carry waterproofs.`,
          emoji: '🌧️',
        });
      }
    }

    if (intel?.meta?.isFallback) {
      // Destination safety analysis could not be completed (AI/provider
      // failure) and only generic fallback data is available. Its safety
      // fields (overallRating/scams/avoidAreas) must never be read as a
      // real assessment — surface the uncertainty instead of staying silent.
      result.push({
        id: 'safety-data-unavailable',
        type: 'area',
        severity: 'info',
        title: 'Limited safety information',
        description:
          "We couldn't complete a full safety analysis for this destination. Check official travel advisories for the latest guidance.",
        emoji: 'ℹ️',
      });
    } else if (intel?.safety) {
      const { overallRating, ratingNote, scams, avoidAreas } = intel.safety;

      if (overallRating === 'high-risk') {
        result.push({
          id: 'safety-high',
          type: 'area',
          severity: 'critical',
          title: 'High-risk destination',
          description:
            ratingNote ||
            'This destination has elevated safety concerns. Review official travel advisories and stay alert.',
          emoji: '🚨',
        });
      } else if (overallRating === 'caution') {
        result.push({
          id: 'safety-caution',
          type: 'area',
          severity: 'warning',
          title: 'Exercise caution',
          description:
            ratingNote ||
            'Stay alert in tourist areas, keep valuables secure, and be aware of your surroundings.',
          emoji: '⚠️',
        });
      }

      if (scams.length > 0) {
        result.push({
          id: 'scams',
          type: 'scam',
          severity: 'info',
          title: `${scams.length} known tourist scam${scams.length > 1 ? 's' : ''}`,
          description: scams[0] ?? 'Be aware of common tourist scams in this area.',
          emoji: '🛡️',
        });
      }

      if (avoidAreas.length > 0) {
        result.push({
          id: 'avoid-areas',
          type: 'area',
          severity: 'warning',
          title: 'Areas to avoid',
          description: avoidAreas.slice(0, 3).join(', '),
          emoji: '🚫',
        });
      }
    }

    return result;
  }, [trip, weather, intel, TOMORROW]);

  const documentReminders = useMemo(
    () =>
      allReminders.filter(
        (r) =>
          r.status !== 'completed' &&
          (r.trip_id === trip?.id || r.trip_id === null) &&
          ['passport', 'visa', 'insurance', 'vaccination'].includes(r.type),
      ),
    [allReminders, trip],
  );

  return {
    alerts,
    safetyInfo: intel?.safety ?? null,
    documentReminders,
    weather: weather ?? null,
    isLoading: weatherLoading || intelLoading || remindersLoading,
  };
}
