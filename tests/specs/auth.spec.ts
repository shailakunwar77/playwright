import { test, expect } from '../../fixtures/test.fixture';
import { demoUser } from '../../utils/environment';

// These tests intentionally exercise login without the shared authenticated session.
test.use({ storageState: { cookies: [], origins: [] } });

test('protected pages and APIs reject an unauthenticated user', async ({ page, request }) => {
  const response = await request.get('/api/me');
  expect(response.status()).toBe(401);
  await page.goto('/app');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
});

test('invalid credentials show a useful error', async ({ loginPage, page }) => {
  await loginPage.goto();
  await loginPage.signIn(demoUser.email, 'wrong-password');
  await expect(loginPage.error).toHaveText('Invalid email or password');
  await expect(page).toHaveURL(/\/login$/);
});

test('login survives reload and logout revokes the session', async ({ loginPage, workspace, page }) => {
  await loginPage.goto();
  await loginPage.signIn(demoUser.email, demoUser.password);
  await expect(workspace.heading).toBeVisible();
  await page.reload();
  await expect(workspace.heading).toBeVisible();
  await workspace.signOut();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto('/app');
  await expect(page).toHaveURL(/\/login$/);
  expect((await page.request.get('/api/me')).status()).toBe(401);
});
