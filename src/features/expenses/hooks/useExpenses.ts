import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { track } from '@/lib/analytics';
import {
  getExpenseData,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../services/expenses.service';
import type { ExpenseInsert, ExpenseUpdate } from '../types';

export function useExpenseData(tripId: string) {
  return useQuery({
    queryKey: ['expenses', tripId],
    queryFn: () => getExpenseData(tripId),
    enabled: !!tripId,
    staleTime: 2 * 60 * 1000,
  });
}

function invalidate(qc: ReturnType<typeof useQueryClient>, tripId: string) {
  void qc.invalidateQueries({ queryKey: ['expenses', tripId] });
  void qc.invalidateQueries({ queryKey: ['budget', tripId] });
  void qc.invalidateQueries({ queryKey: ['dashboard'] });
}

export function useCreateExpense(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ExpenseInsert) => createExpense(data),
    onSuccess: (result) => {
      track('expense_added', { trip_id: tripId, category: result.category, amount: result.amount });
      invalidate(qc, tripId);
    },
  });
}

export function useUpdateExpense(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ExpenseUpdate }) => updateExpense(id, data),
    onSuccess: () => invalidate(qc, tripId),
  });
}

export function useDeleteExpense(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    onSuccess: () => invalidate(qc, tripId),
  });
}
