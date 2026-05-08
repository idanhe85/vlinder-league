import { test, expect } from '@playwright/test';

test.describe('Leaderboard', () => {
  test('leaderboard page loads with player entries', async ({ page }) => {
    await page.goto('/leaderboard');
    await expect(page.locator('h1', { hasText: 'Vlinder League Standings' })).toBeVisible();

    // Wait for loading skeleton to disappear
    await expect(page.locator('.animate-pulse').first()).not.toBeVisible({ timeout: 15_000 });

    // Player rows are divs in a grid — each shows a username/display name
    // At least one player row should exist (the logged-in user is always there)
    const playerRows = page.locator('[class*="grid-cols-\\[60px"]').filter({ hasNot: page.locator('.animate-pulse') });
    await expect(playerRows.first()).toBeVisible();
  });

  test('logged-in user is highlighted in the leaderboard', async ({ page }) => {
    await page.goto('/leaderboard');
    await expect(page.locator('.animate-pulse').first()).not.toBeVisible({ timeout: 15_000 });

    // The current user row shows a "You" label
    await expect(page.locator('text=You').first()).toBeVisible();
  });

  test('leaderboard shows rank and points for each player', async ({ page }) => {
    await page.goto('/leaderboard');
    await expect(page.locator('.animate-pulse').first()).not.toBeVisible({ timeout: 15_000 });

    // Header columns are visible
    await expect(page.locator('text=Rank').first()).toBeVisible();
    await expect(page.locator('text=Player').first()).toBeVisible();
    await expect(page.locator('text=Points').first()).toBeVisible();
  });
});

test.describe('Dashboard', () => {
  test('dashboard loads with score, rank and prediction stats', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1', { hasText: 'Dashboard' })).toBeVisible();
    await expect(page.locator('text=Your Score')).toBeVisible();
    await expect(page.locator('text=Current Rank')).toBeVisible();
    await expect(page.locator('text=Predictions Saved')).toBeVisible();
  });

  test('quick action links are present', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1', { hasText: 'Dashboard' })).toBeVisible();

    // Wait for Quick Actions section — it only renders in the 'dashboard' tab (default)
    const quickActionsHeading = page.locator('h2', { hasText: 'Quick Actions' });
    await expect(quickActionsHeading).toBeVisible({ timeout: 15_000 });

    // Use the section container to scope locators and avoid matching nav sidebar items
    const section = page.locator('section').filter({ has: quickActionsHeading });
    await expect(section.locator('text=Predict Match Scores')).toBeVisible();
    await expect(section.locator('text=Tournament Props')).toBeVisible();
  });

  test('quick action navigates to match center', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h2', { hasText: 'Quick Actions' })).toBeVisible();
    await page.locator('text=Predict Match Scores').click();
    await expect(page).toHaveURL('/match-center');
    await expect(page.locator('h1', { hasText: 'Match Center' })).toBeVisible();
  });
});
