import { test as setup, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

// One-time authentication for the authenticated Explore suite.
//
// Signs in through the REAL login form as a dedicated, non-admin Supabase test
// user (credentials from the environment — never committed) and saves the
// resulting browser storage (the Supabase session in localStorage) for reuse.
// This exercises the normal auth flow: no token manipulation, no admin APIs,
// no RequireAuth bypass, no "test mode".

const STORAGE_STATE = path.join('.auth', 'user.json');

setup('authenticate as the dedicated E2E test user', async ({ page }) => {
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'E2E_EMAIL and E2E_PASSWORD are required to run the authenticated Explore suite. ' +
        'Provide credentials for a DEDICATED, non-admin Supabase test account (never a real user or admin). ' +
        'Set them via the shell environment or CI secrets — never commit them or place them in .env.example.',
    );
  }

  // Real UI login (email/password) — the same path a user takes.
  await page.goto('/login');
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();

  // A successful login leaves /login (default landing is /dashboard).
  await expect(page, 'login should redirect away from /login').not.toHaveURL(/\/login/, {
    timeout: 30_000,
  });

  // Confirm the RequireAuth guard now admits /nearby (no bounce back to /login).
  await page.goto('/nearby');
  await expect(page).toHaveURL(/\/nearby/);
  await expect(page.getByRole('heading', { name: 'Explore', level: 1 })).toBeVisible({
    timeout: 30_000,
  });

  // Persist the authenticated session for the browser projects to reuse.
  fs.mkdirSync(path.dirname(STORAGE_STATE), { recursive: true });
  await page.context().storageState({ path: STORAGE_STATE });
});
