import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Device-local widget order/visibility for Dashboard and Trip Detail —
// mirrors theme.store.ts's exact shape (Zustand + persist, plain
// localStorage, no DB write). This is a deliberate choice, not a shortcut:
// it's the only existing precedent for a UI preference in this app (no
// `jsonb` preferences column on `profiles`, no other account-synced
// setting), so widget layout stays device-local the same way theme does.

export type WidgetPageKey = 'dashboard' | 'tripDetail';

interface PageLayout {
  /** Widget ids in display order. Ids not present here (e.g. a widget added
   *  in a later release) are appended after these, in their default order —
   *  see useWidgetOrder. */
  order: string[];
  /** Widget ids the user has hidden. Never removed from `order` — hiding is
   *  reversible, not deletion. */
  hidden: string[];
}

const EMPTY_LAYOUT: PageLayout = { order: [], hidden: [] };

/** Toggles one id's membership in a hidden-ids list. Exported purely for
 *  unit testing (same convention as hooks/useWidgetOrder.ts's
 *  mergeWidgetOrder). */
export function toggleHiddenId(hidden: string[], id: string): string[] {
  return hidden.includes(id) ? hidden.filter((h) => h !== id) : [...hidden, id];
}

interface WidgetLayoutState {
  dashboard: PageLayout;
  tripDetail: PageLayout;
  setOrder: (page: WidgetPageKey, order: string[]) => void;
  toggleHidden: (page: WidgetPageKey, widgetId: string) => void;
}

export const useWidgetLayoutStore = create<WidgetLayoutState>()(
  persist(
    (set) => ({
      dashboard: EMPTY_LAYOUT,
      tripDetail: EMPTY_LAYOUT,
      setOrder: (page, order) =>
        set((state) => ({ [page]: { ...state[page], order } }) as Partial<WidgetLayoutState>),
      toggleHidden: (page, widgetId) =>
        set((state) => {
          const current = state[page];
          const hidden = toggleHiddenId(current.hidden, widgetId);
          return { [page]: { ...current, hidden } } as Partial<WidgetLayoutState>;
        }),
    }),
    { name: 'travelmate-widget-layout' },
  ),
);
