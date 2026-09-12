import { test, expect } from '@playwright/test';
import { search, resultCards, ensureUnsaved, DENSE } from './helpers';

// Authenticated mobile UX regression coverage at the three specific widths
// requested for Phase 3 verification (360/390/430px). The Playwright config's
// "mobile" project already covers a Pixel 5 device profile (393x851, touch
// input) via explore.spec.ts's mobile smoke — these tests instead run on the
// "chromium" project with an explicit viewport override, so they check the
// exact requested breakpoints without duplicating that device-emulation
// smoke.

const VIEWPORTS = [
  { label: '360px', width: 360, height: 740 },
  { label: '390px', width: 390, height: 844 },
  { label: '430px', width: 430, height: 932 },
];

for (const vp of VIEWPORTS) {
  test.describe(`Mobile UX @ ${vp.label}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test(`favorite tap target and detail panel are usable, no horizontal overflow (${vp.label})`, async ({
      page,
    }, testInfo) => {
      test.skip(
        testInfo.project.name === 'mobile',
        'this spec sets its own viewport on the desktop-browser project; the "mobile" project (Pixel 5) is covered by explore.spec.ts',
      );

      await page.goto('/nearby');
      await search(page, DENSE);
      await expect(resultCards(page).first()).toBeVisible({ timeout: 30_000 });
      // A previous run's test (this file's own earlier viewport, or another
      // spec entirely) can leave this real account's place saved if it
      // failed before its own cleanup click — confirmed live, where a 360px
      // failure here cascaded into the 390px/430px runs below never finding
      // an "Add to favorites" button at all. Reset first instead of
      // assuming a clean starting state.
      await ensureUnsaved(resultCards(page).first());

      const overflowBefore = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflowBefore).toBeLessThanOrEqual(1);

      // Favorite button is reachable and tappable at this width (the
      // NearbyPlaceCard.tsx pseudo-element touch-target expansion).
      const favBtn = resultCards(page).first().getByRole('button', { name: 'Add to favorites' });
      await favBtn.click();
      await expect(
        resultCards(page).first().getByRole('button', { name: 'Remove from favorites' }),
      ).toBeVisible({ timeout: 10_000 });
      // Cleanup.
      await resultCards(page)
        .first()
        .getByRole('button', { name: 'Remove from favorites' })
        .click();

      // Selecting a result opens the detail panel WITHOUT the map
      // disappearing underneath it — the Phase 2 panel-covering-the-map fix
      // (NearbyPage.tsx's max-h-[60vh] overflow-y-auto on PlaceDetailPanel).
      await resultCards(page).first().click();
      await expect(page.getByRole('link', { name: 'View', exact: true })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Route' })).toBeVisible();
      await expect(page.locator('.leaflet-container')).toBeVisible();

      const overflowAfter = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflowAfter).toBeLessThanOrEqual(1);
    });
  });
}
