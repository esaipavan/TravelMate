import { supabase } from '@/lib/supabase';
import type { DashboardStats, UpcomingTrip, RecentExpense, BudgetVsActualItem } from '../types';

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const [
    { count: totalTrips, error: e1 },
    { data: tripBudgets, error: e2 },
    { data: expenseRows, error: e3 },
    { data: profileRow, error: e4 },
    { data: tripDates, error: e5 },
  ] = await Promise.all([
    supabase.from('trips').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase
      .from('trips')
      .select('total_budget')
      .eq('user_id', userId)
      .not('total_budget', 'is', null),
    supabase.from('expenses').select('amount').eq('user_id', userId),
    supabase.from('profiles').select('home_currency').eq('id', userId).single(),
    supabase
      .from('trips')
      .select('start_date, end_date')
      .eq('user_id', userId)
      .neq('status', 'cancelled'),
  ]);

  const firstError = e1 ?? e2 ?? e3 ?? e4 ?? e5;
  if (firstError) throw new Error(firstError.message);

  const totalBudget = (tripBudgets ?? []).reduce((sum, t) => sum + (t.total_budget ?? 0), 0);
  const totalExpenses = (expenseRows ?? []).reduce((sum, e) => sum + (e.amount ?? 0), 0);
  const homeCurrency = (profileRow as { home_currency: string } | null)?.home_currency ?? 'INR';

  const travelDays = (tripDates ?? []).reduce((acc, t) => {
    const start = new Date(t.start_date + 'T00:00:00').getTime();
    const end = new Date(t.end_date + 'T00:00:00').getTime();
    const days = Math.max(0, Math.round((end - start) / 86_400_000) + 1);
    return acc + days;
  }, 0);

  return {
    totalTrips: totalTrips ?? 0,
    totalBudget,
    totalExpenses,
    homeCurrency,
    travelDays,
  };
}

export async function getUpcomingTrips(userId: string): Promise<UpcomingTrip[]> {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('trips')
    .select(
      'id, title, destination, start_date, end_date, status, cover_image_url, currency, total_budget, destination_category, group_type, budget_tier, trip_briefs(status, weather_summary)',
    )
    .eq('user_id', userId)
    .neq('status', 'cancelled')
    .gte('start_date', today)
    .order('start_date')
    .limit(3);

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const brief = row.trip_briefs;
    const wObj =
      typeof brief?.weather_summary === 'object' &&
      brief.weather_summary !== null &&
      !Array.isArray(brief.weather_summary)
        ? (brief.weather_summary as Record<string, unknown>)
        : null;
    return {
      id: row.id,
      title: row.title,
      destination: row.destination,
      start_date: row.start_date,
      end_date: row.end_date,
      status: row.status,
      cover_image_url: row.cover_image_url ?? null,
      currency: row.currency,
      total_budget: row.total_budget ?? null,
      destination_category: row.destination_category ?? null,
      group_type: row.group_type ?? null,
      budget_tier: row.budget_tier ?? null,
      ai_brief_status: brief?.status ?? null,
      weather_brief: typeof wObj?.expected === 'string' ? wObj.expected : null,
    };
  });
}

export async function getRecentExpenses(userId: string): Promise<RecentExpense[]> {
  const { data: expenses, error: expensesError } = await supabase
    .from('expenses')
    .select('id, title, amount, currency, category, date, trip_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5);

  if (expensesError) throw new Error(expensesError.message);
  if (!expenses || expenses.length === 0) return [];

  const tripIds = [...new Set(expenses.map((e) => e.trip_id))];

  const { data: trips, error: tripsError } = await supabase
    .from('trips')
    .select('id, title')
    .in('id', tripIds);

  if (tripsError) throw new Error(tripsError.message);

  const tripMap = new Map((trips ?? []).map((t) => [t.id, t.title]));

  return expenses.map((e) => ({
    id: e.id,
    title: e.title,
    amount: e.amount,
    currency: e.currency,
    category: e.category,
    date: e.date,
    trip_id: e.trip_id,
    trip_title: tripMap.get(e.trip_id) ?? null,
  }));
}

export async function getCurrentTrip(userId: string): Promise<UpcomingTrip | null> {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('trips')
    .select(
      'id, title, destination, start_date, end_date, status, cover_image_url, currency, total_budget',
    )
    .eq('user_id', userId)
    .neq('status', 'cancelled')
    .lte('start_date', today)
    .gte('end_date', today)
    .order('start_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as UpcomingTrip | null;
}

export async function getBudgetVsActual(userId: string): Promise<BudgetVsActualItem[]> {
  const { data: trips, error: tripsError } = await supabase
    .from('trips')
    .select('id, title, total_budget')
    .eq('user_id', userId)
    .not('total_budget', 'is', null)
    .order('created_at', { ascending: false })
    .limit(5);

  if (tripsError) throw new Error(tripsError.message);
  if (!trips || trips.length === 0) return [];

  const tripIds = trips.map((t) => t.id);

  const { data: expenses, error: expensesError } = await supabase
    .from('expenses')
    .select('trip_id, amount')
    .in('trip_id', tripIds);

  if (expensesError) throw new Error(expensesError.message);

  const spentByTrip = new Map<string, number>();
  for (const e of expenses ?? []) {
    spentByTrip.set(e.trip_id, (spentByTrip.get(e.trip_id) ?? 0) + e.amount);
  }

  return trips
    .map((t) => ({
      tripId: t.id,
      name: t.title.length > 12 ? `${t.title.slice(0, 11)}…` : t.title,
      budget: t.total_budget ?? 0,
      actual: spentByTrip.get(t.id) ?? 0,
    }))
    .reverse();
}
