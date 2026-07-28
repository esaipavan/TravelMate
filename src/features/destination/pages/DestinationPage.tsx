import { useState } from 'react';
import { Search, Globe, RefreshCw, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/shared/PageHeader';
import {
  useDestination,
  getSearchHistory,
  addToHistory,
  clearHistory,
} from '../hooks/useDestination';
import { CountryInfoCard } from '../components/CountryInfoCard';
import { WikiSummaryCard } from '../components/WikiSummaryCard';
import { TravelTipsCard } from '../components/TravelTipsCard';
import { SearchHistory } from '../components/SearchHistory';

function DestinationSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-48 w-full rounded-xl" />
      <div className="grid grid-cols-2 gap-px">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-14" />
        ))}
      </div>
      <Skeleton className="h-56 w-full rounded-xl" />
    </div>
  );
}

export default function DestinationPage() {
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState<string[]>(getSearchHistory);

  const qc = useQueryClient();

  const { data, isLoading, isError, isFetching } = useDestination(query);

  function handleSearch(value?: string) {
    const q = (value ?? input).trim();
    if (!q) return;
    if (q === query) {
      void qc.invalidateQueries({ queryKey: ['destination', query] });
    } else {
      setQuery(q);
      setInput(value ? value : input);
    }
    setHistory(addToHistory(q));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleSearch();
  }

  function handleHistorySelect(q: string) {
    setInput(q);
    handleSearch(q);
  }

  function handleClearHistory() {
    clearHistory();
    setHistory([]);
  }

  function handleRefresh() {
    void qc.invalidateQueries({ queryKey: ['destination', query] });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Destination Guide"
        description="Country facts, overview and travel tips for any destination"
      />

      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search country or city — e.g. Japan, Paris, Bali…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <Button onClick={() => handleSearch()} disabled={!input.trim() || isFetching}>
          {isFetching ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Search className="mr-2 h-4 w-4" />
          )}
          Search
        </Button>
        {query && (
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

      {/* Search history */}
      <SearchHistory
        history={history}
        onSelect={handleHistorySelect}
        onClear={handleClearHistory}
      />

      {/* Empty state */}
      {!query && (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed py-20 text-center">
          <Globe className="h-10 w-10 text-muted-foreground opacity-40" />
          <div className="space-y-1">
            <p className="font-medium">Search any destination</p>
            <p className="text-sm text-muted-foreground">
              Enter a country, city, or region to get facts, overview, and travel tips.
            </p>
          </div>
        </div>
      )}

      {/* Loading */}
      {query && isLoading && <DestinationSkeleton />}

      {/* Error */}
      {query && isError && (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed py-16 text-center">
          <Globe className="h-10 w-10 text-muted-foreground opacity-40" />
          <div className="space-y-1">
            <p className="font-medium">No results found</p>
            <p className="text-sm text-muted-foreground">
              Try a different city, country, or region name.
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={handleRefresh}>
            Try again
          </Button>
        </div>
      )}

      {/* Results */}
      {data && !isError && (
        <div className="space-y-4">
          {/* Country info */}
          {data.country && <CountryInfoCard country={data.country} />}

          {/* Wikipedia overview */}
          {data.wiki && <WikiSummaryCard wiki={data.wiki} title={`About ${data.wiki.title}`} />}

          {/* Travel tips */}
          {data.country && <TravelTipsCard country={data.country} />}

          {/* Tourist attractions */}
          {data.attractions && (
            <WikiSummaryCard wiki={data.attractions} title="Tourism & Attractions" />
          )}
        </div>
      )}
    </div>
  );
}
