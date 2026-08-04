import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getDashboardMetrics,
  getUserGrowth,
  getFeedbackList,
  getBugReportList,
  getUserList,
  getFeatureAdoption,
  updateFeedbackStatus,
  updateBugStatus,
  updateUserRole,
} from '../services/admin.service';

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['admin', 'metrics'],
    queryFn: getDashboardMetrics,
    staleTime: 2 * 60_000,
    refetchInterval: 5 * 60_000,
  });
}

export function useUserGrowth() {
  return useQuery({
    queryKey: ['admin', 'user-growth'],
    queryFn: getUserGrowth,
    staleTime: 10 * 60_000,
  });
}

export function useFeedbackList(status?: string) {
  return useQuery({
    queryKey: ['admin', 'feedback', status ?? 'all'],
    queryFn: () => getFeedbackList(status),
    staleTime: 60_000,
  });
}

export function useBugReportList(status?: string, severity?: string) {
  return useQuery({
    queryKey: ['admin', 'bugs', status ?? 'all', severity ?? 'all'],
    queryFn: () => getBugReportList(status, severity),
    staleTime: 60_000,
  });
}

export function useUserList() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: getUserList,
    staleTime: 5 * 60_000,
  });
}

export function useFeatureAdoption() {
  return useQuery({
    queryKey: ['admin', 'adoption'],
    queryFn: getFeatureAdoption,
    staleTime: 10 * 60_000,
  });
}

export function useUpdateFeedbackStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: string; notes?: string }) =>
      updateFeedbackStatus(id, status, notes),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'feedback'] });
      toast.success('Feedback updated');
    },
    onError: () => toast.error('Update failed'),
  });
}

export function useUpdateBugStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateBugStatus(id, status),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'bugs'] });
      toast.success('Bug report updated');
    },
    onError: () => toast.error('Update failed'),
  });
}

export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: 'user' | 'admin' }) => updateUserRole(id, role),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('Role updated');
    },
    onError: () => toast.error('Update failed'),
  });
}
