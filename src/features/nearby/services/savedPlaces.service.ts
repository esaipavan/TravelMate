import { supabase } from '@/lib/supabase';
import type { LocationHierarchy } from '@/lib/geocode';
import type { NearbyPlace } from '../types';

// Account-level persistence for the Nearby "Save" action — replaces the
// previous localStorage-only implementation, which never survived logout, a
// browser data clear, or a different device/browser profile. RLS (migration
// 024_saved_places.sql) scopes every row to `user_id = auth.uid()`, so these
// queries never need an explicit user filter to stay account-isolated — the
// explicit `.eq('user_id', userId)` calls below are defense in depth, not
// the actual security boundary.

export interface SavedPlace {
  id: string;
  placeId: string;
  name: string;
  category: string;
  address: string | null;
  lat: number;
  lon: number;
  locationDetail?: LocationHierarchy;
  createdAt: string;
}

export interface SavedPlaceRow {
  id: string;
  place_id: string;
  name: string;
  category: string;
  address: string | null;
  latitude: number;
  longitude: number;
  locality: string | null;
  district: string | null;
  state: string | null;
  country: string | null;
  created_at: string;
}

// Exported purely for unit testing — no network involved, same convention
// as nearby.service.ts's buildPlaceLocationHierarchy etc.
export function toSavedPlace(row: SavedPlaceRow): SavedPlace {
  const hasLocation = row.locality || row.district || row.state || row.country;
  return {
    id: row.id,
    placeId: row.place_id,
    name: row.name,
    category: row.category,
    address: row.address,
    lat: row.latitude,
    lon: row.longitude,
    locationDetail: hasLocation
      ? {
          locality: row.locality ?? undefined,
          district: row.district ?? undefined,
          state: row.state ?? undefined,
          country: row.country ?? undefined,
        }
      : undefined,
    createdAt: row.created_at,
  };
}

export async function fetchSavedPlaces(userId: string): Promise<SavedPlace[]> {
  const { data, error } = await supabase
    .from('saved_places')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(toSavedPlace);
}

// Upsert on the (user_id, place_id) unique constraint — Save is idempotent:
// saving an already-saved place updates nothing meaningful (same snapshot)
// rather than erroring or creating a duplicate row.
export async function savePlace(userId: string, place: NearbyPlace): Promise<void> {
  const { error } = await supabase.from('saved_places').upsert(
    {
      user_id: userId,
      place_id: place.id,
      name: place.name,
      category: place.category,
      address: place.address || null,
      latitude: place.lat,
      longitude: place.lon,
      locality: place.locationDetail?.locality ?? null,
      district: place.locationDetail?.district ?? null,
      state: place.locationDetail?.state ?? null,
      country: place.locationDetail?.country ?? null,
    },
    { onConflict: 'user_id,place_id' },
  );
  if (error) throw new Error(error.message);
}

export async function unsavePlace(userId: string, placeId: string): Promise<void> {
  const { error } = await supabase
    .from('saved_places')
    .delete()
    .eq('user_id', userId)
    .eq('place_id', placeId);
  if (error) throw new Error(error.message);
}
