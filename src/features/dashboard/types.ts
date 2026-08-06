export interface DashboardStats {
  totalTrips: number;
  totalBudget: number;
  totalExpenses: number;
  homeCurrency: string;
  travelDays: number;
}

export interface UpcomingTrip {
  id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  cover_image_url: string | null;
  currency: string;
  total_budget: number | null;
  // Phase 6: additional trip info from onboarding
  destination_category?: string | null;
  group_type?: string | null;
  budget_tier?: string | null;
  // Phase 6: from joined trip_briefs
  ai_brief_status?: 'generating' | 'complete' | 'failed' | null;
  weather_brief?: string | null;
}

export interface RecentExpense {
  id: string;
  title: string;
  amount: number;
  currency: string;
  category: string;
  date: string;
  trip_id: string;
  trip_title: string | null;
}

export interface BudgetVsActualItem {
  tripId: string;
  name: string;
  budget: number;
  actual: number;
}

export interface WeatherData {
  temperature: number;
  weathercode: number;
  windspeed: number;
  is_day: number;
  location: string;
}
