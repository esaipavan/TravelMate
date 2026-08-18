import { geocodeLocation } from '@/lib/geocode';
import type { GeoLocation, WeatherResult, CurrentWeather, ForecastDay } from '../types';

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';

export async function geocodeDestination(query: string): Promise<GeoLocation> {
  return geocodeLocation(query);
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherResult> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current_weather: 'true',
    hourly: 'relativehumidity_2m,apparent_temperature,uv_index',
    daily: [
      'weathercode',
      'temperature_2m_max',
      'temperature_2m_min',
      'sunrise',
      'sunset',
      'precipitation_probability_max',
      'uv_index_max',
    ].join(','),
    timezone: 'auto',
    forecast_days: '7',
  });

  const res = await fetch(`${OPEN_METEO_URL}?${params.toString()}`);
  if (!res.ok) throw new Error('Weather request failed');

  const data = (await res.json()) as {
    current_weather: {
      temperature: number;
      windspeed: number;
      weathercode: number;
      is_day: number;
      time: string;
    };
    hourly: {
      time: string[];
      relativehumidity_2m: number[];
      apparent_temperature: number[];
      uv_index: number[];
    };
    daily: {
      time: string[];
      weathercode: number[];
      temperature_2m_max: number[];
      temperature_2m_min: number[];
      sunrise: string[];
      sunset: string[];
      precipitation_probability_max: number[];
      uv_index_max: number[];
    };
  };

  const cw = data.current_weather;

  // Find the hourly index closest to current time
  const currentTime = cw.time;
  const hourlyIdx = data.hourly.time.findIndex((t) => t >= currentTime);
  const hIdx = hourlyIdx >= 0 ? hourlyIdx : 0;

  // today index in daily
  const todayDate = currentTime.split('T')[0];
  const todayIdx = data.daily.time.findIndex((d) => d === todayDate);
  const dIdx = todayIdx >= 0 ? todayIdx : 0;

  const current: CurrentWeather = {
    temperature: Math.round(cw.temperature),
    feelsLike: Math.round(data.hourly.apparent_temperature[hIdx] ?? cw.temperature),
    weathercode: cw.weathercode,
    windspeed: Math.round(cw.windspeed),
    humidity: data.hourly.relativehumidity_2m[hIdx] ?? 0,
    uvIndex: Math.round(data.hourly.uv_index[hIdx] ?? 0),
    sunrise: data.daily.sunrise[dIdx] ?? '',
    sunset: data.daily.sunset[dIdx] ?? '',
    isDay: cw.is_day === 1,
  };

  const forecast: ForecastDay[] = data.daily.time.map((date, i) => ({
    date,
    weathercode: data.daily.weathercode[i],
    tempMax: Math.round(data.daily.temperature_2m_max[i]),
    tempMin: Math.round(data.daily.temperature_2m_min[i]),
    uvIndexMax: Math.round(data.daily.uv_index_max[i] ?? 0),
    precipProbabilityMax: data.daily.precipitation_probability_max[i] ?? 0,
    sunrise: data.daily.sunrise[i],
    sunset: data.daily.sunset[i],
  }));

  return { location: { lat, lon, displayName: '' }, current, forecast };
}
