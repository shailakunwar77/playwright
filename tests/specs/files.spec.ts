import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { test, expect } from '../../fixtures/test.fixture';

test.beforeEach(async ({ workspace }) => { await workspace.goto(); });

test('CSV download contains all rows, not only the current page', async ({ directory }, testInfo) => {
  const destination = testInfo.outputPath('people.csv');
  const download = await directory.downloadCSV(destination);
  expect(download.suggestedFilename()).toBe('people.csv');
  expect(await download.failure()).toBeNull();
  const lines = (await readFile(destination, 'utf8')).trim().split('\n');
  expect(lines).toHaveLength(13);
  expect(lines[0]).toBe('Name,Email,Department');
  expect(lines[1]).toBe('Aisha Khan,aisha@example.test,Engineering');
  expect(lines.at(-1)).toBe('Liam Moore,liam@example.test,Support');
  await testInfo.attach('downloaded-csv', { path: destination, contentType: 'text/csv' });
});

test('CSV export respects filtering and sorting', async ({ directory }, testInfo) => {
  await directory.search('Engineering');
  await directory.toggleNameSort();
  const destination = testInfo.outputPath('filtered.csv');
  await directory.downloadCSV(destination);
  const lines = (await readFile(destination, 'utf8')).trim().split('\n');
  expect(lines).toEqual([
    'Name,Email,Department',
    'Jack King,jack@example.test,Engineering',
    'Grace Hall,grace@example.test,Engineering',
    'Carla Diaz,carla@example.test,Engineering',
    'Aisha Khan,aisha@example.test,Engineering',
  ]);
});

test('file upload displays the filename, byte size and exact contents', async ({ files, page }) => {
  const filePath = path.resolve(__dirname, '../data/attachment.txt');
  const content = await readFile(filePath);
  const uploaded = page.waitForResponse(response => response.url().includes('/api/uploads?') && response.request().method() === 'POST');
  await files.upload(filePath);
  const response = await uploaded;
  expect(response.status()).toBe(201);
  await expect(files.status).toHaveText(`Uploaded attachment.txt (${content.length} bytes)`);
  await expect(files.status).toHaveAttribute('data-upload-id', /^[a-f0-9-]{36}$/);
  const uploadId = await files.status.getAttribute('data-upload-id');
  const stored = await page.request.get(`/api/uploads/${uploadId}`);
  expect(stored.status()).toBe(200);
  expect(await stored.json()).toEqual({ id: uploadId, name: 'attachment.txt', size: content.length, text: content.toString('utf8') });
  await expect(files.status).toHaveText(`Uploaded attachment.txt (${content.length} bytes)`);
  await expect(files.preview).toHaveText(content.toString('utf8'));
});

test('unsupported file types show validation feedback', async ({ files }, testInfo) => {
  const filePath = testInfo.outputPath('invalid.exe');
  await writeFile(filePath, 'This is harmless test data, not an executable.');
  await files.upload(filePath);
  await expect(files.status).toHaveText('Unsupported file type');
  await expect(files.preview).toBeEmpty();
});
