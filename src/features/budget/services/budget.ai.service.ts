import { chatWithAI } from '@/services/ai/ai.service';
import type { ExpenseCategory } from '../types';

export type BudgetStyleValue = 'budget' | 'comfort' | 'luxury';

export interface BudgetStyle {
  value: BudgetStyleValue;
  label: string;
  description: string;
  emoji: string;
}

export const BUDGET_STYLES: BudgetStyle[] = [
  {
    value: 'budget',
    label: 'Budget',
    emoji: '🎒',
    description: 'Hostels, street food, public transport',
  },
  {
    value: 'comfort',
    label: 'Comfort',
    emoji: '🏨',
    description: 'Mid-range hotels, restaurants, occasional taxi',
  },
  {
    value: 'luxury',
    label: 'Luxury',
    emoji: '✨',
    description: '5-star hotels, fine dining, private transfers',
  },
];

export interface AIBudgetEstimate {
  allocations: Partial<Record<ExpenseCategory, number>>;
  totalEstimate: number;
  notes: string;
}

const CATEGORIES: ExpenseCategory[] = [
  'hotel',
  'food',
  'transport',
  'shopping',
  'activity',
  'fuel',
  'taxi',
  'emergency',
  'misc',
];

export async function getAIBudgetEstimate(
  destination: string,
  days: number,
  style: BudgetStyleValue,
  currency: string,
): Promise<AIBudgetEstimate> {
  const styleLabel = BUDGET_STYLES.find((s) => s.value === style)?.label ?? style;

  const prompt = `You are a travel budget expert. Estimate a realistic budget for a ${styleLabel} trip to ${destination} for ${days} day${days !== 1 ? 's' : ''}.

Return ONLY a JSON object, with no markdown, no backticks, no explanation:
{
  "hotel": <number>,
  "food": <number>,
  "transport": <number>,
  "shopping": <number>,
  "activity": <number>,
  "fuel": <number>,
  "taxi": <number>,
  "emergency": <number>,
  "misc": <number>,
  "totalEstimate": <number>,
  "notes": "<one-sentence travel tip for ${destination}>"
}

All amounts are in ${currency} for the ENTIRE ${days}-day trip. Base estimates on real typical costs in ${destination}. For budget style, prefer cheaper options; for luxury, use premium rates.`;

  const response = await chatWithAI([{ role: 'user', content: prompt }]);
  const content = response.content;

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(content) as Record<string, unknown>;
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('AI returned an unexpected format. Please try again.');
    parsed = JSON.parse(match[0]) as Record<string, unknown>;
  }

  const allocations: Partial<Record<ExpenseCategory, number>> = {};
  for (const cat of CATEGORIES) {
    const val = parsed[cat];
    if (typeof val === 'number' && val > 0) {
      allocations[cat] = Math.round(val);
    }
  }

  const total =
    typeof parsed.totalEstimate === 'number'
      ? Math.round(parsed.totalEstimate)
      : Object.values(allocations).reduce<number>((s, v) => s + (v ?? 0), 0);

  return {
    allocations,
    totalEstimate: total,
    notes: typeof parsed.notes === 'string' ? parsed.notes : '',
  };
}
