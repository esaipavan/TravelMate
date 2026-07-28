export type TimelineEventType = 'departure' | 'activity' | 'expense' | 'journal' | 'return';

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  date: string;
  time?: string;
  title: string;
  subtitle?: string;
  amount?: number;
  currency?: string;
  mood?: string;
  imageUrl?: string;
}

export interface TripStats {
  daysTotal: number;
  totalSpent: number;
  currency: string;
  journalEntries: number;
  photosCount: number;
  activitiesCount: number;
  citiesVisited: string[];
}
