import { expect, test } from '@playwright/test';

test.describe('Company pages', () => {
  test('navigates from a job card to the company page', async ({ page }) => {
    await page.goto('/jobs');

    const card = page.getByRole('article').first();
    await expect(card).toBeVisible();
    await card.getByRole('link').first().click();

    await expect(page).toHaveURL(/\/companies\/[a-z0-9-]+$/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText('Open positions')).toBeVisible();
  });

  test('shows company offers on the company page', async ({ page }) => {
    await page.goto('/companies/techcorp');

    await expect(page.getByRole('heading', { name: 'TechCorp' })).toBeVisible();
    await expect(page.getByText('Open positions')).toBeVisible();
    await expect(page.getByRole('article').first()).toBeVisible();
  });

  test('shows not found for an unknown company', async ({ page }) => {
    await page.goto('/companies/does-not-exist');

    await expect(page.getByText('Company not found.')).toBeVisible();
  });
});
