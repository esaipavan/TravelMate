export type PlaceCategory =
  | 'restaurants'
  | 'hotels'
  | 'hospitals'
  | 'atms'
  | 'fuel'
  | 'attractions'
  | 'pharmacies'
  | 'shopping'
  | 'parks';

export const PLACE_CATEGORIES: {
  value: PlaceCategory;
  label: string;
  emoji: string;
}[] = [
  { value: 'restaurants', label: 'Restaurants', emoji: '🍽️' },
  { value: 'hotels', label: 'Hotels', emoji: '🏨' },
  { value: 'hospitals', label: 'Hospitals', emoji: '🏥' },
  { value: 'pharmacies', label: 'Pharmacies', emoji: '💊' },
  { value: 'atms', label: 'ATMs', emoji: '🏧' },
  { value: 'fuel', label: 'Fuel Stations', emoji: '⛽' },
  { value: 'shopping', label: 'Shopping', emoji: '🛍️' },
  { value: 'attractions', label: 'Attractions', emoji: '🎯' },
  { value: 'parks', label: 'Parks', emoji: '🌳' },
];

export const CATEGORY_META: Record<
  PlaceCategory,
  { emoji: string; label: string; color: string; gradient: string }
> = {
  restaurants: {
    emoji: '🍽️',
    label: 'Restaurants',
    color: '#f97316',
    gradient: 'from-orange-500 to-amber-500',
  },
  hotels: {
    emoji: '🏨',
    label: 'Hotels',
    color: '#6366f1',
    gradient: 'from-indigo-500 to-violet-500',
  },
  hospitals: {
    emoji: '🏥',
    label: 'Hospitals',
    color: '#ef4444',
    gradient: 'from-red-500 to-rose-500',
  },
  atms: { emoji: '🏧', label: 'ATMs', color: '#10b981', gradient: 'from-emerald-500 to-teal-500' },
  fuel: { emoji: '⛽', label: 'Fuel', color: '#f59e0b', gradient: 'from-amber-500 to-yellow-500' },
  attractions: {
    emoji: '🎯',
    label: 'Attractions',
    color: '#8b5cf6',
    gradient: 'from-violet-500 to-purple-500',
  },
  pharmacies: {
    emoji: '💊',
    label: 'Pharmacies',
    color: '#ec4899',
    gradient: 'from-pink-500 to-rose-400',
  },
  shopping: {
    emoji: '🛍️',
    label: 'Shopping',
    color: '#14b8a6',
    gradient: 'from-teal-500 to-cyan-500',
  },
  parks: {
    emoji: '🌳',
    label: 'Parks',
    color: '#22c55e',
    gradient: 'from-green-500 to-emerald-500',
  },
};

export interface NearbyPlace {
  id: string;
  name: string;
  address: string;
  category: PlaceCategory;
  lat: number;
  lon: number;
  distance: number;
  // Where this place result came from. Always 'geoapify' today — kept
  // explicit so a future second source (e.g. a places cache, curated data)
  // can be told apart in the UI rather than presented as equally trustworthy.
  source: 'geoapify';
  // enriched fields (optional — depends on Geoapify data availability)
  phone?: string;
  website?: string;
  openNow?: boolean;
  openingHours?: string;
}

export interface NearbyResult {
  location: string;
  lat: number;
  lon: number;
  places: NearbyPlace[];
  /** Radius (metres) that produced these results; equals the last radius tried when places is empty. */
  radiusM: number;
}

// ── Formatting helpers ────────────────────────────────────────────────────────

export function formatDistance(m: number): string {
  if (m < 1000) return `${m} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

export function travelTime(distanceM: number): { walk: string; drive: string } {
  const walkMins = Math.max(1, Math.round(distanceM / 83.3)); // 5 km/h
  const driveMins = Math.max(1, Math.round(distanceM / 500)); // 30 km/h
  const fmt = (m: number) => (m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`);
  return { walk: `${fmt(walkMins)} walk`, drive: `${fmt(driveMins)} drive` };
}
