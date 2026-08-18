import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useExpenseData } from '@/features/expenses/hooks/useExpenses';
import { chatWithAI } from '@/services/ai/ai.service';
import { buildBudgetAdvisorPrompt } from '../services/concierge.prompts';
import { computeTripInsight, computeBudgetAnalysis } from '../services/recommendation.engine';
import type { TripRow } from '@/features/trips/types';
import type { BudgetAnalysis } from '../types';

export interface BudgetTip {
  title: string;
  body: string;
  emoji: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface BudgetAdvisorData {
  budgetAnalysis: BudgetAnalysis | null;
  categoryBreakdown: { category: string; amount: number; percentage: number }[];
  tips: BudgetTip[];
  isLoading: boolean;
  isAILoading: boolean;
}

function isBudgetTip(x: unknown): x is BudgetTip {
  return (
    typeof x === 'object' &&
    x !== null &&
    typeof (x as Record<string, unknown>).title === 'string' &&
    typeof (x as Record<string, unknown>).body === 'string'
  );
}

export function useBudgetAdvisor(trip: TripRow | null): BudgetAdvisorData {
  const TODAY = new Date().toISOString().split('T')[0];

  const { data: expenseData, isLoading } = useExpenseData(trip?.id ?? '');

  const insight = useMemo(() => (trip ? computeTripInsight(trip, TODAY) : null), [trip, TODAY]);

  const budgetAnalysis = useMemo(
    () => (trip && insight ? computeBudgetAnalysis(trip, expenseData ?? null, insight) : null),
    [trip, expenseData, insight],
  );

  const categoryBreakdown = useMemo(() => {
    if (!expenseData?.expenses.length || !budgetAnalysis) return [];
    const raw: Record<string, number> = {};
    for (const exp of expenseData.expenses) {
      raw[exp.category] = (raw[exp.category] ?? 0) + exp.amount;
    }
    return Object.entries(raw)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage:
          budgetAnalysis.totalSpent > 0
            ? Math.round((amount / budgetAnalysis.totalSpent) * 100)
            : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenseData, budgetAnalysis]);

  const rawBreakdown = useMemo(() => {
    const raw: Record<string, number> = {};
    for (const exp of expenseData?.expenses ?? []) {
      raw[exp.category] = (raw[exp.category] ?? 0) + exp.amount;
    }
    return raw;
  }, [expenseData]);

  const aiEnabled = !!trip && !!budgetAnalysis && !isLoading;

  const { data: tips = [], isLoading: isAILoading } = useQuery<BudgetTip[], Error>({
    queryKey: ['ai-budget-advisor', trip?.id, TODAY, expenseData?.expenses.length],
    queryFn: async () => {
      if (!trip || !budgetAnalysis) return [];
      const messages = buildBudgetAdvisorPrompt(trip, budgetAnalysis, rawBreakdown);
      const res = await chatWithAI(messages);
      const match = res.content.match(/\[[\s\S]*\]/);
      if (!match) return [];
      const parsed = JSON.parse(match[0]) as unknown[];
      return parsed.filter(isBudgetTip).map((t) => ({
        title: t.title,
        body: t.body,
        emoji: t.emoji ?? '💡',
        severity: ['info', 'warning', 'critical'].includes(t.severity) ? t.severity : 'info',
      }));
    },
    enabled: aiEnabled,
    staleTime: 60 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
    retry: 1,
  });

  return {
    budgetAnalysis,
    categoryBreakdown,
    tips,
    isLoading,
    isAILoading,
  };
}
