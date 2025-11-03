import { chromium } from '@playwright/test';

async function testOfflineMode() {
	console.log('🚀 Starting Playwright test for offline mode...\n');

	const browser = await chromium.launch({ headless: false });
	const context = await browser.newContext();
	const page = await context.newPage();

	// Enable console logging from the page
	page.on('console', (msg) => {
		const type = msg.type();
		const text = msg.text();
		if (type === 'error') {
			console.log(`❌ [BROWSER ERROR] ${text}`);
		} else if (
			text.includes('[DEBUG]') ||
			text.includes('[MSW]') ||
			text.includes('[OFFLINE MODE]') ||
			text.includes('[MOCK DATA]')
		) {
			console.log(`📝 ${text}`);
		}
	});

	try {
		console.log('📂 Navigating to http://localhost:5174/timesheet...');
		await page.goto('http://localhost:5174/timesheet');

		// Wait for the page to load
		console.log('⏳ Waiting for content to load...');
		await page.waitForTimeout(3000);

		// Take a screenshot of the initial page
		await page.screenshot({
			path: 'test-screenshots/01-initial-page.png',
			fullPage: true,
		});
		console.log('📸 Screenshot saved: test-screenshots/01-initial-page.png');

		// Check if MSW is working
		const title = await page.title();
		console.log(`📄 Page title: ${title}`);

		// Wait for data to load
		console.log('⏳ Waiting for timesheet data to load...');
		await page.waitForTimeout(5000);

		// Take screenshot after data loads
		await page.screenshot({
			path: 'test-screenshots/02-data-loaded.png',
			fullPage: true,
		});
		console.log('📸 Screenshot saved: test-screenshots/02-data-loaded.png');

		// Look for Adriano's timesheet
		console.log('🔍 Looking for user timesheets...');
		const userHeaders = await page.$$eval(
			'h2, h3, [class*="user"]',
			(elements) =>
				elements
					.map((el) => el.textContent)
					.filter((text) => text && text.trim()),
		);
		console.log('👥 Found user elements:', userHeaders.slice(0, 10));

		// Check for month total values
		console.log('🔍 Looking for month total values...');
		const monthTotals = await page.$$eval(
			'[class*="monthTotal"], [class*="total"]',
			(elements) =>
				elements
					.map((el) => el.textContent)
					.filter((text) => text && text.includes('h')),
		);
		console.log('💰 Month totals found:', monthTotals);

		// Get all text content for analysis
		const bodyText = await page.textContent('body');
		if (bodyText.includes('Adriano')) {
			console.log('✅ Found "Adriano" in the page');

			// Try to find the exact total for Adriano
			const adrianoSection = bodyText.indexOf('Adriano');
			const nextSection = bodyText.indexOf('Month Total', adrianoSection);
			if (nextSection > adrianoSection) {
				const section = bodyText.substring(adrianoSection, nextSection + 50);
				console.log("📊 Adriano's section:", section.substring(0, 200));
			}
		}

		if (bodyText.includes('Helder')) {
			console.log('✅ Found "Helder" in the page');
		}

		if (bodyText.includes('Igor')) {
			console.log('✅ Found "Igor" in the page');
		}

		// Capture browser console logs
		console.log('\n📋 Capturing browser console for debug output...');
		await page.waitForTimeout(2000);

		console.log('\n✅ Test completed successfully!');
		console.log('📸 Screenshots saved in test-screenshots/');
		console.log('🔍 Check the debug logs above for calculation details');
	} catch (error) {
		console.error('❌ Test failed:', error);
	} finally {
		console.log(
			'\n🔄 Keeping browser open for 10 seconds for manual inspection...',
		);
		await page.waitForTimeout(10000);
		await browser.close();
	}
}

// Create screenshots directory
import { mkdirSync } from 'fs';
try {
	mkdirSync('test-screenshots', { recursive: true });
} catch (e) {
	// Directory already exists
}

testOfflineMode().catch(console.error);
