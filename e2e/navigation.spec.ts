import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
	test('should load the home page', async ({ page }) => {
		await page.goto('/');

		// Check that the navigation is present
		await expect(page.getByRole('navigation')).toBeVisible();

		// Check for page title
		await expect(page).toHaveTitle(/Timesheet/i);
	});

	test('should navigate to timesheet page', async ({ page }) => {
		await page.goto('/');

		// Click on timesheet link (use exact match to avoid multiple matches)
		await page.getByRole('link', { name: 'Timesheet', exact: true }).click();

		// Verify URL changed
		await expect(page).toHaveURL(/\/timesheet/);
	});

	test('should navigate to settings page', async ({ page }) => {
		await page.goto('/');

		// Click on settings link
		await page.getByRole('link', { name: /settings/i }).click();

		// Verify URL changed
		await expect(page).toHaveURL(/\/settings/);
	});

	test('should navigate back to home from timesheet', async ({ page }) => {
		await page.goto('/timesheet');

		// Click on home link
		await page.getByRole('link', { name: /home/i }).click();

		// Verify URL changed back to home
		await expect(page).toHaveURL('/');
	});
});
