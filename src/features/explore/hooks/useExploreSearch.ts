import { useMutation } from '@tanstack/react-query';
import { searchPlaces } from '../services/explore.service';

// A mutation, not a query — search is explicit-submit, not auto-firing on
// mount or on every keystroke, since each search costs a real Geoapify call
// plus (usually) an AI call.
export function useExploreSearch() {
  return useMutation({
    mutationFn: (query: string) => searchPlaces(query),
  });
}
