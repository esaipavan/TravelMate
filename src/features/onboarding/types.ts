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

export interface OnboardingData {
  travelerType: TravelerType | null;
  destination: string | null;
  dates: OnboardingDates | null;
  tripId: string | null;
  checklist: ChecklistItems;
}

export interface OnboardingState {
  version: 2;
  step: number;
  completed: boolean;
  checklistDismissed: boolean;
  data: OnboardingData;
}
