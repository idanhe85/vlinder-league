import { test, expect } from '@playwright/test';

// These tests intentionally run without a saved session
test.use({ storageState: { cookies: [], origins: [] } });

test('login page loads correctly', async ({ page }) => {
  await page.goto('/login');
  await expect(page.locator('h1', { hasText: 'Vlinder League' })).toBeVisible();
  await expect(page.locator('#username')).toBeVisible();
  await expect(page.locator('#password')).toBeVisible();
  await expect(page.locator('button[type="submit"]')).toBeVisible();
});

test('unauthenticated user is redirected to login', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/login/);
});

test('invalid credentials show error message', async ({ page }) => {
  await page.goto('/login');
  await page.fill('#username', 'notarealusername_xyz');
  await page.fill('#password', 'wrongpassword123');
  await page.click('button[type="submit"]');
  await expect(page.locator('text=Invalid username or password')).toBeVisible();
});

test('valid credentials log in and redirect to dashboard', async ({ page }) => {
  const username = process.env.TEST_USERNAME;
  const password = process.env.TEST_PASSWORD;
  if (!username || !password) test.skip();

  await page.goto('/login');
  await page.fill('#username', username!);
  await page.fill('#password', password!);
  await page.click('button[type="submit"]');

  await page.waitForURL('/');
  await expect(page.locator('h1', { hasText: 'Dashboard' })).toBeVisible();
});
