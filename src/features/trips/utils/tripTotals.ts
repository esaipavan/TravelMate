// ── Trip totals rollup ───────────────────────────────────────────────────────
// Pure, reusable aggregation of attached booking drafts for a trip. Honest by
// construction: it only ever sums the drafts it is handed (the caller passes the
// bookings already filtered to the current trip), never invents or estimates a
// value, and never mixes currencies into a single figure — different currencies
// are kept in separate groups so ₹ and $ are never silently added together.

import type { BookingDraft, BookingMode } from '@/features/hotels/types';

/** Display order + plural labels for the per-mode breakdown. */
export const MODE_ORDER: BookingMode[] = ['hotel', 'train', 'bus', 'flight', 'local'];
export const MODE_LABEL: Record<BookingMode, string> = {
  hotel: 'Hotels',
  train: 'Trains',
  bus: 'Buses',
  flight: 'Flights',
  local: 'Local',
};

export interface ModeTotal {
  total: number;
  count: number;
}

export interface CurrencyGroup {
  currency: string;
  /** Total across active (non-cancelled) bookings. */
  total: number;
  /** Portion of `total` that is confirmed (committed) spend. */
  confirmedTotal: number;
  count: number;
  byMode: Partial<Record<BookingMode, ModeTotal>>;
}

export interface TripTotals {
  /** Number of active (non-cancelled) attached bookings across every currency. */
  count: number;
  /** One group per currency, primary (trip currency, else largest) first. */
  groups: CurrencyGroup[];
  /** The group used for headline figures / budget comparison. */
  primary: CurrencyGroup | null;
  /** True when attached bookings span more than one currency. */
  mixedCurrency: boolean;
}

export function computeTripTotals(bookings: BookingDraft[], tripCurrency?: string): TripTotals {
  const byCurrency = new Map<string, CurrencyGroup>();

  // Cancelled bookings are inactive — excluded from every figure below. They
  // remain visible (de-emphasized) in the itinerary / bookings list, but never
  // count toward spend, mode breakdown, or budget.
  const active = bookings.filter((b) => b.status !== 'cancelled');

  for (const b of active) {
    const currency = b.currency || 'INR';
    let group = byCurrency.get(currency);
    if (!group) {
      group = { currency, total: 0, confirmedTotal: 0, count: 0, byMode: {} };
      byCurrency.set(currency, group);
    }
    group.total += b.total;
    if (b.status === 'confirmed') group.confirmedTotal += b.total;
    group.count += 1;

    const mode = group.byMode[b.mode] ?? { total: 0, count: 0 };
    mode.total += b.total;
    mode.count += 1;
    group.byMode[b.mode] = mode;
  }

  const groups = [...byCurrency.values()].sort((a, b) => {
    if (tripCurrency) {
      if (a.currency === tripCurrency && b.currency !== tripCurrency) return -1;
      if (b.currency === tripCurrency && a.currency !== tripCurrency) return 1;
    }
    return b.total - a.total;
  });

  return {
    count: active.length,
    groups,
    primary: groups[0] ?? null,
    mixedCurrency: groups.length > 1,
  };
}

export interface BudgetView {
  budget: number;
  spent: number;
  remaining: number;
  /** Spend as a fraction of budget, clamped to [0, 1] for the bar. */
  fraction: number;
  overBudget: boolean;
}

/**
 * Budget view for the primary currency group — only meaningful when the trip
 * has a budget AND it is denominated in the same currency as the spend, so we
 * never compare across currencies without a conversion we don't have.
 */
export function computeBudgetView(
  totals: TripTotals,
  tripBudget: number | null | undefined,
  tripCurrency: string,
): BudgetView | null {
  if (tripBudget == null || !totals.primary) return null;
  if (totals.primary.currency !== tripCurrency) return null;

  const spent = totals.primary.total;
  const remaining = tripBudget - spent;
  const fraction = tripBudget > 0 ? Math.min(1, Math.max(0, spent / tripBudget)) : 0;
  return { budget: tripBudget, spent, remaining, fraction, overBudget: remaining < 0 };
}
