import { test, expect } from '@playwright/test';
import { search, resultCards, DENSE } from './helpers';

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
//
// search()/resultCards()/DENSE now live in ./helpers.ts, shared with the
// other authenticated spec files added alongside this one (Save/Favorites,
// geocoding safety, place-detail consistency, mobile viewports, Add to Trip).

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
  // exact: true — result cards' own "Get directions to <place name>" Route
  // links can legitimately contain the substring "view" (e.g. "Panorama View
  // Point"), which a non-exact name match would wrongly count here too.
  await expect(page.getByRole('link', { name: 'View', exact: true })).toHaveCount(0); // no detail from a cluster
  // A click zooms to fit that cluster's own bounds (default
  // zoomToBoundsOnClick) — for a very large/wide supercluster (Hampi's dense
  // old-town has one with 100+ places) that can still leave most of it
  // re-clustered at the new zoom, so one click isn't always enough. Click
  // again whenever the layout hasn't changed yet; library defaults (zoom,
  // then spiderfy once no further zoom is possible) guarantee it eventually
  // will.
  await expect
    .poll(
      async () => {
        const count = await page.locator('.leaflet-marker-icon').count();
        if (count === markersBefore && (await clusters.count()) > 0) {
          await clusters.first().click();
        }
        return count;
      },
      { timeout: 20_000 },
    )
    .not.toBe(markersBefore); // the map re-clustered (zoomed/expanded)

  // E — selecting a result card opens PlaceDetailPanel for that place.
  const firstCard = resultCards(page).first();
  const name = await firstCard.locator('p[title]').first().getAttribute('title');
  await firstCard.click();
  const view = page.getByRole('link', { name: 'View', exact: true }); // exact — see cluster-click note above
  const route = page.getByRole('link', { name: 'Route' });
  await expect(view).toBeVisible();
  await expect(route).toBeVisible();
  await expect(page.getByRole('button', { name: /^Saved?$/ })).toBeVisible(); // Save available
  if (name) await expect(page.getByText(name).first()).toBeVisible();
  // Maps/Route actions carry the selected place's coordinates.
  expect(await view.getAttribute('href')).toMatch(/query=-?\d+(\.\d+)?,-?\d+(\.\d+)?/);
  expect(await route.getAttribute('href')).toMatch(/destination=-?\d+(\.\d+)?,-?\d+(\.\d+)?/);

  // D(category) — selecting a category chip changes the visible result set.
  // Uses the same resultCards() locator as the rest of this test — the
  // previous `/in Google Maps$/` link-name match was stale copy from an
  // earlier card design; no current Explore/Nearby link carries that text
  // (PlaceDetailPanel's Maps link is bare "View", NearbyPlaceCard's is
  // "Get directions to <place>"), so it always matched zero links.
  const group = page.getByRole('group', { name: 'Filter by category' });
  const totalBefore = await resultCards(page).count();
  // Chips: index 0 is "All"; pick the first specific category chip.
  await group.getByRole('button').nth(1).click();
  await expect
    .poll(async () => resultCards(page).count(), { timeout: 15_000 })
    .not.toBe(totalBefore); // filtered set differs from "All"
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
  // exact: true — see the desktop smoke's cluster-click note above.
  await expect(page.getByRole('link', { name: 'View', exact: true })).toBeVisible();
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
