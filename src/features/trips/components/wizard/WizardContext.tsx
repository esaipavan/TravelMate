/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
  type Dispatch,
} from 'react';
import type { DestinationInfo } from './destinationData';

/* ── Trip type ───────────────────────────────────────────────────── */

export type TripType =
  'solo' | 'couple' | 'friends' | 'family' | 'business' | 'backpacking' | 'luxury' | 'road-trip';

export const TRIP_TYPE_META: Record<
  TripType,
  { label: string; emoji: string; description: string }
> = {
  solo: { label: 'Solo', emoji: '🧳', description: 'Self-discovery and freedom on your own terms' },
  couple: { label: 'Couple', emoji: '💑', description: 'Romantic getaway for two' },
  friends: { label: 'Friends', emoji: '🎉', description: 'Unforgettable memories with your crew' },
  family: { label: 'Family', emoji: '👨‍👩‍👧‍👦', description: 'Adventures built for all ages' },
  business: { label: 'Business', emoji: '💼', description: 'Work, meet, explore between meetings' },
  backpacking: {
    label: 'Backpacking',
    emoji: '🎒',
    description: 'Budget-friendly exploration and hostels',
  },
  luxury: { label: 'Luxury', emoji: '✨', description: 'Five-star indulgence, no compromises' },
  'road-trip': { label: 'Road Trip', emoji: '🚗', description: 'The journey is the destination' },
};

/* ── Budget ──────────────────────────────────────────────────────────────
 * Plain numeric entry, not sliders: one required-feeling but actually
 * optional total, plus an optional per-category breakdown. Values are kept
 * as raw strings while editing (never forced to 0) so an empty field reads
 * as "not set" rather than "zero", and partial/invalid input never gets
 * silently coerced or dropped until the user actually submits. Category
 * keys reuse the existing `expense_category` DB enum — no new categories. */

export type BudgetCategoryKey = 'hotel' | 'transport' | 'food' | 'activity' | 'misc';

export const BUDGET_CATEGORIES: { key: BudgetCategoryKey; label: string; icon: string }[] = [
  { key: 'hotel', label: 'Accommodation', icon: '🏨' },
  { key: 'transport', label: 'Transport', icon: '✈️' },
  { key: 'food', label: 'Food', icon: '🍽️' },
  { key: 'activity', label: 'Activities', icon: '🎯' },
  { key: 'misc', label: 'Other', icon: '📦' },
];

export interface BudgetState {
  total: string;
  breakdown: Record<BudgetCategoryKey, string>;
}

const EMPTY_BREAKDOWN: Record<BudgetCategoryKey, string> = {
  hotel: '',
  transport: '',
  food: '',
  activity: '',
  misc: '',
};

/** Parses a raw budget input string. Empty/whitespace is "not set" (null),
 * anything else must be a finite non-negative number or it's invalid (null
 * is also returned for invalid input — callers distinguish the two cases
 * by checking whether the trimmed raw string was empty). */
export function parseBudgetValue(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === '') return null;
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

export function isBudgetValueValid(raw: string): boolean {
  return raw.trim() === '' || parseBudgetValue(raw) !== null;
}

export function allocatedTotal(breakdown: Record<BudgetCategoryKey, string>): number {
  return BUDGET_CATEGORIES.reduce(
    (sum, cat) => sum + (parseBudgetValue(breakdown[cat.key]) ?? 0),
    0,
  );
}

/** Total to persist onto `trips.total_budget` — null when not entered. */
export function resolveTotalBudget(budget: BudgetState): number | null {
  return parseBudgetValue(budget.total);
}

/** Only the meaningfully-entered category amounts (never zero-value rows). */
export function resolveBudgetBreakdown(
  budget: BudgetState,
): Partial<Record<BudgetCategoryKey, number>> {
  const result: Partial<Record<BudgetCategoryKey, number>> = {};
  for (const cat of BUDGET_CATEGORIES) {
    const value = parseBudgetValue(budget.breakdown[cat.key]);
    if (value !== null && value > 0) result[cat.key] = value;
  }
  return result;
}

/* ── State ───────────────────────────────────────────────────────── */

export interface WizardState {
  currentStep: number;
  direction: 1 | -1;
  // Step 1
  destination: string;
  destinationMeta: DestinationInfo | null;
  // Step 2
  tripType: TripType | null;
  // Step 3
  startDate: string;
  endDate: string;
  // Step 4
  budget: BudgetState;
  currency: string;
}

