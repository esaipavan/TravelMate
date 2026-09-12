import { test, expect } from '@playwright/test';
import { search, resultCards, ensureUnsaved, DENSE } from './helpers';

// Authenticated regression coverage for the Save/Favorites rewrite (account-
// level persistence via `saved_places`, see src/features/nearby/hooks/useFavorites.ts).
// Desktop-only: Save's own logic doesn't depend on viewport width, and the
// mobile touch-target aspect of the favorite button is covered separately by
// mobile-viewports.spec.ts.

test.beforeEach(async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'desktop-only; see file header');
  await page.goto('/nearby');
  await search(page, DENSE);
  await expect(resultCards(page).first()).toBeVisible({ timeout: 30_000 });
  // A previous run's test can leave this real account's place saved if it
  // failed before reaching its own cleanup click — reset first so no test
  // here has to assume a clean starting state.
  await ensureUnsaved(resultCards(page).first());
});

test('Save persists across a full page reload, then Unsave removes it', async ({ page }) => {
  const card = resultCards(page).first();
  const name = await card.locator('p[title]').first().getAttribute('title');
  expect(name).toBeTruthy();

  await card.getByRole('button', { name: 'Add to favorites' }).click();
  await expect(card.getByRole('button', { name: 'Remove from favorites' })).toBeVisible({
    timeout: 10_000,
  });

  // Reload is a full remount — proves the saved state is read back from
  // Supabase (useFavorites' query), not just held in in-memory React state.
  await page.reload();
  await search(page, DENSE);

  // Re-locate by NAME, not position — result ordering from Geoapify is not
  // guaranteed stable across two separate fetches.
  const sameCard = resultCards(page)
    .filter({ has: page.getByText(name!, { exact: true }) })
    .first();
  await expect(sameCard.getByRole('button', { name: 'Remove from favorites' })).toBeVisible({
    timeout: 15_000,
  });

  await sameCard.getByRole('button', { name: 'Remove from favorites' }).click();
  await expect(sameCard.getByRole('button', { name: 'Add to favorites' })).toBeVisible({
    timeout: 10_000,
  });
});

test('rapidly double-clicking Save sends only one mutation (race-guard regression)', async ({
  page,
}) => {
  const card = resultCards(page).first();

  // 1. Ensure the place starts unsaved. The shared beforeEach already calls
  //    ensureUnsaved(), but this test's own correctness depends on that
  //    precondition, so assert it explicitly here too.
  await expect(card.getByRole('button', { name: 'Add to favorites' })).toBeVisible();

  const requests: string[] = [];
  page.on('request', (req) => {
    if (req.method() === 'POST' && /\/rest\/v1\/saved_places/.test(req.url())) {
      requests.push(req.url());
    }
  });

  // 3. Intercept the first `saved_places` POST and hold it open — not on a
  //    fixed timer, but on an explicit signal, so the test KNOWS the request
  //    has actually reached the network layer (not merely assumed from
  //    elapsed wall-clock time) before the second click fires, and controls
  //    exactly when it's allowed to complete.
  //
  // Real, un-delayed network timing is not a reliable way to hit the exact
  // window useFavorites' `isPending` guard defends, in either direction:
  //   - Two separately-awaited clicks with NO interception: if the first
  //     Save round-trips fast enough, it may have already resolved (POST +
  //     refetch done, cache updated) by the second click — that click is
  //     then read as a legitimate, CORRECT toggle back to Unsave, not a
  //     blocked duplicate. Produces exactly 1 POST but ends UNSAVED.
  //   - Two clicks dispatched in the very same browser tick (previously via
  //     a single `el.click(); el.click();`): React 18 batches the state
  //     update from `mutate()` until the synchronous dispatch finishes, so
  //     BOTH click handlers read the SAME stale (not-yet-pending) closure
  //     and BOTH call `mutate()`. Produces 2 POSTs — confirmed live.
  let releaseFirstRequest = () => {};
  const firstRequestHeld = new Promise<void>((resolve) => {
    releaseFirstRequest = resolve;
  });
  let markFirstRequestObserved = () => {};
  const firstRequestObserved = new Promise<void>((resolve) => {
    markFirstRequestObserved = resolve;
  });

  let firstPostIntercepted = false;
  await page.route('**/rest/v1/saved_places*', async (route) => {
    if (route.request().method() === 'POST' && !firstPostIntercepted) {
      firstPostIntercepted = true;
      markFirstRequestObserved();
      // Only the FIRST post is held — if the guard is broken and a second
      // one is actually sent, it must not hang forever waiting on a promise
      // this test only resolves once; letting it through immediately keeps
      // the test able to fail on the request-count assertion below instead
      // of timing out.
      await firstRequestHeld;
    }
    await route.continue();
  });

  // 2 & 4. Locate and click Save.
  const favBtn = card.getByRole('button', { name: 'Add to favorites' });
  await favBtn.click();

  // 5. Confirm the first POST has actually been observed and is being held
  //    — proven, not assumed.
  await firstRequestObserved;

  // 6. Click Save again while the first mutation is still pending. The
  //    button still reads "Add to favorites" here — no optimistic update —
  //    so this is a real repeat click on the same control, exactly like a
  //    user double-clicking before the first click visibly did anything.
  await favBtn.click();

  // 7. Now that both clicks have landed, let the held request complete.
  releaseFirstRequest();

  // 8 & 9. Exactly one mutation was sent (the isPending guard blocked the
  //    second click's mutate() call), and the place ends up Saved.
  await expect(card.getByRole('button', { name: 'Remove from favorites' })).toBeVisible({
    timeout: 15_000,
  });
  expect(requests.length).toBe(1);

  // 10. Clean up so this test doesn't leak saved state into other tests/runs.
  await card.getByRole('button', { name: 'Remove from favorites' }).click();
  await expect(card.getByRole('button', { name: 'Add to favorites' })).toBeVisible({
    timeout: 10_000,
  });
});

test('a failed Save shows an error toast, not a silent no-op', async ({ page }) => {
  await page.route('**/rest/v1/saved_places*', (route) => {
    if (route.request().method() === 'POST') {
      return route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Simulated failure', details: '', hint: '', code: '500' }),
      });
    }
    return route.continue();
  });

  const card = resultCards(page).first();
  await card.getByRole('button', { name: 'Add to favorites' }).click();

  // useFavorites' onError forwards the thrown Error's message verbatim.
  await expect(page.getByText('Simulated failure')).toBeVisible({ timeout: 10_000 });

  // Must NOT have silently flipped to "saved" — that was the exact gap this
  // fix closed (a failed mutation previously looked identical to success).
  await expect(card.getByRole('button', { name: 'Add to favorites' })).toBeVisible();
});
