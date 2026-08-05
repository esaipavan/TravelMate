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

/* ── Budget ──────────────────────────────────────────────────────── */

export interface BudgetAllocation {
  accommodation: number;
  food: number;
  transport: number;
  activities: number;
  shopping: number;
  emergency: number;
  visa: number;
  insurance: number;
}

export const BUDGET_CATEGORIES: {
  key: keyof BudgetAllocation;
  label: string;
  icon: string;
  color: string;
}[] = [
  { key: 'accommodation', label: 'Accommodation', icon: '🏨', color: '#6366F1' },
  { key: 'food', label: 'Food & Dining', icon: '🍽️', color: '#F59E0B' },
  { key: 'transport', label: 'Transport', icon: '✈️', color: '#0EA5E9' },
  { key: 'activities', label: 'Activities', icon: '🎯', color: '#10B981' },
  { key: 'shopping', label: 'Shopping', icon: '🛍️', color: '#EC4899' },
  { key: 'emergency', label: 'Emergency Fund', icon: '🆘', color: '#EF4444' },
  { key: 'visa', label: 'Visa & Permits', icon: '📋', color: '#8B5CF6' },
  { key: 'insurance', label: 'Insurance', icon: '🛡️', color: '#14B8A6' },
];

export function totalBudget(b: BudgetAllocation): number {
  return (Object.values(b) as number[]).reduce((s, v) => s + v, 0);
}

/* ── Generated content ───────────────────────────────────────────── */

export interface GeneratedSection {
  id: string;
  title: string;
  icon: string;
  content: string;
  enabled: boolean;
}

export type GenerationStatus = 'idle' | 'loading' | 'done' | 'error';

export const SECTION_META: { id: string; title: string; icon: string }[] = [
  { id: 'itinerary', title: 'Suggested Itinerary', icon: '🗺️' },
  { id: 'packing', title: 'Packing Checklist', icon: '🧳' },
  { id: 'weather', title: 'Weather Summary', icon: '⛅' },
  { id: 'currency', title: 'Currency & Money', icon: '💱' },
  { id: 'language', title: 'Language & Phrases', icon: '🗣️' },
  { id: 'emergency', title: 'Emergency Contacts', icon: '🆘' },
  { id: 'attractions', title: 'Top Attractions', icon: '🏛️' },
  { id: 'food', title: 'Local Cuisine', icon: '🍜' },
  { id: 'transport', title: 'Getting Around', icon: '🚌' },
  { id: 'tips', title: 'Travel Tips', icon: '💡' },
  { id: 'dailyBudget', title: 'Daily Budget Guide', icon: '💰' },
];

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
  budget: BudgetAllocation;
  currency: string;
  // Step 5
  inviteEmails: string[];
  // Step 6
  generationStatus: GenerationStatus;
  generatedSections: GeneratedSection[];
}

/* ── Actions ─────────────────────────────────────────────────────── */

export type WizardAction =
  | { type: 'STEP_TO'; step: number; direction: 1 | -1 }
  | { type: 'SET_DESTINATION'; destination: string; meta: DestinationInfo | null }
  | { type: 'SET_TRIP_TYPE'; tripType: TripType }
  | { type: 'SET_DATES'; startDate: string; endDate: string }
  | { type: 'SET_BUDGET'; category: keyof BudgetAllocation; value: number }
  | { type: 'SET_BUDGET_ALL'; budget: BudgetAllocation }
  | { type: 'SET_CURRENCY'; currency: string }
  | { type: 'ADD_EMAIL'; email: string }
  | { type: 'REMOVE_EMAIL'; email: string }
  | { type: 'SET_GENERATION_STATUS'; status: GenerationStatus }
  | { type: 'SET_GENERATED_SECTIONS'; sections: GeneratedSection[] }
  | { type: 'TOGGLE_SECTION'; id: string };

/* ── Reducer ─────────────────────────────────────────────────────── */

const INIT_BUDGET: BudgetAllocation = {
  accommodation: 0,
  food: 0,
  transport: 0,
  activities: 0,
  shopping: 0,
  emergency: 0,
  visa: 0,
  insurance: 0,
};

const INITIAL: WizardState = {
  currentStep: 0,
  direction: 1,
  destination: '',
  destinationMeta: null,
  tripType: null,
  startDate: '',
  endDate: '',
  budget: INIT_BUDGET,
  currency: 'INR',
  inviteEmails: [],
  generationStatus: 'idle',
  generatedSections: [],
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
    case 'SET_BUDGET':
      return { ...state, budget: { ...state.budget, [action.category]: action.value } };
    case 'SET_BUDGET_ALL':
      return { ...state, budget: action.budget };
    case 'SET_CURRENCY':
      return { ...state, currency: action.currency };
    case 'ADD_EMAIL':
      if (state.inviteEmails.includes(action.email)) return state;
      return { ...state, inviteEmails: [...state.inviteEmails, action.email] };
    case 'REMOVE_EMAIL':
      return { ...state, inviteEmails: state.inviteEmails.filter((e) => e !== action.email) };
    case 'SET_GENERATION_STATUS':
      return { ...state, generationStatus: action.status };
    case 'SET_GENERATED_SECTIONS':
      return { ...state, generatedSections: action.sections };
    case 'TOGGLE_SECTION':
      return {
        ...state,
        generatedSections: state.generatedSections.map((s) =>
          s.id === action.id ? { ...s, enabled: !s.enabled } : s,
        ),
      };
    default:
      return state;
  }
}

/* ── Context ─────────────────────────────────────────────────────── */

export const TOTAL_STEPS = 7;

export function canProceed(step: number, state: WizardState): boolean {
  switch (step) {
    case 0:
      return state.destination.trim().length > 0;
    case 1:
      return state.tripType !== null;
    case 2:
      return state.startDate !== '' && state.endDate !== '' && state.endDate >= state.startDate;
    case 3:
      return true;
    case 4:
      return true;
    case 5:
      return state.generationStatus === 'done' || state.generationStatus === 'error';
    case 6:
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

export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reduce, INITIAL);

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
