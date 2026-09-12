import { expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

// Shared black-box helpers for the authenticated Explore/Nearby E2E suite.
// Extracted from explore.spec.ts so new spec files reuse the same
// search/result-card conventions instead of re-implementing them.

// Heritage destination that reliably returns many attractions — used
// wherever a test needs a dense, realistic result set rather than testing
// geocoding itself.
export const DENSE = 'Hampi';

// Fill the destination field and submit via Enter (the "Explore" button label
// is hidden on mobile, so Enter is the cross-viewport-robust trigger).
export async function search(page: Page, term: string): Promise<void> {
  const input = page.getByLabel('Destination');
  await input.click();
  await input.fill(term);
  await input.press('Enter');
}

// A result card is the role="button" that contains a favourite toggle —
// unique to cards (category chips do not), so this reliably targets result
// cards.
export function resultCards(page: Page) {
  return page.getByRole('button').filter({ has: page.getByRole('button', { name: /favorites/i }) });
}

// Defensive reset for any test that exercises Save/Favorites: a PREVIOUS
// test (in this file, or an earlier failed run that never reached its own
// cleanup click) can leave a place saved for the real authenticated account.
// Confirmed live: a mobile-viewports.spec.ts failure left "Parameshwara
// Temple" saved, which then cascaded into two unrelated test failures.
// Call this before relying on a card starting "Add to favorites" instead of
// assuming it.
export async function ensureUnsaved(card: Locator): Promise<void> {
  const removeBtn = card.getByRole('button', { name: 'Remove from favorites' });
  if (await removeBtn.count()) {
    await removeBtn.click();
    await expect(card.getByRole('button', { name: 'Add to favorites' })).toBeVisible({
      timeout: 10_000,
    });
  }
}

// The Nearby page's own honest, pre-existing error state for a downstream
// Geoapify Places failure (NearbyErrorKind: 'unavailable' in
// nearby.service.ts) — distinct from "Location not found"/"Multiple places
// found", and unrelated to the searched destination or any geocoding logic.
// Confirmed live (Shirdi/Central Park/Add to Trip/Gallery investigations):
// Geoapify can fail this way even for a search (e.g. Hampi) that has
// resolved correctly in every other run. A test that lands here should
// report it as an external-provider condition, not let resultCards() time
// out for 60s with a generic, misleading "locator not found" error.
export async function waitForResultsOrUnavailable(
  page: Page,
  timeout = 30_000,
): Promise<'results' | 'unavailable'> {
  const results = resultCards(page).first();
  const unavailable = page.getByText("Nearby places couldn't be loaded right now");
  await Promise.race([
    results.waitFor({ state: 'visible', timeout }).catch(() => undefined),
    unavailable.waitFor({ state: 'visible', timeout }).catch(() => undefined),
  ]);
  return (await unavailable.isVisible()) ? 'unavailable' : 'results';
}
