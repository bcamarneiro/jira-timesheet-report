import { describe, expect, it } from 'vitest';
import type { WeekWorklogEntry } from '../../../stores/useDashboardStore';
import { generateWeeklyCsv } from '../weekCsvExport';

describe('generateWeeklyCsv', () => {
	const weekStart = '2026-03-09';
	const weekEnd = '2026-03-15';

	it('should generate CSV with correct headers when no worklogs', () => {
		const result = generateWeeklyCsv(weekStart, weekEnd, []);
		const lines = result.split('\n');

		expect(lines).toHaveLength(1);
		expect(lines[0]).toBe(
			'Date;Day;Issue Key;Issue Summary;Time Spent (hours);Time Spent (formatted)',
		);
	});

	it('should export a single worklog correctly', () => {
		const worklogs: WeekWorklogEntry[] = [
			{
				date: '2026-03-10',
				issueKey: 'PROJ-100',
				issueSummary: 'Implement feature',
				timeSpentSeconds: 7200,
			},
		];

		const result = generateWeeklyCsv(weekStart, weekEnd, worklogs);
		const lines = result.split('\n');

		expect(lines).toHaveLength(2);
		expect(lines[1]).toBe('2026-03-10;Tue;PROJ-100;Implement feature;2.00;2h');
	});

	it('should sort by date then issue key', () => {
		const worklogs: WeekWorklogEntry[] = [
			{
				date: '2026-03-11',
				issueKey: 'PROJ-200',
				issueSummary: 'Second issue',
				timeSpentSeconds: 3600,
			},
			{
				date: '2026-03-10',
				issueKey: 'PROJ-100',
				issueSummary: 'First issue',
				timeSpentSeconds: 7200,
			},
			{
				date: '2026-03-10',
				issueKey: 'PROJ-050',
				issueSummary: 'Earlier key same day',
				timeSpentSeconds: 1800,
			},
		];

		const result = generateWeeklyCsv(weekStart, weekEnd, worklogs);
		const lines = result.split('\n');

		expect(lines).toHaveLength(4);
		expect(lines[1]).toContain('PROJ-050');
		expect(lines[2]).toContain('PROJ-100');
		expect(lines[3]).toContain('PROJ-200');
	});

	it('should handle CSV special characters in summaries', () => {
		const worklogs: WeekWorklogEntry[] = [
			{
				date: '2026-03-10',
				issueKey: 'PROJ-100',
				issueSummary: 'Fix "bug" with; separator, and commas',
				timeSpentSeconds: 3600,
			},
		];

		const result = generateWeeklyCsv(weekStart, weekEnd, worklogs);
		const lines = result.split('\n');

		expect(lines[1]).toBe(
			'2026-03-10;Tue;PROJ-100;"Fix ""bug"" with; separator, and commas";1.00;1h',
		);
	});

	it('should handle missing issue summary', () => {
		const worklogs: WeekWorklogEntry[] = [
			{
				date: '2026-03-10',
				issueKey: 'PROJ-100',
				timeSpentSeconds: 5400,
			},
		];

		const result = generateWeeklyCsv(weekStart, weekEnd, worklogs);
		const lines = result.split('\n');

		expect(lines[1]).toBe('2026-03-10;Tue;PROJ-100;;1.50;1h 30m');
	});

	it('should format time correctly', () => {
		const testCases = [
			{ seconds: 3600, hours: '1.00', formatted: '1h' },
			{ seconds: 1800, hours: '0.50', formatted: '30m' },
			{ seconds: 5400, hours: '1.50', formatted: '1h 30m' },
			{ seconds: 28800, hours: '8.00', formatted: '8h' },
		];

		for (const tc of testCases) {
			const worklogs: WeekWorklogEntry[] = [
				{
					date: '2026-03-10',
					issueKey: 'PROJ-100',
					issueSummary: 'Test',
					timeSpentSeconds: tc.seconds,
				},
			];

			const result = generateWeeklyCsv(weekStart, weekEnd, worklogs);
			const lines = result.split('\n');
			const fields = lines[1].split(';');

			expect(fields[4]).toBe(tc.hours);
			expect(fields[5]).toBe(tc.formatted);
		}
	});

	it('should use semicolon as delimiter', () => {
		const worklogs: WeekWorklogEntry[] = [
			{
				date: '2026-03-10',
				issueKey: 'PROJ-100',
				issueSummary: 'Test',
				timeSpentSeconds: 3600,
			},
		];

		const result = generateWeeklyCsv(weekStart, weekEnd, worklogs);
		const headerLine = result.split('\n')[0];
		const semicolonCount = (headerLine.match(/;/g) || []).length;

		expect(semicolonCount).toBe(5); // 6 columns = 5 semicolons
	});
});
