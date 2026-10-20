import { type Locator, type Page } from '@playwright/test';

type ContactMethod = 'Email' | 'Phone';
type Department = 'Engineering' | 'Sales' | 'Support';
type Skill = 'typescript' | 'playwright' | 'api';

export class PreferencesPage {
  readonly region: Locator;
  readonly department: Locator;
  readonly skills: Locator;
  readonly status: Locator;

  constructor(readonly page: Page) {
    this.region = page.getByRole('region', { name: 'Preferences', exact: true });
    this.department = this.region.getByRole('combobox', { name: 'Department', exact: true });
    this.skills = this.region.getByRole('listbox', { name: 'Skills', exact: true });
    this.status = this.region.getByRole('status');
  }

  contact(method: ContactMethod) { return this.region.getByRole('radio', { name: method, exact: true }); }

  async save(options: { contact: ContactMethod; department: Department; skills: Skill[] }) {
    await this.contact(options.contact).check();
    await this.department.selectOption({ label: options.department });
    await this.skills.selectOption(options.skills);
    await this.region.getByRole('button', { name: 'Save preferences' }).click();
  }
}