/* ── Actions ─────────────────────────────────────────────────────── */

export type WizardAction =
  | { type: 'STEP_TO'; step: number; direction: 1 | -1 }
  | { type: 'SET_DESTINATION'; destination: string; meta: DestinationInfo | null }
  | { type: 'SET_TRIP_TYPE'; tripType: TripType }
  | { type: 'SET_DATES'; startDate: string; endDate: string }
  | { type: 'SET_BUDGET_TOTAL'; value: string }
  | { type: 'SET_BUDGET_CATEGORY'; category: BudgetCategoryKey; value: string }
  | { type: 'SET_CURRENCY'; currency: string };

/* ── Reducer ─────────────────────────────────────────────────────── */

const INITIAL: WizardState = {
  currentStep: 0,
  direction: 1,
  destination: '',
  destinationMeta: null,
  tripType: null,
  startDate: '',
  endDate: '',
  budget: { total: '', breakdown: { ...EMPTY_BREAKDOWN } },
  currency: 'INR',
};

function reduce(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'STEP_TO':
      return { ...state, currentStep: action.step, direction: action.direction };
    case 'SET_DESTINATION':
      return { ...state, destination: action.destination, destinationMeta: action.meta };
    case 'SET_TRIP_TYPE':
      return { ...state, tripType: action.tripType };
    case 'SET_DATES':
      return { ...state, startDate: action.startDate, endDate: action.endDate };
    case 'SET_BUDGET_TOTAL':
      return { ...state, budget: { ...state.budget, total: action.value } };
    case 'SET_BUDGET_CATEGORY':
      return {
        ...state,
        budget: {
          ...state.budget,
          breakdown: { ...state.budget.breakdown, [action.category]: action.value },
        },
      };
    case 'SET_CURRENCY':
      return { ...state, currency: action.currency };
    default:
      return state;
  }
}

/* ── Context ─────────────────────────────────────────────────────── */

export const TOTAL_STEPS = 5;

export function canProceed(step: number, state: WizardState): boolean {
  switch (step) {
    case 0:
      return state.destination.trim().length > 0;
    case 1:
      return state.tripType !== null;
    case 2:
      return state.startDate !== '' && state.endDate !== '' && state.endDate >= state.startDate;
    case 3:
      return (
        isBudgetValueValid(state.budget.total) &&
        BUDGET_CATEGORIES.every((cat) => isBudgetValueValid(state.budget.breakdown[cat.key]))
      );
    case 4:
      return true;
    default:
      return false;
  }
}

export function generateTripTitle(destination: string, tripType: TripType | null): string {
  const suffixes: Record<TripType, string> = {
    solo: 'Solo Adventure',
    couple: 'Romantic Getaway',
    friends: 'Friends Trip',
    family: 'Family Holiday',
    business: 'Business Trip',
    backpacking: 'Backpacking Journey',
    luxury: 'Luxury Escape',
    'road-trip': 'Road Trip',
  };
  const suffix = tripType ? suffixes[tripType] : 'Trip';
  return `${destination} ${suffix}`;
}

interface WizardCtx {
  state: WizardState;
  dispatch: Dispatch<WizardAction>;
  goNext: () => void;
  goBack: () => void;
}

const WizardContext = createContext<WizardCtx | null>(null);

export function WizardProvider({
  children,
  initialDestination,
}: {
  children: ReactNode;
  /** Prefills step 1 (e.g. from Explore's "Plan a trip to X"). Only the
   *  free-text destination is seeded; metadata stays null. */
  initialDestination?: string;
}) {
  const [state, dispatch] = useReducer(reduce, INITIAL, (init) => {
    const seed = initialDestination?.trim();
    return seed ? { ...init, destination: seed } : init;
  });

  const goNext = useCallback(() => {
    const next = Math.min(state.currentStep + 1, TOTAL_STEPS - 1);
    dispatch({ type: 'STEP_TO', step: next, direction: 1 });
  }, [state.currentStep]);

  const goBack = useCallback(() => {
    const prev = Math.max(state.currentStep - 1, 0);
    dispatch({ type: 'STEP_TO', step: prev, direction: -1 });
  }, [state.currentStep]);

  return (
    <WizardContext.Provider value={{ state, dispatch, goNext, goBack }}>
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard(): WizardCtx {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error('useWizard must be used inside WizardProvider');
  return ctx;
}
