import { useQuery } from '@tanstack/react-query';
import { fetchPlaceMedia, type PlaceMedia } from '@/services/place-image/placeImage.service';

interface Options {
  /** Set false to skip the fetch entirely. Default true. */
  enabled?: boolean;
  /** An exact Wikipedia article title already known for this place (e.g.
   *  Geoapify's wiki_and_media hint on a NearbyPlace) — skips the fuzzy
   *  name search and verifies that article directly. */
  knownTitle?: string;
}

/**
 * Combined gallery + VERIFIED description for the rich Place Detail view —
 * one Wikipedia resolution instead of separate usePlaceGallery +
 * description fetches. Returns `{images: [], description: undefined}` while
 * loading or when nothing verifies, so callers render their existing honest
 * gradient/"no description" states, same as usePlaceGallery/usePlaceImage.
 */
export function usePlaceMedia(
  destination: string | null | undefined,
  options: Options = {},
): PlaceMedia & { isLoading: boolean; isFetched: boolean } {
  const key = destination?.trim().toLowerCase() ?? '';
  const enabled = (options.enabled ?? true) && (key.length > 0 || !!options.knownTitle);

  const { data, isLoading, isFetched, fetchStatus } = useQuery<PlaceMedia, Error>({
    queryKey: ['place-media', key, options.knownTitle ?? null],
    queryFn: () => fetchPlaceMedia(destination?.trim() ?? '', options.knownTitle),
    enabled,
    // Place imagery/description is effectively static — cache aggressively
    // to avoid repeat Wikipedia calls for the same place.
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 7 * 24 * 60 * 60 * 1000,
    retry: 1,
  });

  return {
    images: data?.images ?? [],
    description: data?.description,
    isLoading: enabled && isLoading && fetchStatus !== 'idle',
    // True once this query has actually resolved (success or error) — lets a
    // caller distinguish "hasn't run yet" from "ran and found nothing",
    // which matters for gating a fallback (e.g. only trying an AI-advisory
    // description after Wikipedia has genuinely had its chance). False while
    // disabled, same as a query that hasn't started.
    isFetched,
  };
}
