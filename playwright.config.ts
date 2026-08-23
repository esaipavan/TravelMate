import { defineConfig, devices } from '@playwright/test';

// Playwright config for authenticated Explore/Nearby verification.
//
// By default it builds the app and serves the PRODUCTION build (`vite preview`)
// locally, then runs the suite against it — full production parity, no Vercel
// deployment-protection to negotiate, no application/auth changes. Point the
// suite at a deployed URL instead by setting E2E_BASE_URL (the local webServer
// is then skipped).
//
// The `setup` project logs in once as a DEDICATED, non-admin Supabase test user
// (credentials from E2E_EMAIL / E2E_PASSWORD — never committed) and saves the
// authenticated browser session to `.auth/user.json` (gitignored). The browser
// projects reuse that storageState. No auth bypass, no token manipulation.

const PORT = 4173;
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;
const STORAGE_STATE = '.auth/user.json';
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './e2e',
  // Geoapify is a shared free-tier quota (3k/day) — keep API usage modest and
  // deterministic by running serially with a single worker.
  fullyParallel: false,
  workers: 1,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: STORAGE_STATE },
      dependencies: ['setup'],
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 5'], storageState: STORAGE_STATE },
      dependencies: ['setup'],
    },
  ],
  // Skip the local server when targeting a deployed URL via E2E_BASE_URL.
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'npm run build && npm run preview -- --port 4173 --strictPort',
        url: baseURL,
        timeout: 180_000,
        reuseExistingServer: !isCI,
      },
});
