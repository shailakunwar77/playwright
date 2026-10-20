import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import { authFile, demoUser } from '../../utils/environment';

setup('sign in once and save authenticated browser storage', async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto();
  await login.signIn(demoUser.email, demoUser.password);
  await expect(page).toHaveURL(/\/app$/);
  await expect(page.getByRole('heading', { name: 'Workspace', exact: true })).toBeVisible();
  await mkdir(path.dirname(authFile), { recursive: true });
  await page.context().storageState({ path: authFile });
});
