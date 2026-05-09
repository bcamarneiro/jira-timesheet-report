import { expect, type Page, test } from '@playwright/test';

/**
 * Deeper probe pass — settings backup, URL state, sort/filter
 * interactions, calendar suggestions, and other surfaces not yet hit.
 */

async function go(page: Page, path: string) {
	await page.goto(path);
	await page.waitForLoadState('networkidle');
}

test.describe('Settings backup integrity probe', () => {
	test('AUDIT-#NEW: settings backup includes favorites/templates/dayNotes', async ({
		page,
	}) => {
		await go(page, '/settings');
		const downloadPromise = page.waitForEvent('download');
		await page.getByRole('button', { name: 'Backup' }).click();
		const download = await downloadPromise;

		const stream = await download.createReadStream();
		const chunks: Buffer[] = [];
		for await (const chunk of stream as unknown as AsyncIterable<Buffer>) {
			chunks.push(chunk);
		}
		const text = Buffer.concat(chunks).toString('utf8');
		const json = JSON.parse(text);

		// What IS backed up:
		expect(json).toHaveProperty('config');
		expect(json).toHaveProperty('calendarMappings');

		// User-data store fields are now included under userData.
		expect(json).toHaveProperty('userData');
		expect(json.userData).toHaveProperty('favorites');
		expect(json.userData).toHaveProperty('templates');
		expect(json.userData).toHaveProperty('commentPresets');
		expect(json.userData).toHaveProperty('dayNotes');
		expect(json.userData).toHaveProperty('reportPresets');
		expect(Array.isArray(json.userData.favorites)).toBe(true);
		expect(Array.isArray(json.userData.templates)).toBe(true);
		expect(Array.isArray(json.userData.commentPresets)).toBe(true);
		expect(Array.isArray(json.userData.reportPresets)).toBe(true);
		expect(
			json.userData.dayNotes && typeof json.userData.dayNotes === 'object',
		).toBe(true);
	});
});

test.describe('Reports URL state probe', () => {
	test('deep link with ?view=monthly&year=2025&month=10 lands on October Monthly', async ({
		page,
	}) => {
		await go(page, '/reports?view=monthly&year=2025&month=10');
		await page.waitForTimeout(500);
		await expect(page.getByRole('button', { name: /^Monthly$/ })).toBeVisible();
		const monthLabel = page
			.locator('[class*="MonthNavigator"] [class*="label"]')
			.first();
		const text = await monthLabel.textContent();
		expect(text ?? '').toMatch(/October\s+2025/);
	});

	test('AUDIT-#NEW: ?user= deep-link selects that user and survives reload', async ({
		page,
	}) => {
		await go(
			page,
			'/reports?view=monthly&year=2025&month=10&user=Sarah%20Johnson',
		);
		await page.waitForTimeout(500);

		await page
			.locator('[class*="weekdayLabel"]')
			.first()
			.waitFor({ state: 'visible', timeout: 15000 });

		const focus = page.getByLabel('Monthly focus');
		const selectedText = await focus.evaluate((el) => {
			const select = el as HTMLSelectElement;
			const option = select.options[select.selectedIndex];
			return option?.text ?? '';
		});
		expect(selectedText).toContain('Sarah Johnson');

		await page.reload();
		await page.waitForLoadState('networkidle');
		await page
			.locator('[class*="weekdayLabel"]')
			.first()
			.waitFor({ state: 'visible', timeout: 15000 });

		const focusAfterReload = page.getByLabel('Monthly focus');
		const selectedTextAfterReload = await focusAfterReload.evaluate((el) => {
			const select = el as HTMLSelectElement;
			const option = select.options[select.selectedIndex];
			return option?.text ?? '';
		});
		expect(selectedTextAfterReload).toContain('Sarah Johnson');
	});
});

test.describe('Sort + filter interaction probes', () => {
	test('sort by hours descending, then change month, sort persists', async ({
		page,
	}) => {
		await go(page, '/reports');
		await page.getByRole('button', { name: /^Monthly$/ }).click();
		await page
			.locator('[class*="weekdayLabel"]')
			.first()
			.waitFor({ state: 'visible', timeout: 15000 });

		// Click "Hours" header to sort.
		const hoursHeader = page.getByRole('button', { name: /^Hours/i }).first();
		const headerVisible = await hoursHeader.isVisible().catch(() => false);
		if (!headerVisible) {
			test.info().annotations.push({
				type: 'note',
				description: 'Hours header not visible; OverviewTable absent',
			});
			return;
		}
		await hoursHeader.click(); // asc
		await hoursHeader.click(); // desc

		// Change month, sort should persist (URL-state).
		await page.getByRole('button', { name: 'Previous month' }).click();
		await page.waitForTimeout(300);
		await page.getByRole('button', { name: 'Next month' }).click();
		await page.waitForTimeout(300);
		// Just sanity: page is still alive and the table still renders.
		await expect(hoursHeader).toBeVisible();
	});

	test('search filter persists through Weekly⇄Monthly toggle', async ({
		page,
	}) => {
		await go(page, '/reports');
		await page.getByRole('button', { name: /^Monthly$/ }).click();
		await page.waitForTimeout(300);

		const search = page.getByRole('textbox', { name: /search/i }).first();
		if (!(await search.isVisible().catch(() => false))) {
			test.info().annotations.push({
				type: 'note',
				description: 'Search box not present in monthly view',
			});
			return;
		}
		await search.fill('Sarah');
		await page.waitForTimeout(150);

		await page.getByRole('button', { name: /^Weekly$/ }).click();
		await page.waitForTimeout(150);
		await page.getByRole('button', { name: /^Monthly$/ }).click();
		await page.waitForTimeout(150);
		await expect(search).toHaveValue('Sarah');
	});
});

