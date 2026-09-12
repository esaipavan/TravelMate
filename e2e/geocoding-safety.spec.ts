import { test, expect } from '@playwright/test';
import { search } from './helpers';

// Authenticated UI regression coverage for the geocoding safety fixes in
// src/lib/geocode.ts: the Tirupathi "wrong real place" gate (LowConfidenceMatchError)
// and the Shirdi common-name alias (COMMON_NAME_ALIASES/verifiedAliasMatch).
// These were verified at the unit-test and live-API level (geocode.test.ts,
// see the Phase 3 remediation report) — this suite is the missing runtime
// link: confirming the SAME logic produces the right UI outcome through the
// real search box, not just the right return value from geocodeLocation().
//
// Desktop-only: geocoding resolution itself doesn't depend on viewport width.

test.beforeEach(async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'desktop-only; see file header');
  await page.goto('/nearby');
});

test('Shirdi resolves via the verified alias, not "Location not found"', async ({ page }) => {
  await search(page, 'Shirdi');
  await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText('Location not found')).not.toBeVisible();
  await expect(page.getByText('Multiple places found')).not.toBeVisible();
});

test('Tirupathi (misspelling) never silently resolves to a single wrong place — shows the ambiguity picker', async ({
  page,
}) => {
  await search(page, 'Tirupathi');
  await expect(page.getByText('Multiple places found')).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText('Which place did you mean?')).toBeVisible();
  // No place was auto-selected on the user's behalf — the map has no markers
  // from a destination that was never actually confirmed.
  await expect(page.locator('.leaflet-marker-icon')).toHaveCount(0);
});

test('Dwaraka Tirumala (correct spelling) resolves directly', async ({ page }) => {
  await search(page, 'Dwaraka Tirumala');
  await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText('Multiple places found')).not.toBeVisible();
  await expect(page.getByText('Location not found')).not.toBeVisible();
});

test('Central Park stays genuinely ambiguous (regression guard — unrelated to the Shirdi alias fix)', async ({
  page,
}) => {
  await search(page, 'Central Park');
  await expect(page.getByText('Multiple places found')).toBeVisible({ timeout: 30_000 });
});
