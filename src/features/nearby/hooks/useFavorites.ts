import { useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth.store';
import { fetchSavedPlaces, savePlace, unsavePlace } from '../services/savedPlaces.service';
import type { SavedPlace } from '../services/savedPlaces.service';
import type { NearbyPlace } from '../types';

// Account-level Save, backed by the `saved_places` table (migration
// 024_saved_places.sql), RLS-scoped to `auth.uid()`. Previously this hook
// was `localStorage`-only (device-scoped — never survived logout or a
// different browser/device); that key (`travelmate-nearby-favorites`) is
// intentionally left untouched on disk rather than migrated, since it only
// ever stored bare place IDs, not the name/category/coordinates a
// `saved_places` row needs — there is nothing recoverable from an ID alone
// without an extra Geoapify lookup per saved place, which risks silently
// resurfacing stale/incorrect data rather than a clean account-level start.
export function useFavorites() {
  const userId = useAuthStore((s) => s.user?.id);
  const qc = useQueryClient();
  const queryKey = ['saved-places', userId] as const;

  const { data: savedPlaces = [] } = useQuery<SavedPlace[]>({
    queryKey,
    queryFn: () => fetchSavedPlaces(userId!),
    enabled: !!userId,
    staleTime: 60 * 1000,
  });

  const favorites = useMemo(() => new Set(savedPlaces.map((p) => p.placeId)), [savedPlaces]);

  // Both mutations surface a failure via toast — without this, a failed
  // save/unsave (network error, RLS rejection, etc.) looked identical to a
  // successful one: the query was never invalidated, so the heart icon
  // simply never changed, with no indication anything went wrong.
  const saveMutation = useMutation({
    mutationFn: (place: NearbyPlace) => savePlace(userId!, place),
    onSuccess: () => void qc.invalidateQueries({ queryKey }),
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Could not save this place'),
  });

  const unsaveMutation = useMutation({
    mutationFn: (placeId: string) => unsavePlace(userId!, placeId),
    onSuccess: () => void qc.invalidateQueries({ queryKey }),
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : 'Could not remove this place'),
  });

  // Toggle takes the full place (not just an id) — Save needs the
  // name/category/coordinates to persist a restorable row, not only the id.
  // Guarded against a mutation already in flight — without this, rapidly
  // double-clicking the favorite button could fire save and unsave back to
  // back before the first request's result (and the resulting query
  // invalidation) came back, since `favorites` wouldn't reflect the first
  // click yet when the second one reads it.
  const toggleFavorite = useCallback(
    (place: NearbyPlace) => {
      if (!userId || saveMutation.isPending || unsaveMutation.isPending) return;
      if (favorites.has(place.id)) {
        unsaveMutation.mutate(place.id);
      } else {
        saveMutation.mutate(place);
      }
    },
    [userId, favorites, saveMutation, unsaveMutation],
  );

  const isFavorite = useCallback((id: string) => favorites.has(id), [favorites]);

  return { favorites, savedPlaces, toggleFavorite, isFavorite };
}
