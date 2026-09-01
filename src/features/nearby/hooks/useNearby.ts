import { useQuery } from '@tanstack/react-query';
import { fetchNearbyPlaces, fetchNearbyPlacesAtCoords } from '../services/nearby.service';

// retry: false — a "no location found" or bad-request failure is
// deterministic (it will fail identically on a second attempt), so an
// automatic retry only delays reaching a visible error state for no benefit.
// A genuinely transient failure is still recoverable via the error card's
// "Try again" button, which the user controls.
export function useNearbyPlaces(destination: string) {
  return useQuery({
    queryKey: ['nearby', destination],
    queryFn: () => fetchNearbyPlaces(destination),
    staleTime: 30 * 60 * 1000,
    retry: false,
    enabled: destination.trim().length > 0,
  });
}

// locationLabel overrides the default "Your current location" — needed when
// these coordinates didn't actually come from the device's GPS (e.g. a
// trip's saved destination coordinates), so the result header doesn't
// falsely claim to be the user's live location.
export function useNearbyPlacesAtCoords(
  coords: { lat: number; lon: number } | null,
  locationLabel?: string,
) {
  return useQuery({
    queryKey: ['nearby-coords', coords?.lat, coords?.lon, locationLabel],
    queryFn: () => fetchNearbyPlacesAtCoords(coords!.lat, coords!.lon, locationLabel),
    staleTime: 30 * 60 * 1000,
    retry: false,
    enabled: !!coords,
  });
}
