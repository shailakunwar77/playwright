import { test, expect } from '../../fixtures/test.fixture';
import { directoryNames } from '../../utils/test-data';

test.beforeEach(async ({ workspace }) => { await workspace.goto(); });

test('stored login opens the directory and displays the first page', async ({ workspace, directory }) => {
  await expect(workspace.heading).toBeVisible();
  await expect(directory.rows).toHaveCount(5);
  expect(await directory.names()).toEqual(directoryNames.slice(0, 5));
  await expect(directory.pagination).toHaveText('Page 1 of 3 (12 results)');
  await expect(directory.previous).toBeDisabled();
});

test('search matches name, email and department case-insensitively', async ({ directory }) => {
  for (const query of ['AISHA', 'aisha@example.test']) {
    await directory.search(query);
    await expect(directory.rows).toHaveCount(1);
    await expect(directory.rows.first()).toContainText('Aisha Khan');
  }
  await directory.search('engineering');
  await expect(directory.rows).toHaveCount(4);
  expect(await directory.names()).toEqual(['Aisha Khan', 'Carla Diaz', 'Grace Hall', 'Jack King']);
});

test('empty search results recover when the query is cleared', async ({ directory }) => {
  await directory.search('no-such-person');
  await expect(directory.rows).toHaveCount(0);
  await expect(directory.emptyMessage).toBeVisible();
  await expect(directory.next).toBeDisabled();
  await expect(directory.previous).toBeDisabled();
  await directory.search('');
  await expect(directory.emptyMessage).toBeHidden();
  await expect(directory.rows).toHaveCount(5);
  await expect(directory.pagination).toHaveText('Page 1 of 3 (12 results)');
});

test('sorting applies across every page in descending and ascending order', async ({ directory }) => {
  await directory.toggleNameSort();
  await expect(directory.nameHeader).toHaveAttribute('aria-sort', 'descending');
  const actual: string[] = [];
  for (let page = 1; page <= 3; page++) {
    await expect(directory.pagination).toHaveText(`Page ${page} of 3 (12 results)`);
    actual.push(...await directory.names());
    if (page < 3) await directory.next.click();
  }
  expect(actual).toEqual([...directoryNames].reverse());
  await directory.toggleNameSort();
  await expect(directory.nameHeader).toHaveAttribute('aria-sort', 'ascending');
  expect(await directory.names()).toEqual(directoryNames.slice(0, 5));
  await expect(directory.pagination).toHaveText('Page 1 of 3 (12 results)');
});

test('pagination reaches both boundaries without missing or duplicate records', async ({ directory }) => {
  const actual: string[] = [];
  for (let page = 1; page <= 3; page++) {
    await expect(directory.rows).toHaveCount(page === 3 ? 2 : 5);
    actual.push(...await directory.names());
    if (page < 3) await directory.next.click();
  }
  expect(actual).toEqual(directoryNames);
  expect(new Set(actual).size).toBe(12);
  await expect(directory.next).toBeDisabled();
  await directory.previous.click();
  await expect(directory.pagination).toHaveText('Page 2 of 3 (12 results)');
  expect(await directory.names()).toEqual(directoryNames.slice(5, 10));
});

test('search from a later page resets pagination and preserves the sort', async ({ directory }) => {
  await directory.toggleNameSort();
  await directory.next.click();
  await directory.next.click();
  await directory.search('sales');
  await expect(directory.pagination).toHaveText('Page 1 of 1 (4 results)');
  expect(await directory.names()).toEqual(['Keira Lane', 'Henry Irwin', 'Emma Foster', 'Ben Carter']);
  await expect(directory.next).toBeDisabled();
  await expect(directory.previous).toBeDisabled();
});
