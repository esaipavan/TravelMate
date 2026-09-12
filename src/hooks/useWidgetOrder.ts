import { useCallback, useMemo } from 'react';
import { useWidgetLayoutStore } from '@/store/widgetLayout.store';
import type { WidgetPageKey } from '@/store/widgetLayout.store';

export interface WidgetOrderEntry {
  id: string;
  hidden: boolean;
}

/**
 * Merges a user's saved widget order with the current default order. A
 * widget id present in `defaultOrder` but not yet in `savedOrder` — i.e. any
 * widget added in a future release — is appended at the end rather than
 * silently missing, so shipping a new widget can never make it vanish for
 * existing users. A saved id no longer present in `defaultOrder` (a widget
 * since removed from the app) is dropped. Exported purely for unit testing —
 * pure, no store/React access (same convention as
 * supabase/functions/hotels-search/provider.ts's mapHotel).
 */
export function mergeWidgetOrder(savedOrder: string[], defaultOrder: string[]): string[] {
  const known = new Set(defaultOrder);
  const saved = savedOrder.filter((id) => known.has(id));
  const savedSet = new Set(saved);
  const missing = defaultOrder.filter((id) => !savedSet.has(id));
  return [...saved, ...missing];
}

/**
 * Effective widget order/visibility for one page, merging the user's saved
 * layout with `defaultOrder` via `mergeWidgetOrder`.
 */
export function useWidgetOrder(page: WidgetPageKey, defaultOrder: string[]) {
  const layout = useWidgetLayoutStore((s) => s[page]);
  const setOrder = useWidgetLayoutStore((s) => s.setOrder);
  const toggleHidden = useWidgetLayoutStore((s) => s.toggleHidden);

  // `defaultOrder` is a fresh array each render from the caller's WIDGET
  // registry — only its contents matter for memoization, not identity, so
  // it's reduced to a stable string key here before being used as a useMemo
  // dependency below.
  const defaultOrderKey = defaultOrder.join('|');

  const fullOrder = useMemo(
    () => mergeWidgetOrder(layout.order, defaultOrder),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [layout.order, defaultOrderKey],
  );

  const entries: WidgetOrderEntry[] = useMemo(
    () => fullOrder.map((id) => ({ id, hidden: layout.hidden.includes(id) })),
    [fullOrder, layout.hidden],
  );

  const visibleIds = useMemo(
    () => fullOrder.filter((id) => !layout.hidden.includes(id)),
    [fullOrder, layout.hidden],
  );

  const reorder = useCallback((next: string[]) => setOrder(page, next), [page, setOrder]);
  const toggle = useCallback((id: string) => toggleHidden(page, id), [page, toggleHidden]);

  return { entries, visibleIds, fullOrder, reorder, toggleHidden: toggle };
}
