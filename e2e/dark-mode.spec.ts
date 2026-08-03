import { expect, test } from '@playwright/test';

test.describe('Dark mode', () => {
  test('toggles dark mode and persists the choice', async ({ page }) => {
    await page.goto('/jobs');
    const html = page.locator('html');

    await expect(html).not.toHaveClass(/dark/);

    await page.getByRole('button', { name: 'Switch to dark mode' }).click();
    await expect(html).toHaveClass(/dark/);
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem('job-board:theme')))
      .toBe('dark');

    await page.reload();
    await expect(html).toHaveClass(/dark/);

    await page.getByRole('button', { name: 'Switch to light mode' }).click();
    await expect(html).not.toHaveClass(/dark/);
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem('job-board:theme')))
      .toBe('light');
  });
});
