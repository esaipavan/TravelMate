import { test, expect } from '@playwright/test';
import { search, resultCards, waitForResultsOrUnavailable, DENSE } from './helpers';

// Authenticated UI regression coverage for Phase 2/3 Place Detail work:
// the Warangal Fort image false-negative fix (placeImage.service.ts's
// coordinate-less fallback), image attribution links, Panel/Sheet
// consistency (hierarchy + source labeling + no stale "kept on this device"
// wording), and gallery thumbnail switching.
//
// Desktop-only: this UI structure doesn't depend on viewport width (mobile
// layout/overflow is covered separately by mobile-viewports.spec.ts).

test.beforeEach(async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'desktop-only; see file header');
  await page.goto('/nearby');
});

test('Warangal Fort: appears as a real result with a real, attributed photo (not a generic placeholder)', async ({
  page,
}) => {
  await search(page, 'Warangal Fort');
  await expect(resultCards(page).first()).toBeVisible({ timeout: 30_000 });

  // Relies on Warangal Fort itself being indexed as a discoverable POI near
  // its own coordinates (confirmed live against Geoapify/Wikipedia during
  // the Phase 3 remediation session) — same external-data-dependency profile
  // as the DENSE/Hampi assertions elsewhere in this suite.
  const fortCard = resultCards(page)
    .filter({ has: page.getByText(/Warangal Fort/i) })
    .first();
  await expect(fortCard).toBeVisible({ timeout: 15_000 });
  await fortCard.click();
  await page.getByTitle('View full place details').click();

  const verifiedPhoto = page.getByTitle(/View source:.*on Wikipedia/i);
  await expect(verifiedPhoto).toBeVisible({ timeout: 20_000 });
  const href = await verifiedPhoto.getAttribute('href');
  expect(href).toMatch(/wikipedia\.org\/wiki\//i);
});

test('Panel and Sheet show consistent hierarchy/source labeling and the same Save state — no stale "kept on this device" wording', async ({
  page,
}) => {
  await search(page, DENSE);
  const card = resultCards(page).first();
  await card.click();

  // Compact Panel.
  await expect(page.getByText(/Place data(: Verified from|: source unknown)/)).toBeVisible();
  await expect(page.getByText('kept on this device')).toHaveCount(0);
  const panelSaveBtn = page.getByRole('button', { name: /^Saved?$/ });
  await expect(panelSaveBtn).toBeVisible();
  const wasSaved = (await panelSaveBtn.textContent())?.trim() === 'Saved';

  // Full Sheet — same source-labeling convention, plus its own Source
  // section, and Save must reflect the SAME state as the Panel (both read
  // the same useFavorites() state, not two independent copies).
  //
  // The Sheet is a Dialog rendered ON TOP of the Panel — NearbyPage.tsx only
  // gates the Panel on `selectedPlace`, not on whether the Sheet is open, so
  // the Panel stays mounted underneath. Once the Sheet is open there are
  // genuinely two "Place data: ..." lines on the page (Panel's + Sheet's),
  // so every assertion about the Sheet's own content must be scoped to the
  // Sheet's dialog container (Radix's DialogContent renders role="dialog" —
  // an existing, stable accessible role, not a new test id).
  await page.getByTitle('View full place details').click();
  const sheet = page.getByRole('dialog');
  await expect(sheet.getByRole('heading', { name: 'Source' })).toBeVisible();
  await expect(sheet.getByText(/Place data(: Verified from|: source unknown)/)).toBeVisible();
  await expect(sheet.getByText('kept on this device')).toHaveCount(0);
  const sheetSaveBtn = sheet.getByRole('button', { name: /^Saved?$/ });
  const sheetSaved = (await sheetSaveBtn.textContent())?.trim() === 'Saved';
  expect(sheetSaved).toBe(wasSaved);
});

test('Gallery: when 2+ verified photos exist, thumbnails switch the hero image and attribution stays present', async ({
  page,
}) => {
  await search(page, DENSE);

  // Hampi's own geocoding has never failed in this suite — a search landing
  // on the app's "Nearby places couldn't be loaded right now" state here is
  // Geoapify's Places lookup failing downstream (confirmed live for
  // Shirdi/Central Park/Add to Trip), not a gallery or destination defect.
  // Distinguish it explicitly instead of resultCards() timing out for 60s.
  const state = await waitForResultsOrUnavailable(page);
  if (state === 'unavailable') {
    test.skip(
      true,
      'Geoapify Places is currently unavailable/rate-limited for this search — a documented external-provider condition, not a gallery defect',
    );
  }

  await resultCards(page).first().click();
  await page.getByTitle('View full place details').click();

  const thumbStrip = page.getByRole('group', { name: /photos of/i });
  if ((await thumbStrip.count()) === 0) {
    test.skip(
      true,
      'this result had 0-1 verified photos this run — thumbnail strip only renders for 2+, not a bug',
    );
  }

  const hero = page.locator('[role="dialog"] img').first();
  const before = await hero.getAttribute('src');
  await thumbStrip.getByRole('button', { name: /Show photo 2 of/ }).click();

  await expect(hero).not.toHaveAttribute('src', before ?? '__none__');
  await expect(page.getByTitle(/View source:.*on Wikipedia/i)).toBeVisible();
});
