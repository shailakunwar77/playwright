import { type Locator, type Page } from '@playwright/test';

export class DirectoryPage {
  readonly region: Locator;
  readonly rows: Locator;
  readonly nameHeader: Locator;
  readonly pagination: Locator;
  readonly next: Locator;
  readonly previous: Locator;
  readonly emptyMessage: Locator;

  constructor(readonly page: Page) {
    this.region = page.getByRole('region', { name: 'Directory', exact: true });
    this.rows = this.region.getByRole('table', { name: 'People' }).locator('tbody tr');
    this.nameHeader = this.region.getByRole('columnheader', { name: 'Name', exact: true });
    this.pagination = this.region.getByRole('status');
    this.next = this.region.getByRole('button', { name: 'Next', exact: true });
    this.previous = this.region.getByRole('button', { name: 'Previous', exact: true });
    this.emptyMessage = this.region.getByText('No people found', { exact: true });
  }

  async search(value: string) { await this.region.getByRole('searchbox', { name: 'Search people' }).fill(value); }
  async toggleNameSort() { await this.nameHeader.getByRole('button', { name: 'Name', exact: true }).click(); }
  async names() { return this.rows.locator('td:first-child').allTextContents(); }
  async downloadCSV(destination: string) {
    const event = this.page.waitForEvent('download');
    await this.region.getByRole('button', { name: 'Download CSV' }).click();
    const download = await event;
    await download.saveAs(destination);
    return download;
  }
}
