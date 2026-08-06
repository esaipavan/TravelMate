import { useState, useCallback } from 'react';
import type { OnboardingState, OnboardingData, ChecklistItems } from '../types';

export const ONBOARDING_KEY = 'travelmate-onboarding-v3';
export const ONBOARDING_KEY_V2 = 'travelmate-onboarding-v2';
export const ONBOARDING_KEY_LEGACY = 'travelmate-onboarded';

const DEFAULT_CHECKLIST: ChecklistItems = {
  tripCreated: false,
  expenseLogged: false,
  aiUsed: false,
  documentAdded: false,
  companionInvited: false,
};

const DEFAULT_STATE: OnboardingState = {
  version: 3,
  step: 0,
  completed: false,
  checklistDismissed: false,
  data: {
    // v3 fields
    destination: null,
    destinationCategory: null,
    startDate: null,
    endDate: null,
    groupType: null,
    budgetTier: null,
    tripId: null,
    aiBriefId: null,
    // v2 compat fields
    travelerType: null,
    dates: null,
    checklist: DEFAULT_CHECKLIST,
  },
};

// ── v2 → v3 migration ─────────────────────────────────────────────────────────

function migrateV2(): Partial<OnboardingState> | null {
  try {
    const raw = localStorage.getItem(ONBOARDING_KEY_V2);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (parsed.version !== 2) return null;
    const data = parsed.data as Record<string, unknown> | undefined;
    return {
      completed: parsed.completed === true,
      checklistDismissed: parsed.checklistDismissed === true,
      data: {
        ...DEFAULT_STATE.data,
        checklist: {
          ...DEFAULT_CHECKLIST,
          ...((data?.checklist as Partial<ChecklistItems>) ?? {}),
        },
      },
    };
  } catch {
    return null;
  }
}

// ── Storage helpers ────────────────────────────────────────────────────────────

function readState(): OnboardingState {
  try {
    const raw = localStorage.getItem(ONBOARDING_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<OnboardingState>;
      if (parsed.version === 3) {
        return {
          ...DEFAULT_STATE,
          ...parsed,
          data: {
            ...DEFAULT_STATE.data,
            ...parsed.data,
            checklist: { ...DEFAULT_CHECKLIST, ...(parsed.data?.checklist ?? {}) },
          },
        };
      }
    }
    // No v3 state — try v2 migration
    const migrated = migrateV2();
    if (migrated) {
      const next = { ...DEFAULT_STATE, ...migrated };
      writeState(next);
      return next;
    }
    return DEFAULT_STATE;
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

// ── Public helpers ─────────────────────────────────────────────────────────────

export function isOnboardingComplete(): boolean {
  try {
    const raw = localStorage.getItem(ONBOARDING_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<OnboardingState>;
      if (parsed.version === 3) return parsed.completed === true;
    }
    // Fall back to v2 migration check
    const migrated = migrateV2();
    if (migrated) return migrated.completed === true;
    // Fall back to legacy key
    return localStorage.getItem(ONBOARDING_KEY_LEGACY) === 'true';
  } catch {
    return false;
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

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

  // complete() writes completed=true immediately (also sets legacy key).
  // Called at entry of Step 3 so refresh during AI generation doesn't re-run onboarding.
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

  // Legacy stub — updates checklist field for WelcomeChecklist (Dashboard compat).
  // Removed from new onboarding flow; kept until Dashboard migrates to own checklist state.
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

  // Legacy stub — kept for WelcomeChecklist compat.
  const dismissChecklist = useCallback(() => {
    setState((prev) => {
      const next: OnboardingState = { ...prev, checklistDismissed: true };
      writeState(next);
      return next;
    });
  }, []);

  return { state, advance, goBack, complete, tickChecklist, dismissChecklist };
}
