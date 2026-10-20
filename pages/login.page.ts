import { type Locator, type Page } from '@playwright/test';

export class LoginPage {
  readonly email: Locator;
  readonly password: Locator;
  readonly error: Locator;

  constructor(readonly page: Page) {
    this.email = page.getByRole('textbox', { name: 'Email', exact: true });
    this.password = page.getByLabel('Password', { exact: true });
    this.error = page.getByRole('alert');
  }

  async goto() { await this.page.goto('/login'); }

  async signIn(email: string, password: string) {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.page.getByRole('button', { name: 'Sign in', exact: true }).click();
  }
}
