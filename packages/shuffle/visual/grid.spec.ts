import { expect, test, type Page } from '@playwright/test';

declare global {
  // Set by visual/grid.html; read back from specs.
  var __layouts: number;
}

function layouts(page: Page): Promise<number> {
  return page.evaluate(() => globalThis.__layouts);
}

async function waitForLayouts(page: Page, count: number): Promise<void> {
  await page.waitForFunction((expected: number) => globalThis.__layouts >= expected, count);
}

test.beforeEach(async ({ page }, testInfo) => {
  if (testInfo.project.name === 'no-vt') {
    // Remove the API before navigation so the fallback path commits instantly.
    await page.addInitScript(() => {
      Reflect.deleteProperty(Document.prototype, 'startViewTransition');
    });
  }
  await page.goto('/grid.html');
  // Init layout (synchronous first render + async event).
  await waitForLayouts(page, 1);
});

test('initial grid', async ({ page }) => {
  await expect(page).toHaveScreenshot('initial.png', {
    mask: [page.locator('#controls')],
  });
});

test('filtered grid', async ({ page }) => {
  await page.getByRole('button', { name: 'Design' }).click();
  await waitForLayouts(page, 2);
  await expect(page).toHaveScreenshot('filtered.png', {
    mask: [page.locator('#controls')],
  });
});

test('sorted grid', async ({ page }) => {
  await page.getByRole('button', { name: 'Sort' }).click();
  await waitForLayouts(page, 2);
  await expect(page).toHaveScreenshot('sorted.png', {
    mask: [page.locator('#controls')],
  });
});

test('filtered then sorted grid', async ({ page }) => {
  await page.getByRole('button', { name: 'Design' }).click();
  await waitForLayouts(page, 2);
  await page.getByRole('button', { name: 'Sort' }).click();
  await waitForLayouts(page, 3);
  await expect(page).toHaveScreenshot('filtered-sorted.png', {
    mask: [page.locator('#controls')],
  });
});

test('filter cycle returns to the full grid', async ({ page }) => {
  await page.getByRole('button', { name: 'Design' }).click();
  await waitForLayouts(page, 2);
  await page.getByRole('button', { name: 'All' }).click();
  await waitForLayouts(page, 3);
  await expect(page).toHaveScreenshot('filter-cycle.png', {
    mask: [page.locator('#controls')],
  });
  expect(await layouts(page)).toBe(3);
});
