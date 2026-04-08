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
		baseURL: 'http://127.0.0.1:5174',
		trace: 'on-first-retry',
		screenshot: 'only-on-failure',
	},

	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
		},
	],

	// Start the dev server in offline mode only when explicitly requested.
	// Local usage and CI can also provide the server themselves for more reliable startup handling.
	webServer:
		process.env.PLAYWRIGHT_WEB_SERVER === '1'
			? {
					command: 'npm run dev:offline',
					url: 'http://127.0.0.1:5174',
					reuseExistingServer: false,
					timeout: 120000,
				}
			: undefined,
});
