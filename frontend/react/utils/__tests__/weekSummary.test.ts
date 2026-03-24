import { describe, expect, it } from 'vitest';
import { generateWeeklySummary } from '../weekSummary';

describe('generateWeeklySummary', () => {
	it('should generate a summary with no worklogs', () => {
		const result = generateWeeklySummary('2026-03-10', '2026-03-16', []);

		expect(result).toContain('## Week:');
		expect(result).toContain('No worklogs recorded this week.');
	});

	it('should generate a summary for a single issue on one day', () => {
		const result = generateWeeklySummary('2026-03-10', '2026-03-16', [
			{
				date: '2026-03-10',
				issueKey: 'PROJ-123',
				issueSummary: 'Implement login',
				timeSpentSeconds: 7200,
			},
		]);

		expect(result).toContain('### PROJ-123 - Implement login');
		expect(result).toContain('- Tue: 2h');
		expect(result).toContain('- **Total: 2h**');
		expect(result).toContain('**Week Total: 2h / 40h**');
		expect(result).toContain('### Daily Totals');
		expect(result).toContain('- Tue (2026-03-10): 2h');
	});

	it('should group worklogs by issueKey across multiple days', () => {
		const result = generateWeeklySummary('2026-03-10', '2026-03-16', [
			{
				date: '2026-03-10',
				issueKey: 'PROJ-123',
				issueSummary: 'Implement login',
				timeSpentSeconds: 7200, // 2h
			},
			{
				date: '2026-03-11',
				issueKey: 'PROJ-123',
				issueSummary: 'Implement login',
				timeSpentSeconds: 10800, // 3h
			},
		]);

		expect(result).toContain('### PROJ-123 - Implement login');
		expect(result).toContain('- Tue: 2h');
		expect(result).toContain('- Wed: 3h');
		expect(result).toContain('- **Total: 5h**');
		expect(result).toContain('**Week Total: 5h / 40h**');
		expect(result).toContain('- Tue (2026-03-10): 2h');
		expect(result).toContain('- Wed (2026-03-11): 3h');
	});

	it('should handle multiple issues', () => {
		const result = generateWeeklySummary('2026-03-10', '2026-03-16', [
			{
				date: '2026-03-10',
				issueKey: 'PROJ-123',
				issueSummary: 'Implement login',
				timeSpentSeconds: 7200, // 2h
			},
			{
				date: '2026-03-10',
				issueKey: 'PROJ-456',
				issueSummary: 'Fix bug',
				timeSpentSeconds: 5400, // 1h 30m
			},
		]);

		expect(result).toContain('### PROJ-123 - Implement login');
		expect(result).toContain('### PROJ-456 - Fix bug');
		expect(result).toContain('**Week Total: 3h 30m / 40h**');
	});

	it('should aggregate same-issue same-day worklogs', () => {
		const result = generateWeeklySummary('2026-03-10', '2026-03-16', [
			{
				date: '2026-03-10',
				issueKey: 'PROJ-123',
				issueSummary: 'Implement login',
				timeSpentSeconds: 3600, // 1h
			},
			{
				date: '2026-03-10',
				issueKey: 'PROJ-123',
				issueSummary: 'Implement login',
				timeSpentSeconds: 3600, // 1h
			},
		]);

		expect(result).toContain('- Tue: 2h');
		expect(result).toContain('- **Total: 2h**');
	});

	it('should handle issues without a summary', () => {
		const result = generateWeeklySummary('2026-03-10', '2026-03-16', [
			{
				date: '2026-03-10',
				issueKey: 'PROJ-999',
				timeSpentSeconds: 1800,
			},
		]);

		expect(result).toContain('### PROJ-999');
		expect(result).not.toContain('### PROJ-999 -');
	});

	it('should format minutes-only durations correctly', () => {
		const result = generateWeeklySummary('2026-03-10', '2026-03-16', [
			{
				date: '2026-03-10',
				issueKey: 'PROJ-1',
				timeSpentSeconds: 1800, // 30m
			},
		]);

		expect(result).toContain('- Tue: 30m');
		expect(result).toContain('- **Total: 30m**');
	});

	it('should format hours and minutes durations correctly', () => {
		const result = generateWeeklySummary('2026-03-10', '2026-03-16', [
			{
				date: '2026-03-10',
				issueKey: 'PROJ-1',
				timeSpentSeconds: 5400, // 1h 30m
			},
		]);

		expect(result).toContain('- Tue: 1h 30m');
	});

	it('should sort days chronologically within an issue', () => {
		const result = generateWeeklySummary('2026-03-10', '2026-03-16', [
			{
				date: '2026-03-12',
				issueKey: 'PROJ-1',
				timeSpentSeconds: 3600,
			},
			{
				date: '2026-03-10',
				issueKey: 'PROJ-1',
				timeSpentSeconds: 7200,
			},
		]);

		const tueLine = result.indexOf('- Tue:');
		const thuLine = result.indexOf('- Thu:');
		expect(tueLine).toBeLessThan(thuLine);
	});

	it('should sort issues by total time descending', () => {
		const result = generateWeeklySummary('2026-03-10', '2026-03-16', [
			{
				date: '2026-03-10',
				issueKey: 'PROJ-LOW',
				timeSpentSeconds: 1800,
			},
			{
				date: '2026-03-10',
				issueKey: 'PROJ-HIGH',
				timeSpentSeconds: 7200,
			},
		]);

		expect(result.indexOf('### PROJ-HIGH')).toBeLessThan(
			result.indexOf('### PROJ-LOW'),
		);
	});

	it('should include the week range in the header', () => {
		const result = generateWeeklySummary('2026-03-10', '2026-03-16', []);

		expect(result).toContain('## Week:');
		expect(result).toContain('Mar');
	});
});
