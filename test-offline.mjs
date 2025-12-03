import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

// Create screenshots directory (ignore if already exists)
mkdirSync('test-screenshots', { recursive: true });

async function testOfflineMode() {
	console.log('Starting Playwright test for offline mode...\n');

	const browser = await chromium.launch({ headless: false });
	const context = await browser.newContext();
	const page = await context.newPage();

	// Enable console logging from the page
	page.on('console', (msg) => {
		const type = msg.type();
		const text = msg.text();
		if (type === 'error') {
			console.log(`[BROWSER ERROR] ${text}`);
		} else if (
			text.includes('[DEBUG]') ||
			text.includes('[MSW]') ||
			text.includes('[OFFLINE MODE]') ||
			text.includes('[MOCK DATA]') ||
			text.includes('[Performance]')
		) {
			console.log(`[LOG] ${text}`);
		}
	});

	try {
		console.log('Navigating to http://localhost:5174/timesheet...');
		await page.goto('http://localhost:5174/timesheet');

		// Wait for the page to load
		console.log('Waiting for content to load...');
		await page.waitForTimeout(3000);

		// Take a screenshot of the initial page
		await page.screenshot({
			path: 'test-screenshots/01-initial-page.png',
			fullPage: true,
		});
		console.log('Screenshot saved: test-screenshots/01-initial-page.png');

		// Check if MSW is working
		const title = await page.title();
		console.log(`Page title: ${title}`);

		// Wait for data to load
		console.log('Waiting for timesheet data to load...');
		await page.waitForTimeout(5000);

		// Take screenshot after data loads
		await page.screenshot({
			path: 'test-screenshots/02-data-loaded.png',
			fullPage: true,
		});
		console.log('Screenshot saved: test-screenshots/02-data-loaded.png');

		// Look for user timesheets
		console.log('Looking for user timesheets...');
		const userHeaders = await page.$$eval(
			'h2, h3, [class*="user"]',
			(elements) =>
				elements.map((el) => el.textContent).filter((text) => text?.trim()),
		);
		console.log('Found user elements:', userHeaders.slice(0, 10));

		// Check for month total values
		console.log('Looking for month total values...');
		const monthTotals = await page.$$eval(
			'[class*="monthTotal"], [class*="total"]',
			(elements) =>
				elements
					.map((el) => el.textContent)
					.filter((text) => text?.includes('h')),
		);
		console.log('Month totals found:', monthTotals);

		// Get all text content for analysis
		const bodyText = await page.textContent('body');

		// Check for expected mock users (Alex, Sarah, Mike)
		const expectedUsers = ['Alex Thompson', 'Sarah Johnson', 'Mike Chen'];
		for (const user of expectedUsers) {
			if (bodyText.includes(user)) {
				console.log(`Found "${user}" in the page`);

				// Try to find the section for this user
				const userSection = bodyText.indexOf(user);
				const nextSection = bodyText.indexOf('Month Total', userSection);
				if (nextSection > userSection) {
					const section = bodyText.substring(userSection, nextSection + 50);
					console.log(`${user}'s section:`, section.substring(0, 200));
				}
			} else {
				console.log(`WARNING: "${user}" not found in the page`);
			}
		}

		// Capture browser console logs
		console.log('\nCapturing browser console for debug output...');
		await page.waitForTimeout(2000);

		console.log('\nTest completed successfully!');
		console.log('Screenshots saved in test-screenshots/');
		console.log('Check the debug logs above for calculation details');
	} catch (error) {
		console.error('Test failed:', error);
	} finally {
		console.log(
			'\nKeeping browser open for 10 seconds for manual inspection...',
		);
		await page.waitForTimeout(10000);
		await browser.close();
	}
}

testOfflineMode().catch(console.error);
