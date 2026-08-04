import { expect, test } from '@playwright/test';

test.describe('Jobs list', () => {
  test('renders job offers', async ({ page }) => {
    await page.goto('/jobs');
    await expect(page.getByRole('link', { name: 'Job Board' })).toBeVisible();
    await expect(page.getByRole('article').first()).toBeVisible();
  });

  test('filters jobs by search query', async ({ page }) => {
    await page.goto('/jobs');

    const search = page.getByPlaceholder('Search jobs, companies, technologies...').first();
    await search.fill('Angular');
    await expect(page.getByRole('article').first()).toBeVisible();
    await expect(page.getByText('No job offers found.')).toBeHidden();

    await search.fill('zzz-no-such-offer');
    await expect(page.getByText('No job offers found.')).toBeVisible();
  });

  test('filters jobs by work mode', async ({ page }) => {
    await page.goto('/jobs');

    await page.getByRole('button', { name: 'Remote', exact: true }).click();

    await expect(page).toHaveURL(/workMode=remote/);
    const cards = page.getByRole('article');
    await expect(cards.first()).toBeVisible();
    for (const card of await cards.all()) {
      await expect(card).toContainText('Remote');
    }
  });

  test('filters jobs by experience level', async ({ page }) => {
    await page.goto('/jobs');

    await page.getByRole('button', { name: 'junior', exact: true }).click();

    await expect(page).toHaveURL(/level=junior/);
    const cards = page.getByRole('article');
    await expect(cards.first()).toBeVisible();
    for (const card of await cards.all()) {
      await expect(card).toContainText('Junior');
    }
  });

  test('opens job details from a card', async ({ page }) => {
    await page.goto('/jobs');

    const firstCard = page.getByRole('article').first();
    await expect(firstCard).toBeVisible();
    const title = (await firstCard.locator('h3').textContent()) ?? '';

    await firstCard.click();

    await expect(page).toHaveURL(/\/jobs\/[0-9a-f-]{36}$/);
    await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Apply Now' })).toBeVisible();
  });

  test('loads more jobs on scroll without duplicates', async ({ page }) => {
    await page.goto('/jobs');

    const cards = page.getByRole('article');
    await expect(cards.first()).toBeVisible();
    const initialCount = await cards.count();

    await page.evaluate(async () => {
      const scrollUntilLoaded = async () => {
        for (let i = 0; i < 30; i++) {
          window.scrollTo(0, document.body.scrollHeight);
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      };
      await scrollUntilLoaded();
    });

    await expect.poll(() => cards.count()).toBeGreaterThan(initialCount);

    const titles = await cards.locator('h3').allTextContents();
    expect(titles.length).toBe(new Set(titles).size);
  });
});
