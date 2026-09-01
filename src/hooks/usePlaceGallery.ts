import { useQuery } from '@tanstack/react-query';
import { fetchPlaceGallery } from '@/services/place-image/placeImage.service';

interface Options {
  /** Set false to skip the fetch entirely. Default true. */
  enabled?: boolean;
}

/**
 * Async, cached multi-image gallery for a recognised place (Wikipedia — same
 * verified article `usePlaceImage` draws its single cover from). Returns an
 * empty array while loading or when no confident image exists at all; callers
 * should render their existing honest gradient in that case, same as
 * `usePlaceImage`. Every URL returned already passed the India + geographic +
 * relevance gates in `fetchPlaceGallery` — there is no additional filtering
 * for callers to do.
 */
export function usePlaceGallery(
  destination: string | null | undefined,
  options: Options = {},
): { images: string[]; isLoading: boolean } {
  const key = destination?.trim().toLowerCase() ?? '';
  const enabled = (options.enabled ?? true) && key.length > 0;

  const { data, isLoading, fetchStatus } = useQuery<string[], Error>({
    queryKey: ['place-gallery', key],
    queryFn: () => fetchPlaceGallery(destination!.trim()),
    enabled,
    // Place imagery is effectively static — cache aggressively to avoid
    // repeat Wikipedia calls for the same destination.
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 7 * 24 * 60 * 60 * 1000,
    retry: 1,
  });

  return {
    images: data ?? [],
    isLoading: enabled && isLoading && fetchStatus !== 'idle',
  };
}
