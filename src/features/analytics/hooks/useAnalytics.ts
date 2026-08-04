import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, subMonths, differenceInDays, parseISO } from 'date-fns';
import { useAuthStore } from '@/store/auth.store';
import { getTrips } from '@/features/trips/services/trips.service';
import { getDocuments } from '@/features/documents/services/documents.service';
import { getReminders } from '@/features/reminders/services/reminders.service';
import { getAllExpenses, getAllJournalEntries } from '../services/analytics.service';
import { getEffectiveStatus } from '@/features/reminders/types';
import { getExpiryStatus } from '@/features/documents/types';
import { EXPENSE_CATEGORIES } from '@/utils/constants';
import { getTripStatus } from '@/utils/tripStatus';
import type { AnalyticsFilters } from '../types';

const ANA_KEY = (uid: string) => ['analytics', uid] as const;

export function useAnalyticsData(filters: AnalyticsFilters) {
  const { user } = useAuthStore();
  const uid = user?.id ?? '';

  const {
    data: trips = [],
    isLoading: tripsLoading,
    isError: tripsError,
    refetch: refetchTrips,
  } = useQuery({
    queryKey: ['trips', uid],
    queryFn: () => getTrips(uid),
    enabled: !!uid,
    staleTime: 5 * 60_000,
  });

  const {
    data: expenses = [],
    isLoading: expLoading,
    isError: expError,
    refetch: refetchExp,
  } = useQuery({
    queryKey: [...ANA_KEY(uid), 'expenses'],
    queryFn: () => getAllExpenses(uid),
    enabled: !!uid,
    staleTime: 2 * 60_000,
  });

  const {
    data: journalEntries = [],
    isLoading: journalLoading,
    isError: journalError,
    refetch: refetchJournal,
  } = useQuery({
    queryKey: [...ANA_KEY(uid), 'journal'],
    queryFn: () => getAllJournalEntries(uid),
    enabled: !!uid,
    staleTime: 5 * 60_000,
  });

  const {
    data: documents = [],
    isLoading: docsLoading,
    isError: docsError,
    refetch: refetchDocs,
  } = useQuery({
    queryKey: ['documents', uid],
    queryFn: () => getDocuments(uid),
    enabled: !!uid,
    staleTime: 5 * 60_000,
  });

  const {
    data: reminders = [],
    isLoading: remLoading,
    isError: remError,
    refetch: refetchRem,
  } = useQuery({
    queryKey: ['reminders', uid],
    queryFn: () => getReminders(uid),
    enabled: !!uid,
    staleTime: 2 * 60_000,
  });

  const isLoading = tripsLoading || expLoading || journalLoading || docsLoading || remLoading;
  const isError = tripsError || expError || journalError || docsError || remError;
  const refetch = () => {
    void refetchTrips();
    void refetchExp();
    void refetchJournal();
    void refetchDocs();
    void refetchRem();
  };

  // ── Apply trip-level filters ───────────────────────────────────────────────
  const filteredTrips = useMemo(() => {
    let result = [...trips];
    if (filters.tripId) {
      result = result.filter((t) => t.id === filters.tripId);
    }
    if (filters.country) {
      const c = filters.country.toLowerCase();
      result = result.filter(
        (t) =>
          t.destination.toLowerCase().includes(c) ||
          (t.country_code ?? '').toLowerCase().includes(c),
      );
    }
    if (filters.dateFrom) result = result.filter((t) => t.end_date >= filters.dateFrom);
    if (filters.dateTo) result = result.filter((t) => t.start_date <= filters.dateTo);
    return result;
  }, [trips, filters]);

  const filteredTripIds = useMemo(() => new Set(filteredTrips.map((t) => t.id)), [filteredTrips]);

  const filteredExpenses = useMemo(() => {
    let result = expenses.filter((e) => filteredTripIds.has(e.trip_id));
    if (filters.dateFrom) result = result.filter((e) => e.date >= filters.dateFrom);
    if (filters.dateTo) result = result.filter((e) => e.date <= filters.dateTo);
    return result;
  }, [expenses, filteredTripIds, filters]);

  const filteredJournal = useMemo(
    () => journalEntries.filter((j) => filteredTripIds.has(j.trip_id)),
    [journalEntries, filteredTripIds],
  );

  // Expense total per trip — single O(n) pass shared by kpis, budgetVsActual, and insights.
  // Eliminates three independent O(expenses × trips) scans those memos previously performed.
  const expensesByTripId = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of filteredExpenses) {
      map.set(e.trip_id, (map.get(e.trip_id) ?? 0) + e.amount);
    }
    return map;
  }, [filteredExpenses]);

  // ── Currency (most common among filtered trips) ───────────────────────────
  const currency = useMemo(() => {
    if (!filteredTrips.length) return 'INR';
    const counts = new Map<string, number>();
    for (const t of filteredTrips) {
      counts.set(t.currency, (counts.get(t.currency) ?? 0) + 1);
    }
    const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] ?? 'INR';
  }, [filteredTrips]);

  // ── KPI cards ────────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const totalTrips = filteredTrips.length;
    const upcomingTrips = filteredTrips.filter((t) => getTripStatus(t) === 'upcoming').length;
    const completedTrips = filteredTrips.filter((t) => getTripStatus(t) === 'completed').length;
    const countriesVisited = new Set(filteredTrips.map((t) => t.country_code ?? t.destination))
      .size;
    const totalBudget = filteredTrips.reduce((s, t) => s + (t.total_budget ?? 0), 0);
    const totalExpenses = Array.from(expensesByTripId.values()).reduce((s, v) => s + v, 0);
    const budgetRemaining = totalBudget - totalExpenses;
    // Avg Trip Cost = Total Budget ÷ Trip Count (shows '—' in KPICards when 0).
    const avgTripCost = totalTrips > 0 && totalBudget > 0 ? totalBudget / totalTrips : 0;

    return {
      totalTrips,
      upcomingTrips,
      completedTrips,
      countriesVisited,
      totalBudget,
      totalExpenses,
      budgetRemaining,
      avgTripCost,
    };
  }, [filteredTrips, expensesByTripId]);

  // ── Chart: monthly expenses (last 12 months) ─────────────────────────────
  const monthlyExpenses = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 12 }, (_, i) => {
      const d = subMonths(now, 11 - i);
      return { key: format(d, 'yyyy-MM'), label: format(d, 'MMM yy'), amount: 0 };
    });
    const monthMap = new Map(months.map((m) => [m.key, m]));
    for (const e of filteredExpenses) {
      const entry = monthMap.get(e.date.slice(0, 7));
      if (entry) entry.amount += e.amount;
    }
    return months.map(({ label, amount }) => ({ month: label, amount: Math.round(amount) }));
  }, [filteredExpenses]);

  // ── Chart: expense by category ────────────────────────────────────────────
  const expenseByCategory = useMemo(() => {
    const map = new Map<string, { name: string; value: number; emoji: string }>();
    for (const e of filteredExpenses) {
      const meta = EXPENSE_CATEGORIES.find((c) => c.value === e.category);
      const entry = map.get(e.category) ?? {
        name: meta?.label ?? e.category,
        value: 0,
        emoji: meta?.emoji ?? '📦',
      };
      entry.value += e.amount;
      map.set(e.category, entry);
    }
    return Array.from(map.values())
      .filter((e) => e.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [filteredExpenses]);

  // ── Chart: budget vs actual (top 6 trips with budget set) ────────────────
  const budgetVsActual = useMemo(
    () =>
      filteredTrips
        .filter((t) => t.total_budget && t.total_budget > 0)
        .map((t) => {
          const actual = expensesByTripId.get(t.id) ?? 0;
          const title = t.title.length > 12 ? t.title.slice(0, 12) + '…' : t.title;
          return { name: title, budget: t.total_budget ?? 0, actual: Math.round(actual) };
        })
        .sort((a, b) => b.budget - a.budget)
        .slice(0, 6),
    [filteredTrips, expensesByTripId],
  );

  // ── Chart: trips started per month (last 12 months) ──────────────────────
  const tripsPerMonth = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 12 }, (_, i) => {
      const d = subMonths(now, 11 - i);
      return { key: format(d, 'yyyy-MM'), label: format(d, 'MMM yy'), count: 0 };
    });
    const monthMap = new Map(months.map((m) => [m.key, m]));
    for (const t of filteredTrips) {
      const entry = monthMap.get(t.start_date.slice(0, 7));
      if (entry) entry.count += 1;
    }
    return months.map(({ label, count }) => ({ month: label, count }));
  }, [filteredTrips]);

  // ── Chart: journal avg rating by destination ──────────────────────────────
  const journalRatings = useMemo(() => {
    const map = new Map<string, { total: number; count: number }>();
    for (const j of filteredJournal) {
      if (!j.rating) continue;
      const dest = j.location_name ?? 'Unknown';
      const entry = map.get(dest) ?? { total: 0, count: 0 };
      entry.total += j.rating;
      entry.count += 1;
      map.set(dest, entry);
    }
    return Array.from(map.entries())
      .map(([destination, { total, count }]) => ({
        destination,
        rating: parseFloat((total / count).toFixed(1)),
        count,
      }))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 8);
  }, [filteredJournal]);

  // ── Chart: reminder status (all reminders, not trip-filtered) ────────────
  const reminderStatus = useMemo(() => {
    let pending = 0,
      completed = 0,
      overdue = 0;
    for (const r of reminders) {
      const s = getEffectiveStatus(r);
      if (s === 'completed') completed++;
      else if (s === 'overdue') overdue++;
      else pending++;
    }
    return [
      { name: 'Pending', value: pending, color: '#3b82f6' },
      { name: 'Completed', value: completed, color: '#10b981' },
      { name: 'Overdue', value: overdue, color: '#ef4444' },
    ].filter((e) => e.value > 0);
  }, [reminders]);

  // ── Insights ──────────────────────────────────────────────────────────────
  const insights = useMemo(() => {
    // Per-trip spending
    const tripSpending = filteredTrips
      .map((t) => ({
        title: t.title,
        amount: expensesByTripId.get(t.id) ?? 0,
      }))
      .filter((t) => t.amount > 0);

    const highestSpendingTrip = tripSpending.length
      ? tripSpending.reduce((mx, t) => (t.amount > mx.amount ? t : mx))
      : null;

    const lowestSpendingTrip = tripSpending.length
      ? tripSpending.reduce((mn, t) => (t.amount < mn.amount ? t : mn))
      : null;

    // Most visited destination
    const destCount = new Map<string, number>();
    for (const t of filteredTrips) {
      destCount.set(t.destination, (destCount.get(t.destination) ?? 0) + 1);
    }
    const mostVisitedDest = destCount.size
      ? Array.from(destCount.entries()).sort((a, b) => b[1] - a[1])[0][0]
      : '—';

    // Average trip duration
    const durations = filteredTrips
      .map((t) => {
        try {
          return differenceInDays(parseISO(t.end_date), parseISO(t.start_date)) + 1;
        } catch {
          return 0;
        }
      })
      .filter((d) => d > 0);
    const avgTripDuration = durations.length
      ? Math.round(durations.reduce((s, d) => s + d, 0) / durations.length)
      : 0;

    // Average journal rating
    const ratings = filteredJournal.map((j) => j.rating).filter((r): r is number => r !== null);
    const avgJournalRating = ratings.length
      ? parseFloat((ratings.reduce((s, r) => s + r, 0) / ratings.length).toFixed(1))
      : 0;

    // Documents expiring within 30 days
    const docsExpiringSoon = documents.filter(
      (d) => getExpiryStatus(d.expiry_date) === 'expiring_soon',
    ).length;

    // Pending reminders
    const upcomingRemindersCount = reminders.filter(
      (r) => getEffectiveStatus(r) === 'pending',
    ).length;

    // Budget utilisation
    const totalBudget = filteredTrips.reduce((s, t) => s + (t.total_budget ?? 0), 0);
    const totalSpent = Array.from(expensesByTripId.values()).reduce((s, v) => s + v, 0);
    const budgetUtilization = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

    return {
      highestSpendingTrip,
      lowestSpendingTrip,
      mostVisitedDest,
      avgTripDuration,
      avgJournalRating,
      docsExpiringSoon,
      upcomingRemindersCount,
      budgetUtilization,
    };
  }, [filteredTrips, expensesByTripId, filteredJournal, documents, reminders]);

  return {
    isLoading,
    isError,
    refetch,
    trips,
    filteredTrips,
    filteredExpenses,
    currency,
    kpis,
    monthlyExpenses,
    expenseByCategory,
    budgetVsActual,
    tripsPerMonth,
    journalRatings,
    reminderStatus,
    insights,
  };
}
