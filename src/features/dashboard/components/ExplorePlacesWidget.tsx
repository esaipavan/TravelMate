import { useState } from 'react';
import { Compass, Search } from 'lucide-react';
import { WidgetCard } from '@/components/shared/WidgetCard';
import { WidgetEmptyState } from '@/components/shared/WidgetEmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useExploreSearch } from '@/features/explore/hooks/useExploreSearch';
import { ExploreError } from '@/features/explore/types';
import { ExplorePlaceCard } from './ExplorePlaceCard';

const PLACEHOLDER = 'Try "places to visit in Telangana" or "Hyderabad"';

// WidgetCard's own loading/error/empty props each REPLACE `children`
// entirely — fine for a widget whose whole body is data-driven, but this
// widget has a persistent control (the search box) that must stay visible no
// matter what state a search is in. So WidgetCard is used here purely as the
// shell (icon/title/border/motion), and the loading/error/empty states are
// rendered manually, below the form, using the same shared primitives
// WidgetCard itself would have used.
export function ExplorePlacesWidget() {
  const [query, setQuery] = useState('');
  const { mutate, data, error, isPending, reset } = useExploreSearch();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    mutate(query);
  };

  const handleRetry = () => {
    if (query.trim()) mutate(query);
  };

  const errorMessage =
    error instanceof ExploreError
      ? error.message
      : error
        ? 'Something went wrong. Please try again.'
        : null;

  const showLocation = data ? data.scope !== 'city' : false;

  return (
    <WidgetCard icon={Compass} title="Explore Places">
      <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (data || error) reset();
          }}
          placeholder={PLACEHOLDER}
          startIcon={<Search className="h-4 w-4" aria-hidden="true" />}
          aria-label="Search for places to visit"
          className="flex-1"
        />
        <Button type="submit" loading={isPending} disabled={!query.trim()}>
          Search
        </Button>
      </form>

      {isPending && (
        <div className="space-y-2.5" aria-hidden="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 w-full animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      )}

      {!isPending && errorMessage && (
        <ErrorState compact message={errorMessage} onRetry={handleRetry} />
      )}

      {!isPending && !errorMessage && data && data.places.length === 0 && (
        <WidgetEmptyState
          icon={Compass}
          title="No places found"
          description="Try a different city, district, or state."
        />
      )}

      {!isPending && !errorMessage && data && data.places.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            {data.places.length} place{data.places.length === 1 ? '' : 's'} in{' '}
            <span className="font-medium text-foreground">{data.locationLabel}</span>
            {!data.isAICurated && ' · not yet AI-ranked'}
          </p>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {data.places.map((place) => (
              <ExplorePlaceCard key={place.id} place={place} showLocation={showLocation} />
            ))}
          </div>
        </div>
      )}

      {!isPending && !errorMessage && !data && (
        <p className="py-2 text-xs text-muted-foreground">
          Search a country, state, district, or city to see real places to visit there.
        </p>
      )}
    </WidgetCard>
  );
}
