import { test, expect } from '@playwright/test';
import { search, resultCards, DENSE } from './helpers';

// Authenticated regression coverage for the "Add to Trip" entry point from
// Explore. Deliberately minimal: the full duplicate-warning flow
// (AddToTripDialog.tsx's "Adding again will create a duplicate" banner)
// needs the test account to already have a trip with itinerary days AND that
// place already placed on one of them — that is Supabase seed data this
// suite cannot create for itself without inventing production data (see
// docs/E2E_VERIFICATION.md). This test instead asserts the dialog itself is
// never blank/broken regardless of which state the account is in.
//
// Desktop-only: dialog structure doesn't depend on viewport width.

test.beforeEach(async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'desktop-only; see file header');
  await page.goto('/nearby');
  await search(page, DENSE);
  await resultCards(page).first().click();
});

test('Add to Trip dialog opens to either the trip list or the correct empty state — never blank', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Add to Trip' }).click();

  const dialog = page.getByRole('dialog').filter({ hasText: /to a trip/i });
  await expect(dialog).toBeVisible();

  // Exactly one of these must be true — which one depends on the test
  // account's existing trips (seed-data dependent, see file header).
  const emptyState = dialog.getByText("You don't have any trips yet.");
  const tripEntry = dialog.locator('button', { hasText: /.+/ }).first();
  await expect(emptyState.or(tripEntry)).toBeVisible({ timeout: 15_000 });
});
