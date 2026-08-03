import { expect, test } from '@playwright/test';

const uniqueEmail = () => `e2e-${Date.now()}@example.com`;

test.describe('Auth', () => {
  test('registers a new account and lands on jobs', async ({ page }) => {
    await page.goto('/register');

    await page.getByLabel('Name').fill('E2E User');
    await page.getByLabel('Email').fill(uniqueEmail());
    await page.getByLabel('Password', { exact: true }).fill('password123');
    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(page).toHaveURL(/\/jobs$/);
    await expect(page.locator('header').getByRole('button', { name: /Logout/ })).toBeVisible();
  });

  test('rejects login with wrong credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email').fill(uniqueEmail());
    await page.getByLabel('Password', { exact: true }).fill('wrong-password');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByText('Invalid email or password.')).toBeVisible();
  });
});

test.describe('Favorites', () => {
  test('guards /favorites for logged-out users', async ({ page }) => {
    await page.goto('/favorites');

    await expect(page).toHaveURL(/\/login\?returnUrl=/);
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  });

  test('saves and lists a favorite offer', async ({ page }) => {
    const email = uniqueEmail();

    await page.goto('/register');
    await page.getByLabel('Name').fill('E2E User');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password', { exact: true }).fill('password123');
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page).toHaveURL(/\/jobs$/);

    await page.goto('/jobs');
    const firstCard = page.getByRole('article').first();
    await expect(firstCard).toBeVisible();

    await page.getByRole('button', { name: 'Add to favorites' }).first().click();
    await expect(page.getByRole('button', { name: 'Remove from favorites' }).first()).toBeVisible();

    await page.goto('/favorites');
    await expect(page.getByRole('article').first()).toBeVisible();
  });

  test('removes a favorite offer', async ({ page }) => {
    const email = uniqueEmail();

    await page.goto('/register');
    await page.getByLabel('Name').fill('E2E User');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password', { exact: true }).fill('password123');
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page).toHaveURL(/\/jobs$/);

    await page.goto('/jobs');
    await expect(page.getByRole('article').first()).toBeVisible();
    await page.getByRole('button', { name: 'Add to favorites' }).first().click();
    await expect(page.getByRole('button', { name: 'Remove from favorites' }).first()).toBeVisible();

    await page.goto('/favorites');
    await expect(page.getByRole('article').first()).toBeVisible();
    await page.getByRole('button', { name: 'Remove from favorites' }).click();
    await expect(page.getByText('No favorite offers yet.')).toBeVisible();
  });

  test('logs out and loses access to /favorites', async ({ page }) => {
    const email = uniqueEmail();

    await page.goto('/register');
    await page.getByLabel('Name').fill('E2E User');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password', { exact: true }).fill('password123');
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page).toHaveURL(/\/jobs$/);

    await page
      .locator('header')
      .getByRole('button', { name: /Logout/ })
      .click();
    await expect(page).toHaveURL(/\/jobs$/);
    await expect(page.locator('header').getByRole('link', { name: 'Login' })).toBeVisible();

    await page.goto('/favorites');
    await expect(page).toHaveURL(/\/login\?returnUrl=/);
  });
});
