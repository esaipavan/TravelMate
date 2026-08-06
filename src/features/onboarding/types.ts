// ── Onboarding 2.0 — v3 types ─────────────────────────────────────────────────

export type DestinationCategory =
  'hill_station' | 'beach' | 'pilgrimage' | 'heritage' | 'wildlife' | 'international' | 'custom';

export type GroupType = 'solo' | 'couple' | 'friends' | 'family' | 'family_elders' | 'business';

export type BudgetTier = 'budget' | 'comfort' | 'premium' | 'luxury';

export interface OnboardingData {
  // v3 fields
  destination: string | null;
  destinationCategory: DestinationCategory | null;
  startDate: string | null; // YYYY-MM-DD
  endDate: string | null; // YYYY-MM-DD
  groupType: GroupType | null;
  budgetTier: BudgetTier | null; // null = user skipped
  tripId: string | null;
  aiBriefId: string | null;
  // v2 compat fields — kept so existing OnboardingPage.tsx compiles until Phase 3 replacement
  travelerType: TravelerType | null;
  dates: OnboardingDates | null;
  checklist: ChecklistItems;
}

export interface OnboardingState {
  version: 3;
  step: number;
  completed: boolean;
  checklistDismissed: boolean; // legacy compat — kept so WelcomeChecklist compiles until Dashboard migration
  data: OnboardingData;
}

// ── Legacy v2 types (backward-compat exports) ──────────────────────────────────
// Removed from active use in v3; kept so existing consumers compile until Phase 3 / Dashboard migration.

export type TravelerType = 'adventure' | 'culture' | 'relaxation' | 'business';

export interface OnboardingDates {
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
}

export interface ChecklistItems {
  tripCreated: boolean;
  expenseLogged: boolean;
  aiUsed: boolean;
  documentAdded: boolean;
  companionInvited: boolean;
}
