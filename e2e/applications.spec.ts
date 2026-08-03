import { expect, test } from '@playwright/test';

const uniqueEmail = () => `app-e2e-${Date.now()}@example.com`;

async function register(page: import('@playwright/test').Page) {
  const email = uniqueEmail();
  await page.goto('/register');
  await page.getByLabel('Name').fill('E2E User');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill('password123');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page).toHaveURL(/\/jobs$/);
  return email;
}

test.describe('Applications', () => {
  test('guards /applications for logged-out users', async ({ page }) => {
    await page.goto('/applications');

    await expect(page).toHaveURL(/\/login\?returnUrl=/);
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  });

  test('applies from job details and tracks status', async ({ page }) => {
    await register(page);

    await page.goto('/jobs');
    await page.getByRole('article').first().click();
    await expect(page).toHaveURL(/\/jobs\/[0-9a-f-]{36}$/);

    await page.getByRole('button', { name: 'Apply for this job' }).click();
    await expect(page.getByText('Applied', { exact: true }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'View my applications' })).toBeVisible();
  });

  test('shows application on /applications and updates status', async ({ page }) => {
    await register(page);

    await page.goto('/jobs');
    const card = page.getByRole('article').first();
    await expect(card).toBeVisible();
    const title = (await card.locator('h3').textContent()) ?? '';
    await card.click();
    await page.getByRole('button', { name: 'Apply for this job' }).click();
    await expect(page.getByText('Applied', { exact: true }).first()).toBeVisible();

    await page.goto('/applications');
    await expect(page.getByRole('heading', { name: 'My applications' })).toBeVisible();
    await expect(page.getByRole('link', { name: title, exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Interview' }).click();
    await expect(page.getByRole('button', { name: 'Interview' })).toHaveAttribute('disabled', '');
    await expect(page.getByText('History', { exact: true })).toBeVisible();
    await expect(page.locator('ol li').filter({ hasText: 'Applied' })).toBeVisible();
    await expect(page.locator('ol li').filter({ hasText: 'Interview' })).toBeVisible();
  });
});
