import { test, expect } from '@playwright/test';

test.describe('Match Predictions', () => {
  test('match center page loads with fixtures', async ({ page }) => {
    await page.goto('/match-center');
    await expect(page.locator('h1', { hasText: 'Match Center' })).toBeVisible();

    // Wait for loading skeleton to disappear
    await expect(page.locator('.animate-pulse').first()).not.toBeVisible({ timeout: 15_000 });

    // Group cards should be visible
    await expect(page.locator('text=Group A').first()).toBeVisible();
  });

  test('can switch between Group Stage and Knockout Phase', async ({ page }) => {
    await page.goto('/match-center');
    await page.locator('button', { hasText: 'Knockout Phase' }).click();
    await expect(page.locator('text=Knockout Phase')).toBeVisible();

    await page.locator('button', { hasText: 'Group Stage' }).click();
    await expect(page.locator('text=Group Stage')).toBeVisible();
  });

  test('can switch matchdays', async ({ page }) => {
    await page.goto('/match-center');
    await expect(page.locator('.animate-pulse').first()).not.toBeVisible({ timeout: 15_000 });

    await page.locator('button', { hasText: 'MD 2' }).click();
    await expect(page.locator('button', { hasText: 'MD 2' })).toHaveClass(/bg-primary-container/);
  });

  test('can submit a match score prediction', async ({ page }) => {
    await page.goto('/match-center');

    // Wait for fixtures to load
    await expect(page.locator('.animate-pulse').first()).not.toBeVisible({ timeout: 15_000 });

    // Find the first pair of score inputs (aria-label ends with " score")
    const homeInput = page.locator('input[aria-label$=" score"]').first();
    const awayInput = page.locator('input[aria-label$=" score"]').nth(1);

    await homeInput.fill('2');
    await awayInput.fill('1');

    // Click the Save button on that fixture card
    await page.locator('button', { hasText: 'Save' }).first().click();

    // Confirmation: "Your pick" appears with the entered score
    await expect(page.locator('text=Your pick:').first()).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('text=2 – 1').first()).toBeVisible();
  });

  test('saved prediction persists after page reload', async ({ page }) => {
    await page.goto('/match-center');
    await expect(page.locator('.animate-pulse').first()).not.toBeVisible({ timeout: 15_000 });

    // Check at least one "Your pick" entry is visible (from prior test or DB)
    const hasPriorPrediction = await page.locator('text=Your pick:').count() > 0;
    if (!hasPriorPrediction) test.skip();

    await page.reload();
    await expect(page.locator('.animate-pulse').first()).not.toBeVisible({ timeout: 15_000 });
    await expect(page.locator('text=Your pick:').first()).toBeVisible();
  });
});
