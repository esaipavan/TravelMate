import { useQuery } from '@tanstack/react-query';
import {
  Sun,
  CloudSun,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Droplets,
  Wind,
  MapPin,
  Cloud,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { WeatherData } from '../types';

interface OpenMeteoCurrentWeather {
  temperature: number;
  windspeed: number;
  weathercode: number;
  is_day: number;
}

interface OpenMeteoResponse {
  current_weather: OpenMeteoCurrentWeather;
}

interface NominatimResponse {
  address?: Record<string, string>;
}

async function fetchWeather(signal: AbortSignal): Promise<WeatherData> {
  const coords = await new Promise<GeolocationCoordinates>((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Location not supported by this browser'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos.coords),
      () => reject(new Error('Location access denied')),
      { timeout: 8000, maximumAge: 5 * 60 * 1000 },
    );
  });

  const { latitude: lat, longitude: lon } = coords;

  const [weather, geo] = await Promise.all([
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`,
      { signal },
    ).then((r): Promise<OpenMeteoResponse> => r.json()),
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, {
      headers: { 'Accept-Language': 'en' },
      signal,
    }).then((r): Promise<NominatimResponse> => r.json()),
  ]);

  const cw = weather.current_weather;
  const address = geo.address;
  const location =
    address?.city ?? address?.town ?? address?.village ?? address?.county ?? 'Your location';

  return {
    temperature: Math.round(cw.temperature),
    weathercode: cw.weathercode,
    windspeed: Math.round(cw.windspeed),
    is_day: cw.is_day,
    location,
  };
}

function weatherIcon(code: number, isDay: boolean): LucideIcon {
  if (code === 0) return isDay ? Sun : Cloud;
  if (code <= 3) return CloudSun;
  if (code <= 48) return Cloud;
  if (code <= 55) return Droplets;
  if (code <= 67) return CloudRain;
  if (code <= 77) return CloudSnow;
  if (code <= 82) return CloudRain;
  return CloudLightning;
}

function weatherDesc(code: number): string {
  if (code === 0) return 'Clear sky';
  if (code <= 3) return 'Partly cloudy';
  if (code <= 48) return 'Foggy';
  if (code <= 55) return 'Drizzle';
  if (code <= 67) return 'Rainy';
  if (code <= 77) return 'Snowy';
  if (code <= 82) return 'Showers';
  return 'Thunderstorm';
}

export function WeatherWidget() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['weather'],
    queryFn: ({ signal }) => fetchWeather(signal),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 0,
  });

  const errorMessage = error instanceof Error ? error.message : 'Failed to load weather';

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Weather</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        )}

        {isError && (
          <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{errorMessage}</span>
            <span className="text-xs">Enable location access to see local weather.</span>
          </div>
        )}

        {data &&
          (() => {
            const Icon = weatherIcon(data.weathercode, !!data.is_day);
            return (
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold tabular-nums">{data.temperature}°</span>
                    <span className="mb-1 text-sm text-muted-foreground">C</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{weatherDesc(data.weathercode)}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{data.location}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Wind className="h-3 w-3 shrink-0" />
                    <span>{data.windspeed} km/h</span>
                  </div>
                </div>
                <div className="text-primary">
                  <Icon className="h-10 w-10" />
                </div>
              </div>
            );
          })()}
      </CardContent>
    </Card>
  );
}
