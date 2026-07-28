import { chatWithAI } from '@/services/ai/ai.service';
import type { TripRow } from '@/features/trips/types';
import type { ExpenseData } from '@/features/expenses/types';
import type { DestinationData } from '@/features/destination-intel/types';
import {
  computeTripInsight,
  computeBudgetAnalysis,
  computePackingAnalysis,
  generateRecommendations,
} from './recommendation.engine';
import { buildCompanionPrompt } from './prompt.builder';
import type { Recommendation, BudgetAnalysis, PackingAnalysis, TripInsight } from '../types';

export interface CompanionData {
  recommendations: Recommendation[];
  budgetAnalysis: BudgetAnalysis | null;
  packingAnalysis: PackingAnalysis | null;
  tripInsight: TripInsight;
}

const PRIORITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

function isRec(r: unknown): r is Recommendation {
  return (
    typeof r === 'object' &&
    r !== null &&
    typeof (r as Record<string, unknown>).title === 'string' &&
    typeof (r as Record<string, unknown>).body === 'string' &&
    typeof (r as Record<string, unknown>).emoji === 'string'
  );
}

export async function buildCompanionData(
  trip: TripRow,
  expenseData: ExpenseData | null,
  intel: DestinationData | null,
  today: string,
): Promise<CompanionData> {
  const insight = computeTripInsight(trip, today);
  const budget = computeBudgetAnalysis(trip, expenseData, insight);
  const packing = computePackingAnalysis(intel);

  const engineRecs = generateRecommendations(trip, expenseData, intel, budget, insight);

  let llmRecs: Recommendation[] = [];
  try {
    const messages = buildCompanionPrompt(trip, intel, budget, insight);
    const response = await chatWithAI(messages);
    const jsonMatch = response.content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as unknown[];
      llmRecs = parsed.filter(isRec).map((r, i) => ({
        ...r,
        id: `llm-${i}-${r.id ?? 'tip'}`,
        dismissible: true,
        category: r.category ?? 'experience',
        priority: r.priority ?? 'low',
      }));
    }
  } catch (_err) {
    if (import.meta.env.DEV) {
      console.warn('[companion] LLM enhancement failed, using engine-only recommendations');
    }
  }

  const allRecs = [...engineRecs, ...llmRecs];
  allRecs.sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 4) - (PRIORITY_ORDER[b.priority] ?? 4));

  return {
    recommendations: allRecs,
    budgetAnalysis: budget,
    packingAnalysis: packing,
    tripInsight: insight,
  };
}
