import { test, expect } from '@playwright/test';

test.describe('Timesheet Page', () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to timesheet page
		await page.goto('/timesheet');
		// Wait for the page to fully load
		await page.waitForLoadState('networkidle');
	});

	test('should display month navigation', async ({ page }) => {
		// Check for previous/next month buttons
		await expect(
			page.getByRole('button', { name: /previous|prev|←/i }),
		).toBeVisible();
		await expect(page.getByRole('button', { name: /next|→/i })).toBeVisible();
	});

	test('should display mock users in offline mode', async ({ page }) => {
		// Wait for data to load (MSW mock)
		await page.waitForTimeout(2000);

		// Check for expected mock users
		const pageContent = await page.textContent('body');

		// At least one of the mock users should be visible
		const hasAlex = pageContent?.includes('Alex Thompson');
		const hasSarah = pageContent?.includes('Sarah Johnson');
		const hasMike = pageContent?.includes('Mike Chen');

		expect(hasAlex || hasSarah || hasMike).toBeTruthy();
	});

	test('should navigate to previous month', async ({ page }) => {
		// Get month label using MonthNavigator CSS class - contains year in format like "December 2025"
		const monthLabel = page.locator(
			'[class*="MonthNavigator"] [class*="label"]',
		);
		const initialText = await monthLabel.textContent();

		// Click previous month
		await page.getByRole('button', { name: '←' }).click();

		// Wait for navigation
		await page.waitForTimeout(500);

		// Month label should have changed
		const newText = await monthLabel.textContent();
		expect(newText).not.toBe(initialText);
	});

	test('should navigate to next month', async ({ page }) => {
		// First go back a month
		await page.getByRole('button', { name: '←' }).click();
		await page.waitForTimeout(500);

		// Get month label using MonthNavigator CSS class
		const monthLabel = page.locator(
			'[class*="MonthNavigator"] [class*="label"]',
		);
		const initialText = await monthLabel.textContent();

		// Click next month
		await page.getByRole('button', { name: '→' }).click();

		// Wait for navigation
		await page.waitForTimeout(500);

		// Month label should have changed
		const newText = await monthLabel.textContent();
		expect(newText).not.toBe(initialText);
	});

	test('should display calendar with weekday headers', async ({ page }) => {
		const body = await page.textContent('body');

		// Check for weekday labels
		const hasSun = body?.includes('Sun');
		const hasMon = body?.includes('Mon');
		const hasFri = body?.includes('Fri');
		const hasSat = body?.includes('Sat');

		expect(hasSun && hasMon && hasFri && hasSat).toBeTruthy();
	});

	test('should show month total hours', async ({ page }) => {
		// Wait for data to load
		await page.waitForTimeout(2000);

		const body = await page.textContent('body');

		// Should have some hours displayed (with 'h' suffix)
		const hasHours = body?.match(/\d+\.?\d*h/);
		expect(hasHours).toBeTruthy();
	});
});
