import { test, expect } from '@playwright/test';

test('browser renders a page and handles user interaction', async ({ page }) => {
  await page.setContent(`
    <!doctype html>
    <html lang="en">
      <head><title>Playwright starter</title></head>
      <body>
        <h1>Playwright starter</h1>
        <button type="button" onclick="document.querySelector('#status').textContent = 'Clicked'">Try it</button>
        <p id="status" role="status">Ready</p>
      </body>
    </html>
  `);
  await expect(page).toHaveTitle('Playwright starter');
  await expect(page.getByRole('heading', { name: 'Playwright starter' })).toBeVisible();
  await page.getByRole('button', { name: 'Try it' }).click();
  await expect(page.getByRole('status')).toHaveText('Clicked');
});
