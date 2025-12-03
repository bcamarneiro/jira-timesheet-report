import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E test configuration
 * Uses offline mode for reliable, isolated testing with mock data
 */
export default defineConfig({
	testDir: './e2e',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: 'html',
	use: {
		baseURL: 'http://localhost:5174',
		trace: 'on-first-retry',
		screenshot: 'only-on-failure',
	},

	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
		},
	],

	// Start the dev server in offline mode before running tests
	// Note: Run `npm run dev:offline` manually before running tests locally
	// The webServer is only automatically started in CI environments
	webServer: process.env.CI
		? {
				command: 'npm run dev:offline',
				url: 'http://localhost:5174',
				reuseExistingServer: false,
				timeout: 120000,
			}
		: undefined,
});
