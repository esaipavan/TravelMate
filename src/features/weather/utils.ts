import { format } from 'date-fns';

export function weatherCodeToEmoji(code: number, isDay: boolean): string {
  if (code === 0) return isDay ? '☀️' : '🌙';
  if (code <= 2) return isDay ? '🌤️' : '🌙';
  if (code <= 3) return '⛅';
  if (code <= 48) return '🌫️';
  if (code <= 55) return '🌦️';
  if (code <= 67) return '🌧️';
  if (code <= 77) return '❄️';
  if (code <= 82) return '🌨️';
  return '⛈️';
}

export function weatherCodeToLabel(code: number): string {
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

/**
 * Formats a YYYY-MM-DD date string for forecast display.
 * Uses noon local time to avoid DST-shift edge cases.
 */
export function formatForecastDate(dateStr: string): { dayLabel: string; shortDate: string } {
  const dt = new Date(`${dateStr}T12:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isToday = dt.toDateString() === today.toDateString();
  return {
    dayLabel: isToday ? 'Today' : format(dt, 'EEE'),
    shortDate: format(dt, 'MMM d'),
  };
}
