import { test, expect } from '../../fixtures/test.fixture';

test.beforeEach(async ({ workspace }) => { await workspace.goto(); });

test('radio button, single select and multiple select values are submitted', async ({ preferences }) => {
  await preferences.save({ contact: 'Phone', department: 'Support', skills: ['typescript', 'playwright'] });
  await expect(preferences.contact('Phone')).toBeChecked();
  await expect(preferences.contact('Email')).not.toBeChecked();
  await expect(preferences.department).toHaveValue('Support');
  await expect(preferences.skills).toHaveValues(['typescript', 'playwright']);
  await expect(preferences.status).toHaveText('Saved: Phone; Support; TypeScript, Playwright');
});

test('multiple selections can be replaced and cleared', async ({ preferences }) => {
  await preferences.save({ contact: 'Email', department: 'Sales', skills: ['typescript', 'playwright', 'api'] });
  await expect(preferences.skills).toHaveValues(['typescript', 'playwright', 'api']);
  await preferences.save({ contact: 'Email', department: 'Sales', skills: ['api'] });
  await expect(preferences.skills).toHaveValues(['api']);
  await expect(preferences.status).toHaveText('Saved: Email; Sales; API testing');
  await preferences.save({ contact: 'Email', department: 'Sales', skills: [] });
  await expect(preferences.skills).toHaveValues([]);
  await expect(preferences.status).toHaveText('Saved: Email; Sales; No skills');
});
