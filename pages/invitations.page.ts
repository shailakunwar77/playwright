import { type Locator, type Page } from '@playwright/test';

export class InvitationsPage {
  readonly dialog: Locator;
  readonly status: Locator;
  readonly error: Locator;

  constructor(readonly page: Page) {
    this.dialog = page.getByRole('dialog', { name: 'Invite teammate', exact: true });
    this.status = page.getByRole('region', { name: 'Invitations' }).getByRole('status');
    this.error = this.dialog.getByRole('alert');
  }

  async open() { await this.page.getByRole('button', { name: 'Invite teammate', exact: true }).click(); }
  async fillRecipient(email: string) { await this.dialog.getByRole('textbox', { name: 'Recipient email' }).fill(email); }
  async send() { await this.dialog.getByRole('button', { name: 'Send invitation' }).click(); }
  async cancel() { await this.dialog.getByRole('button', { name: 'Cancel', exact: true }).click(); }
}
