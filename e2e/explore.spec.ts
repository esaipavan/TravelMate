import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

// Authenticated Explore/Nearby regression suite (uses the saved storageState).
//
// Selectors are black-box and prefer accessible roles/names and stable visible
// text; Leaflet DOM is matched by the library's own stable classes
// (.leaflet-container / .marker-cluster / .leaflet-marker-icon). No production
// component was modified to add test hooks. Assertions avoid brittle exact
// counts of external Geoapify results — they check observable UI behaviour.
//
// Geoapify is a shared free-tier quota, so each test performs at most one
// destination search and the heavier interactions are combined into a single
// desktop smoke.

const DENSE = 'Hampi'; // heritage destination that reliably returns many attractions

// Fill the destination field and submit via Enter (the "Explore" button label is
// hidden on mobile, so Enter is the cross-viewport-robust trigger).
async function search(page: Page, term: string): Promise<void> {
  const input = page.getByLabel('Destination');
  await input.click();
  await input.fill(term);
  await input.press('Enter');
}

// A result card is the role="button" that contains a favourite toggle — unique
// to cards (category chips do not), so this reliably targets result cards.
function resultCards(page: Page) {
  return page.getByRole('button').filter({ has: page.getByRole('button', { name: /favorites/i }) });
}

test.beforeEach(async ({ page }) => {
  await page.goto('/nearby');
  await expect(page).toHaveURL(/\/nearby/);
});

// A — Authenticated route (runs on desktop + mobile)
test('authenticated user can open /nearby without redirect to /login', async ({ page }) => {
  await expect(page).not.toHaveURL(/\/login/);
  await expect(page.getByRole('heading', { name: 'Explore', level: 1 })).toBeVisible();
});

// B+C+D(category)+E — comprehensive desktop smoke from a SINGLE dense search.
test('Explore desktop smoke: map, clustering, selection, detail, category filter', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'desktop-only; mobile has its own smoke');

  await search(page, DENSE);

  // B — map + results render.
  await expect(page.locator('.leaflet-container')).toBeVisible();
  await expect(resultCards(page).first()).toBeVisible({ timeout: 30_000 });
  await expect(page.locator('img.leaflet-tile').first()).toBeVisible(); // base tiles initialised

  // C — a dense destination clusters; a cluster click zooms/expands (does NOT
  // open a place detail panel the way a place marker would).
  const clusters = page.locator('.marker-cluster');
  await expect(clusters.first()).toBeVisible({ timeout: 30_000 });
  const markersBefore = await page.locator('.leaflet-marker-icon').count();
  await clusters.first().click();
  await expect(page.getByRole('link', { name: 'View' })).toHaveCount(0); // no detail from a cluster
  await expect
    .poll(async () => page.locator('.leaflet-marker-icon').count(), { timeout: 15_000 })
    .not.toBe(markersBefore); // the map re-clustered (zoomed/expanded)

  // E — selecting a result card opens PlaceDetailPanel for that place.
  const firstCard = resultCards(page).first();
  const name = await firstCard.locator('p[title]').first().getAttribute('title');
  await firstCard.click();
  const view = page.getByRole('link', { name: 'View' });
  const route = page.getByRole('link', { name: 'Route' });
  await expect(view).toBeVisible();
  await expect(route).toBeVisible();
  await expect(page.getByRole('button', { name: /^Saved?$/ })).toBeVisible(); // Save available
  if (name) await expect(page.getByText(name).first()).toBeVisible();
  // Maps/Route actions carry the selected place's coordinates.
  expect(await view.getAttribute('href')).toMatch(/query=-?\d+(\.\d+)?,-?\d+(\.\d+)?/);
  expect(await route.getAttribute('href')).toMatch(/destination=-?\d+(\.\d+)?,-?\d+(\.\d+)?/);

  // D(category) — selecting a category chip changes the visible result set.
  const group = page.getByRole('group', { name: 'Filter by category' });
  const mapsLinks = page.getByRole('link', { name: /in Google Maps$/ });
  const totalBefore = await mapsLinks.count();
  // Chips: index 0 is "All"; pick the first specific category chip.
  await group.getByRole('button').nth(1).click();
  await expect.poll(async () => mapsLinks.count(), { timeout: 15_000 }).not.toBe(totalBefore); // filtered set differs from "All"
});

// G — mobile smoke: search → select → detail, no horizontal overflow.
test('Explore mobile smoke: search, select, detail, no horizontal overflow', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'mobile-only');

  await search(page, DENSE);
  await expect(page.locator('.leaflet-container')).toBeVisible();
  await expect(resultCards(page).first()).toBeVisible({ timeout: 30_000 });

  // No horizontal overflow of the document.
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);

  // A result is still selectable on mobile.
  await resultCards(page).first().click();
  await expect(page.getByRole('link', { name: 'View' })).toBeVisible();
});

// D(stale markers + honest empty) — desktop only.
test('changing destinations clears stale markers and shows an honest empty state', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'desktop-only');

  await search(page, DENSE);
  await expect(page.locator('.leaflet-marker-icon').first()).toBeVisible({ timeout: 30_000 });

  // A foreign query is rejected as "Location not found" — the map/markers go away
  // (no stale markers from the previous destination).
  await search(page, 'Paris');
  await expect(page.getByText('Location not found')).toBeVisible({ timeout: 30_000 });
  await expect(page.locator('.leaflet-marker-icon')).toHaveCount(0);

  // A new valid destination rebuilds fresh markers.
  await search(page, 'Jaipur');
  await expect(page.locator('.leaflet-marker-icon').first()).toBeVisible({ timeout: 30_000 });
});

// H — Near Me with SIMULATED geolocation only (never real device location).
test('Near Me runs with simulated geolocation', async ({ page, context }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'desktop-only');

  await context.grantPermissions(['geolocation']);
  await context.setGeolocation({ latitude: 26.9124, longitude: 75.7873 }); // fixed test point (Jaipur)

  await page.getByRole('button', { name: 'Near me' }).click();
  // The near-me flow executes and surfaces results (or an honest empty/error
  // state) rather than hanging — assert the map initialised for the location.
  await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 30_000 });
  await expect(resultCards(page).first()).toBeVisible({ timeout: 30_000 });
});

// F — Open-now: parseOpenNow only ever flags UNAMBIGUOUS always-open schedules
// (24/7 or "Mo-Su 00:00-24:00"). Confirming the false-positive fix requires a
// deterministic provider `opening_hours` value (e.g. "Mo-Su 10:00-22:00; PH
// 00:00-24:00"), which cannot be reproduced through live Geoapify without
// modifying production code — so it is intentionally NOT asserted here. That
// case is covered by the deterministic parseOpenNow regression executed
// separately. See implementation report §Open-now.
