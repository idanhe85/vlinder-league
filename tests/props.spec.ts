import { test, expect } from '@playwright/test';

// Helper: move a range slider to a specific value via JS (fill doesn't trigger React events)
async function setSlider(page: import('@playwright/test').Page, label: string, value: number) {
  await page.locator(`input[aria-label="${label}"]`).evaluate((el, val) => {
    const input = el as HTMLInputElement;
    input.value = String(val);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
}

test.describe('Tournament Props', () => {
  test('props page loads with all sections', async ({ page }) => {
    await page.goto('/props');
    await expect(page.locator('h1', { hasText: 'Tournament Props' })).toBeVisible();
    await expect(page.locator('text=Tournament Winner')).toBeVisible();
    await expect(page.locator('text=Golden Ball')).toBeVisible();
    await expect(page.locator('text=Total Tournament Goals')).toBeVisible();
    await expect(page.locator('text=Total Red Cards')).toBeVisible();
    await expect(page.locator('text=Total Yellow Cards')).toBeVisible();
    await expect(page.locator('text=Golden Boot Goals')).toBeVisible();
  });

  test('can select a tournament winner', async ({ page }) => {
    await page.goto('/props');
    // First select on the page is the Winner dropdown
    await page.locator('select').first().selectOption('ARG');
    await expect(page.locator('select').first()).toHaveValue('ARG');
  });

  test('can select a golden ball player', async ({ page }) => {
    await page.goto('/props');
    // Second select is Golden Ball
    await page.locator('select').nth(1).selectOption('Lionel Messi (Argentina)');
    await expect(page.locator('select').nth(1)).toHaveValue('Lionel Messi (Argentina)');
  });

  test('can set total tournament goals', async ({ page }) => {
    await page.goto('/props');
    const input = page.locator('input[aria-label="Total Tournament Goals"]');
    await input.fill('180');
    await input.blur();
    await expect(input).toHaveValue('180');
  });

  test('can adjust red cards slider', async ({ page }) => {
    await page.goto('/props');
    await setSlider(page, 'Total Red Cards', 8);
    // The live value label should update
    await expect(page.locator('text=8').first()).toBeVisible();
  });

  test('can adjust yellow cards slider', async ({ page }) => {
    await page.goto('/props');
    await setSlider(page, 'Total Yellow Cards', 210);
    await expect(page.locator('text=210').first()).toBeVisible();
  });

  test('can adjust golden boot goals slider', async ({ page }) => {
    await page.goto('/props');
    await setSlider(page, 'Golden Boot Goals', 9);
    await expect(page.locator('text=9').first()).toBeVisible();
  });

  test('saves all predictions and shows confirmation', async ({ page }) => {
    await page.goto('/props');

    // Fill all props
    await page.locator('select').first().selectOption('BRA');
    await page.locator('select').nth(1).selectOption('Vinícius Júnior (Brazil)');
    await page.locator('input[aria-label="Total Tournament Goals"]').fill('172');
    await setSlider(page, 'Total Red Cards', 7);
    await setSlider(page, 'Total Yellow Cards', 195);
    await setSlider(page, 'Golden Boot Goals', 8);

    // Save
    await page.locator('button', { hasText: 'Save Predictions' }).click();

    // Confirmation message
    await expect(page.locator('text=Predictions saved')).toBeVisible({ timeout: 10_000 });
  });

  test('saved props persist after page reload', async ({ page }) => {
    await page.goto('/props');
    // After prior test saved props, the header should show count
    await expect(page.locator('text=props saved').first()).toBeVisible({ timeout: 10_000 });
  });
});
