import { type Page } from '@playwright/test';

export class WorkspacePage {
  constructor(readonly page: Page) {}
  get heading() { return this.page.getByRole('heading', { name: 'Workspace', exact: true }); }
  async goto() { await this.page.goto('/app'); }
  async signOut() { await this.page.getByRole('button', { name: 'Sign out', exact: true }).click(); }
}
