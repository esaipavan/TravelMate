import { useState, useCallback } from 'react';
import type { OnboardingState, OnboardingData, ChecklistItems } from '../types';

export const ONBOARDING_KEY = 'travelmate-onboarding-v2';
export const ONBOARDING_KEY_LEGACY = 'travelmate-onboarded';

const DEFAULT_CHECKLIST: ChecklistItems = {
  tripCreated: false,
  expenseLogged: false,
  aiUsed: false,
  documentAdded: false,
  companionInvited: false,
};

const DEFAULT_STATE: OnboardingState = {
  version: 2,
  step: 0,
  completed: false,
  checklistDismissed: false,
  data: {
    travelerType: null,
    destination: null,
    dates: null,
    tripId: null,
    checklist: DEFAULT_CHECKLIST,
  },
};

function readState(): OnboardingState {
  try {
    const raw = localStorage.getItem(ONBOARDING_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<OnboardingState>;
    if (parsed.version !== 2) return DEFAULT_STATE;
    return {
      ...DEFAULT_STATE,
      ...parsed,
      data: {
        ...DEFAULT_STATE.data,
        ...parsed.data,
        checklist: { ...DEFAULT_CHECKLIST, ...(parsed.data?.checklist ?? {}) },
      },
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function writeState(state: OnboardingState): void {
  try {
    localStorage.setItem(ONBOARDING_KEY, JSON.stringify(state));
  } catch {
    // Storage quota exceeded — fail silently
  }
}

export function isOnboardingComplete(): boolean {
  return readState().completed;
}

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>(readState);

  const advance = useCallback((dataUpdate?: Partial<OnboardingData>) => {
    setState((prev) => {
      const next: OnboardingState = {
        ...prev,
        step: prev.step + 1,
        data: { ...prev.data, ...(dataUpdate ?? {}) },
      };
      writeState(next);
      return next;
    });
  }, []);

  const goBack = useCallback(() => {
    setState((prev) => {
      if (prev.step === 0) return prev;
      const next: OnboardingState = { ...prev, step: prev.step - 1 };
      writeState(next);
      return next;
    });
  }, []);

  const complete = useCallback((dataUpdate?: Partial<OnboardingData>) => {
    setState((prev) => {
      const next: OnboardingState = {
        ...prev,
        completed: true,
        data: { ...prev.data, ...(dataUpdate ?? {}) },
      };
      writeState(next);
      localStorage.setItem(ONBOARDING_KEY_LEGACY, 'true');
      return next;
    });
  }, []);

  const tickChecklist = useCallback((item: keyof ChecklistItems) => {
    setState((prev) => {
      if (prev.data.checklist[item]) return prev;
      const next: OnboardingState = {
        ...prev,
        data: {
          ...prev.data,
          checklist: { ...prev.data.checklist, [item]: true },
        },
      };
      writeState(next);
      return next;
    });
  }, []);

  const dismissChecklist = useCallback(() => {
    setState((prev) => {
      const next: OnboardingState = { ...prev, checklistDismissed: true };
      writeState(next);
      return next;
    });
  }, []);

  return { state, advance, goBack, complete, tickChecklist, dismissChecklist };
}
