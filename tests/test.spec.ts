import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

test('displays contact info from URL query', async ({ page }) => {
  await page.goto('http://localhost:3000/index.html?fn=John%20Doe&email=john@example.com&tel=1234567890&org=Acme%20Inc&title=Engineer');

  await expect(page.getByText('Name: John Doe')).toBeVisible();
  await expect(page.getByText('Email: john@example.com')).toBeVisible();
  await expect(page.getByText('Phone: 1234567890')).toBeVisible();
  await expect(page.getByText('Organization: Acme Inc')).toBeVisible();
  await expect(page.getByText('Title: Engineer')).toBeVisible();
});

test('escapes URL-supplied values so they cannot inject vCard properties', async ({ page }) => {
  const downloadPromise = page.waitForEvent('download');
  // A newline in fn would start a new vCard line; ';' and ',' are structural in vCard 3.0.
  const injected = 'Eve\nTEL:+1 555 0100;x,y';
  await page.goto(`http://localhost:3000/index.html?fn=${encodeURIComponent(injected)}&email=eve%40example.com`);

  const download = await downloadPromise;
  const vcard = readFileSync(await download.path(), 'utf8');

  expect(vcard.split(/\r?\n/).filter((line) => line.startsWith('TEL:'))).toHaveLength(0);
  expect(vcard).toContain('FN:Eve\\nTEL:+1 555 0100\\;x\\,y\n');
});
