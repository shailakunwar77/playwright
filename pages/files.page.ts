import { type Locator, type Page } from '@playwright/test';

export class FilesPage {
  readonly region: Locator;
  readonly status: Locator;
  readonly preview: Locator;

  constructor(readonly page: Page) {
    this.region = page.getByRole('region', { name: 'Files', exact: true });
    this.status = this.region.getByRole('status');
    this.preview = this.region.locator('#preview');
  }

  async upload(filePath: string) { await this.region.getByLabel('Attachment', { exact: true }).setInputFiles(filePath); }
}
