import type { ChecklistCategory } from '@/features/destination-intel/types';

export type RecommendationPriority = 'critical' | 'high' | 'medium' | 'low';
export type RecommendationCategory =
  'weather' | 'budget' | 'packing' | 'timing' | 'safety' | 'experience' | 'alert';
export type BudgetStatus = 'on-track' | 'near-limit' | 'over-budget';
export type ActionType = 'view-budget' | 'view-packing' | 'view-intel' | 'view-safety';

export interface RecommendationAction {
  label: string;
  type: ActionType;
  tripId: string;
}

export interface Recommendation {
  id: string;
  category: RecommendationCategory;
  priority: RecommendationPriority;
  title: string;
  body: string;
  emoji: string;
  action?: RecommendationAction;
  dismissible: boolean;
}

export interface BudgetAnalysis {
  status: BudgetStatus;
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  percentUsed: number;
  daysElapsed: number;
  daysTotal: number;
  daysRemaining: number;
  dailyAllowance: number;
  dailyActual: number;
  projectedTotal: number;
  currency: string;
}

export interface PackingCategoryInfo {
  category: ChecklistCategory;
  label: string;
  emoji: string;
  total: number;
  required: number;
}

export interface PackingAnalysis {
  totalItems: number;
  totalRequired: number;
  categories: PackingCategoryInfo[];
}

export interface TripInsight {
  daysUntilTrip: number;
  daysIntoTrip: number;
  daysRemaining: number;
  daysTotal: number;
  isActive: boolean;
  isUpcoming: boolean;
  isCompleted: boolean;
}
