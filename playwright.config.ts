import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  retries: 1,
  timeout: 30_000,

  use: {
    baseURL: process.env.TEST_BASE_URL ?? 'https://vlinder-league.vercel.app',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    // Step 1: log in once and save session to disk
    {
      name: 'setup',
      testMatch: '**/global.setup.ts',
    },
    // Step 2: all tests run with the saved session
    {
      name: 'e2e',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/.auth/session.json',
      },
      dependencies: ['setup'],
    },
  ],
});
