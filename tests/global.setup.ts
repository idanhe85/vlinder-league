import { test as setup, expect } from '@playwright/test';
import path from 'path';

const SESSION_FILE = path.join(__dirname, '.auth/session.json');

setup('authenticate', async ({ page }) => {
  const username = process.env.TEST_USERNAME;
  const password = process.env.TEST_PASSWORD;

  if (!username || !password) {
    throw new Error(
      'Set TEST_USERNAME and TEST_PASSWORD env vars before running tests.\n' +
      'Example: TEST_USERNAME=idan TEST_PASSWORD=secret npx playwright test'
    );
  }

  await page.goto('/login');
  await page.fill('#username', username);
  await page.fill('#password', password);
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard
  await page.waitForURL('/');
  await expect(page.locator('h1', { hasText: 'Dashboard' })).toBeVisible();

  // Save session so all other tests skip the login step
  await page.context().storageState({ path: SESSION_FILE });
});
