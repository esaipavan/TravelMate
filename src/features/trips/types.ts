import type { Database } from '@/types/database.types';

export type TripRow = Database['public']['Tables']['trips']['Row'];
export type TripInsert = Database['public']['Tables']['trips']['Insert'];
export type TripUpdate = Database['public']['Tables']['trips']['Update'];

export type TripStatus = Database['public']['Enums']['trip_status'];

// Page-level filter / sort / view types shared by TripsPage and AdventureHero
export type FilterStatus = TripStatus | 'upcoming' | 'all' | 'favourites';
export type SortKey = 'date-asc' | 'date-desc' | 'created-desc' | 'name-asc';
export type ViewMode = 'grid' | 'list';

export interface TripFormValues {
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  total_budget: number | undefined;
  currency: string;
  status: TripStatus;
  notes: string;
  is_public: boolean;
}
