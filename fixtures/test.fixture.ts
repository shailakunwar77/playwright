import { test as base } from '@playwright/test';
import { DirectoryPage } from '../pages/directory.page';
import { FilesPage } from '../pages/files.page';
import { InvitationsPage } from '../pages/invitations.page';
import { LoginPage } from '../pages/login.page';
import { PreferencesPage } from '../pages/preferences.page';
import { WorkspacePage } from '../pages/workspace.page';
import { Mailbox } from '../utils/mailbox';
import { generateEmail } from '../utils/test-data';

type Fixtures = {
  loginPage: LoginPage;
  workspace: WorkspacePage;
  directory: DirectoryPage;
  preferences: PreferencesPage;
  files: FilesPage;
  invitations: InvitationsPage;
  mailbox: Mailbox;
  recipientEmail: string;
};

// Each test gets a fresh browser context seeded from setup's authenticated storage state.
// Keep mutable backend resources unique per test; add worker-scoped accounts for real apps.
export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => { await use(new LoginPage(page)); },
  workspace: async ({ page }, use) => { await use(new WorkspacePage(page)); },
  directory: async ({ page }, use) => { await use(new DirectoryPage(page)); },
  preferences: async ({ page }, use) => { await use(new PreferencesPage(page)); },
  files: async ({ page }, use) => { await use(new FilesPage(page)); },
  invitations: async ({ page }, use) => { await use(new InvitationsPage(page)); },
  mailbox: async ({ request }, use) => { await use(new Mailbox(request)); },
  recipientEmail: async ({}, use) => { await use(generateEmail()); },
});
export { expect } from '@playwright/test';