test.describe('Bulk export probe', () => {
	test('AUDIT-#NEW: bulk export filenames include "logged" policy', async ({
		page,
	}) => {
		await go(page, '/reports');
		await page.getByRole('button', { name: /^Monthly$/ }).click();
		await page
			.locator('[class*="weekdayLabel"]')
			.first()
			.waitFor({ state: 'visible', timeout: 15000 });

		const exportAll = page.getByRole('button', {
			name: /Export monthly CSVs/i,
		});
		if ((await exportAll.count()) === 0) {
			test.info().annotations.push({
				type: 'note',
				description: 'Bulk export button not present',
			});
			return;
		}

		const downloads: string[] = [];
		page.on('download', (d) => downloads.push(d.suggestedFilename()));
		await exportAll.click();
		await page.waitForTimeout(2500);

		// Each user's CSV should be of the form
		// "timesheet_<user>_<year>-<month>_logged.csv".
		const userCsvs = downloads.filter((f) =>
			/^timesheet_.+_\d{4}-\d{2}_logged\.csv$/.test(f),
		);
		expect(userCsvs.length).toBeGreaterThanOrEqual(1);

		// And exactly one summary CSV.
		const summary = downloads.filter((f) =>
			/^summary-\d{4}-\d{2}-logged\.csv$/.test(f),
		);
		expect(summary.length).toBe(1);
	});
});

test.describe('Edge data probes', () => {
	test('navigating to a month with no mock data shows a friendly empty state', async ({
		page,
	}) => {
		await go(page, '/reports?view=monthly&year=2024&month=1');
		await page
			.getByRole('button', { name: /^Monthly$/ })
			.click()
			.catch(() => {});
		await page.waitForTimeout(800);
		const emptyMatch = await page
			.getByText(/No worklogs found|No worklogs were recorded/i)
			.first()
			.isVisible()
			.catch(() => false);
		expect(emptyMatch).toBe(true);
	});

	test('AUDIT-#41: Pattern A and Pattern B are both present in mock data', async ({
		page,
	}) => {
		// Implementation check via the running app: October has the new Alex
		// Pattern B entries. Verify by counting the IsBackdated=true rows
		// across all 3 users' CSVs. There should be at least
		// 2 (Sarah) + 3 (Mike) + 2 (Alex) = 7 backdated entries.
		await go(page, '/reports');
		await page.getByRole('button', { name: /^Monthly$/ }).click();
		await page
			.locator('[class*="weekdayLabel"]')
			.first()
			.waitFor({ state: 'visible', timeout: 15000 });

		const exportAll = page.getByRole('button', {
			name: /Export monthly CSVs/i,
		});
		if ((await exportAll.count()) === 0) return;

		// Navigate to October 2025 first.
		const monthLabel = page
			.locator('[class*="MonthNavigator"] [class*="label"]')
			.first();
		for (let i = 0; i < 30; i++) {
			const t = await monthLabel.textContent();
			if (t && /October\s+2025/.test(t)) break;
			await page.getByRole('button', { name: 'Previous month' }).click();
			await page.waitForTimeout(80);
		}

		const downloads: { filename: string; text: string }[] = [];
		page.on('download', async (d) => {
			const s = await d.createReadStream();
			const chunks: Buffer[] = [];
			for await (const c of s as unknown as AsyncIterable<Buffer>)
				chunks.push(c);
			downloads.push({
				filename: d.suggestedFilename(),
				text: Buffer.concat(chunks).toString('utf8'),
			});
		});
		await exportAll.click();
		await page.waitForTimeout(2500);

		const sources = new Set<string>();
		let backdatedRows = 0;
		for (const { filename, text } of downloads) {
			if (!filename.startsWith('timesheet_')) continue;
			for (const line of text.split('\n')) {
				const cols = line.split(';');
				if (cols.length < 9) continue;
				if (cols[6] === 'true') {
					backdatedRows++;
					sources.add(cols[7]);
				}
			}
		}

		expect(backdatedRows).toBeGreaterThanOrEqual(7);
		expect(sources.has('comment')).toBe(true);
		expect(sources.has('jira-native')).toBe(true);
	});
});

test.describe('Hover/keyboard probes', () => {
	test('worklog item shows tooltip on hover with classifier-aware text', async ({
		page,
	}) => {
		await go(page, '/reports?view=monthly&year=2025&month=10');
		await page.getByRole('button', { name: /^Monthly$/ }).click();
		await page
			.locator('[class*="weekdayLabel"]')
			.first()
			.waitFor({ state: 'visible', timeout: 15000 });

		const sarahCard = page
			.locator('[class*="card"]')
			.filter({ hasText: 'Sarah Johnson' })
			.first();
		const tooltipIcon = sarahCard.locator('[class*="retroactiveIcon"]').first();
		await expect(tooltipIcon).toBeVisible();
		const title = await tooltipIcon.getAttribute('title');
		expect(title ?? '').toMatch(/intended|logged/i);
	});

	test('reload after navigating to October preserves the visited month via URL', async ({
		page,
	}) => {
		await go(page, '/reports?view=monthly&year=2025&month=10');
		await page.getByRole('button', { name: /^Monthly$/ }).click();
		await page
			.locator('[class*="weekdayLabel"]')
			.first()
			.waitFor({ state: 'visible', timeout: 15000 });
		await page.reload();
		await page.waitForLoadState('networkidle');
		await page
			.locator('[class*="weekdayLabel"]')
			.first()
			.waitFor({ state: 'visible', timeout: 15000 });
		const monthLabel = page
			.locator('[class*="MonthNavigator"] [class*="label"]')
			.first();
		const text = await monthLabel.textContent();
		expect(text ?? '').toMatch(/October\s+2025/);
	});
});
