import { test, expect } from '@playwright/test';

test.describe('Settings Page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/settings');
		// Wait for page to load
		await page.waitForLoadState('networkidle');
	});

	test('should display settings form with inputs', async ({ page }) => {
		// Check for email field which we know exists
		const emailInput = page.getByLabel(/email/i);
		await expect(emailInput).toBeVisible();
	});

	test('should have Jira host input', async ({ page }) => {
		// Look for Jira host field
		const jiraHostInput = page.getByLabel(/jira.*host|host/i);
		await expect(jiraHostInput).toBeVisible();
	});

	test('should have email input', async ({ page }) => {
		// Look for email field
		const emailInput = page.getByLabel(/email/i);
		await expect(emailInput).toBeVisible();
	});

	test('should have API token input', async ({ page }) => {
		// Look for API token field
		const tokenInput = page.getByLabel(/api.*token|token/i);
		await expect(tokenInput).toBeVisible();
	});

	test('should allow editing email input', async ({ page }) => {
		// Find email input
		const emailInput = page.getByLabel(/email/i);
		await expect(emailInput).toBeVisible();

		// Clear and fill with new value
		await emailInput.clear();
		await emailInput.fill('newtest@example.com');

		// Verify the value was set
		await expect(emailInput).toHaveValue('newtest@example.com');
	});
});
