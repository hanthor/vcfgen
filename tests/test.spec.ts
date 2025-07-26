import { test, expect } from '@playwright/test';

test('displays contact info from URL query', async ({ page }) => {
  await page.goto('http://localhost:3000/index.html?fn=John%20Doe&email=john@example.com&tel=1234567890&org=Acme%20Inc&title=Engineer');

  await expect(page.getByText('Name: John Doe')).toBeVisible();
  await expect(page.getByText('Email: john@example.com')).toBeVisible();
  await expect(page.getByText('Phone: 1234567890')).toBeVisible();
  await expect(page.getByText('Organization: Acme Inc')).toBeVisible();
  await expect(page.getByText('Title: Engineer')).toBeVisible();
});
