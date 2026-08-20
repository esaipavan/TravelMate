import { useQuery } from '@tanstack/react-query';
import { fetchPlaceImage } from '@/services/place-image/placeImage.service';

interface Options {
  /** Set false to skip the fetch entirely — e.g. when a curated or custom
   *  cover is already available, so no network call is made. Default true. */
  enabled?: boolean;
}

/**
 * Async, cached real-image enrichment for a recognised place (Wikipedia).
 * Returns `imageUrl: null` while loading or when no confident image exists, so
 * callers can render their gradient first and swap in a real photo only if one
 * arrives. Pair with `resolveTripCoverImage` / `resolveDestinationImageUrl`:
 * use those (curated / custom) first, and fall back to this for the gap.
 */
export function usePlaceImage(
  destination: string | null | undefined,
  options: Options = {},
): { imageUrl: string | null; isLoading: boolean } {
  const key = destination?.trim().toLowerCase() ?? '';
  const enabled = (options.enabled ?? true) && key.length > 0;

  const { data, isLoading, fetchStatus } = useQuery<string | null, Error>({
    queryKey: ['place-image', key],
    queryFn: () => fetchPlaceImage(destination!.trim()),
    enabled,
    // Place imagery is effectively static — cache aggressively to avoid
    // repeat Wikipedia calls for the same destination.
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 7 * 24 * 60 * 60 * 1000,
    retry: 1,
  });

  return {
    imageUrl: data ?? null,
    // Only "loading" when a fetch is actually in flight (not idle/disabled).
    isLoading: enabled && isLoading && fetchStatus !== 'idle',
  };
}
