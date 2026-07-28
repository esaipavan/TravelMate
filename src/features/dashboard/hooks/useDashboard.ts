import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import {
  getDashboardStats,
  getUpcomingTrips,
  getRecentExpenses,
  getBudgetVsActual,
  getCurrentTrip,
} from '../services/dashboard.service';

const STALE = 5 * 60 * 1000;

export function useDashboardStats() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: ['dashboard', 'stats', userId],
    queryFn: () => getDashboardStats(userId!),
    enabled: !!userId,
    staleTime: STALE,
  });
}

export function useUpcomingTrips() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: ['dashboard', 'upcoming', userId],
    queryFn: () => getUpcomingTrips(userId!),
    enabled: !!userId,
    staleTime: STALE,
  });
}

export function useRecentExpenses() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: ['dashboard', 'recent-expenses', userId],
    queryFn: () => getRecentExpenses(userId!),
    enabled: !!userId,
    staleTime: STALE,
  });
}

export function useBudgetVsActual() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: ['dashboard', 'budget-vs-actual', userId],
    queryFn: () => getBudgetVsActual(userId!),
    enabled: !!userId,
    staleTime: STALE,
  });
}

export function useCurrentTrip() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: ['dashboard', 'current-trip', userId],
    queryFn: () => getCurrentTrip(userId!),
    enabled: !!userId,
    staleTime: STALE,
  });
}
