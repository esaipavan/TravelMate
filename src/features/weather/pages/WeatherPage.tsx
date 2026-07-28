import { useState, useRef } from 'react';
import { Search, RefreshCw, MapPin, CloudOff, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/shared/PageHeader';
import { formatTimeAgo } from '@/utils/formatters';
import { useWeather } from '../hooks/useWeather';
import { CurrentWeatherCard } from '../components/CurrentWeatherCard';
import { ForecastRow } from '../components/ForecastRow';

function WeatherSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-52 w-full rounded-xl" />
      <div className="space-y-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default function WeatherPage() {
  const [input, setInput] = useState('');
  const [destination, setDestination] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  const { data, isLoading, isError, isFetching, dataUpdatedAt } = useWeather(destination);

  function handleSearch() {
    const q = input.trim();
    if (!q) return;
    if (q === destination) {
      void qc.invalidateQueries({ queryKey: ['weather', destination] });
    } else {
      setDestination(q);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleSearch();
  }

  function handleRefresh() {
    void qc.invalidateQueries({ queryKey: ['weather', destination] });
  }

  const todayDate = data?.forecast[0]?.date ?? '';

  return (
    <div className="space-y-6">
      <PageHeader title="Weather" description="7-day forecast for any destination" />

      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            className="pl-9"
            placeholder="Search destination — e.g. Tokyo, Bali, London…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <Button onClick={handleSearch} disabled={!input.trim() || isFetching}>
          {isFetching ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Search className="mr-2 h-4 w-4" />
          )}
          Search
        </Button>
        {destination && (
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isFetching}
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        )}
      </div>

      {/* States */}
      {!destination && (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed py-20 text-center">
          <Search className="h-10 w-10 text-muted-foreground opacity-40" />
          <div className="space-y-1">
            <p className="font-medium">Search for a destination</p>
            <p className="text-sm text-muted-foreground">
              Enter a city, country, or address to get the 7-day forecast.
            </p>
          </div>
        </div>
      )}

      {destination && isLoading && <WeatherSkeleton />}

      {destination && isError && (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed py-16 text-center">
          <CloudOff className="h-10 w-10 text-muted-foreground opacity-40" />
          <div className="space-y-1">
            <p className="font-medium">Could not load weather</p>
            <p className="text-sm text-muted-foreground">Check the city name and try again.</p>
          </div>
          <Button size="sm" variant="outline" onClick={handleRefresh}>
            Try again
          </Button>
        </div>
      )}

      {data && !isError && (
        <div className="space-y-4">
          {/* Location label + last updated */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{data.location.displayName}</span>
            </div>
            {dataUpdatedAt > 0 && (
              <span className="shrink-0 text-xs text-muted-foreground">
                Updated {formatTimeAgo(new Date(dataUpdatedAt))}
              </span>
            )}
          </div>

          {/* Current conditions */}
          <CurrentWeatherCard current={data.current} location={data.location.displayName} />

          {/* 7-day forecast */}
          <div>
            <h2 className="mb-3 font-semibold">7-Day Forecast</h2>
            <div className="space-y-2">
              {data.forecast.map((day) => (
                <ForecastRow key={day.date} day={day} today={day.date === todayDate} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
