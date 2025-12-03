import type { Version2Models } from 'jira.js';
import { describe, expect, it } from 'vitest';
import type { EnrichedJiraWorklog } from '../../../stores/useTimesheetStore';
import { buildCsvForUser } from '../csv';

describe('buildCsvForUser', () => {
	const mockIssue: Version2Models.Issue = {
		id: '12345',
		key: 'PROJ-123',
		fields: {
			summary: 'Test Issue',
		},
	} as Version2Models.Issue;

	const mockAuthor: Version2Models.User = {
		displayName: 'John Doe',
		emailAddress: 'john@example.com',
		accountId: 'acc123',
		active: true,
	} as Version2Models.User;

	it('should generate CSV with correct headers and total row', () => {
		const data: EnrichedJiraWorklog[] = [];
		const issueSummaries: Record<string, string> = {};

		const result = buildCsvForUser(data, issueSummaries);
		const lines = result.split('\n');

		expect(lines).toHaveLength(2); // header + total row
		expect(lines[0]).toBe(
			'Name,TicketKey,TicketName,OriginalIntendedDate,ActualLoggedDate,BookedTime',
		);
		expect(lines[1]).toBe(',,,,Total,0.00');
	});

	it('should export a simple worklog correctly', () => {
		const data: EnrichedJiraWorklog[] = [
			{
				id: '1',
				started: '2025-01-15T10:00:00.000Z',
				timeSpentSeconds: 7200, // 2 hours
				author: mockAuthor,
				issue: mockIssue,
				comment: 'Some work done',
			} as EnrichedJiraWorklog,
		];

		const issueSummaries: Record<string, string> = {
			'12345': 'Test Issue Summary',
		};

		const result = buildCsvForUser(data, issueSummaries);
		const lines = result.split('\n');

		expect(lines).toHaveLength(3); // header + 1 row + total row
		expect(lines[0]).toBe(
			'Name,TicketKey,TicketName,OriginalIntendedDate,ActualLoggedDate,BookedTime',
		);
		expect(lines[1]).toBe(
			'John Doe,PROJ-123,Test Issue Summary,,2025/01/15,2.00',
		);
		expect(lines[2]).toBe(',,,,Total,2.00');
	});

	it('should extract OriginalIntendedDate from retroactive worklog comment', () => {
		const data: EnrichedJiraWorklog[] = [
			{
				id: '1',
				started: '2025-02-05T10:00:00.000Z',
				timeSpentSeconds: 3600, // 1 hour
				author: mockAuthor,
				issue: mockIssue,
				comment: 'Work from before. Original Worklog Date was: 2025/01/20',
			} as EnrichedJiraWorklog,
		];

		const issueSummaries: Record<string, string> = {
			'12345': 'Test Issue',
		};

		const result = buildCsvForUser(data, issueSummaries);
		const lines = result.split('\n');

		expect(lines[1]).toBe(
			'John Doe,PROJ-123,Test Issue,2025/01/20,2025/02/05,1.00',
		);
	});

	it('should handle CSV special characters in names and summaries', () => {
		const data: EnrichedJiraWorklog[] = [
			{
				id: '1',
				started: '2025-01-15T10:00:00.000Z',
				timeSpentSeconds: 1800, // 0.5 hours
				author: {
					...mockAuthor,
					displayName: 'Jane, Doe',
				},
				issue: mockIssue,
			} as EnrichedJiraWorklog,
		];

		const issueSummaries: Record<string, string> = {
			'12345': 'Issue with "quotes" and, commas',
		};

		const result = buildCsvForUser(data, issueSummaries);
		const lines = result.split('\n');

		expect(lines[1]).toBe(
			'"Jane, Doe",PROJ-123,"Issue with ""quotes"" and, commas",,2025/01/15,0.50',
		);
	});

	it('should handle multiple worklogs', () => {
		const data: EnrichedJiraWorklog[] = [
			{
				id: '1',
				started: '2025-01-15T10:00:00.000Z',
				timeSpentSeconds: 3600,
				author: mockAuthor,
				issue: mockIssue,
			} as EnrichedJiraWorklog,
			{
				id: '2',
				started: '2025-01-16T14:00:00.000Z',
				timeSpentSeconds: 7200,
				author: mockAuthor,
				issue: {
					...mockIssue,
					id: '12346',
					key: 'PROJ-124',
				},
			} as EnrichedJiraWorklog,
		];

		const issueSummaries: Record<string, string> = {
			'12345': 'First Issue',
			'12346': 'Second Issue',
		};

		const result = buildCsvForUser(data, issueSummaries);
		const lines = result.split('\n');

		expect(lines).toHaveLength(4); // header + 2 rows + total row
		expect(lines[1]).toBe('John Doe,PROJ-123,First Issue,,2025/01/15,1.00');
		expect(lines[2]).toBe('John Doe,PROJ-124,Second Issue,,2025/01/16,2.00');
		expect(lines[3]).toBe(',,,,Total,3.00'); // 1 + 2 = 3 hours
	});

	it('should handle missing issue summary', () => {
		const data: EnrichedJiraWorklog[] = [
			{
				id: '1',
				started: '2025-01-15T10:00:00.000Z',
				timeSpentSeconds: 3600,
				author: mockAuthor,
				issue: mockIssue,
			} as EnrichedJiraWorklog,
		];

		const issueSummaries: Record<string, string> = {};

		const result = buildCsvForUser(data, issueSummaries);
		const lines = result.split('\n');

		expect(lines[1]).toBe('John Doe,PROJ-123,,,2025/01/15,1.00');
	});

	it('should format time with 2 decimal places', () => {
		const testCases = [
			{ seconds: 3600, expected: '1.00' }, // 1 hour
			{ seconds: 1800, expected: '0.50' }, // 0.5 hours
			{ seconds: 5400, expected: '1.50' }, // 1.5 hours
			{ seconds: 3666, expected: '1.02' }, // 1.018333... hours
		];

		for (const testCase of testCases) {
			const data: EnrichedJiraWorklog[] = [
				{
					id: '1',
					started: '2025-01-15T10:00:00.000Z',
					timeSpentSeconds: testCase.seconds,
					author: mockAuthor,
					issue: mockIssue,
				} as EnrichedJiraWorklog,
			];

			const result = buildCsvForUser(data, {});
			const lines = result.split('\n');
			const time = lines[1].split(',')[5];

			expect(time).toBe(testCase.expected);
		}
	});
});
