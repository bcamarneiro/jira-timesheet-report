import { describe, it, expect } from 'vitest';
import {
	groupWorklogsByUserAndDate,
	type GroupedWorklogs,
} from '../groupWorklogs';
import type { JiraWorklog } from '../../../../types/JiraWorklog';

const createMockWorklog = (
	displayName: string,
	started: string,
	id: string,
): JiraWorklog => ({
	self: `https://mock.atlassian.net/rest/api/2/issue/TEST-1/worklog/${id}`,
	id,
	issueId: 'TEST-1',
	issueKey: 'TEST-1',
	author: {
		self: `https://mock.atlassian.net/rest/api/2/user?accountId=${displayName.toLowerCase().replace(' ', '')}`,
		accountId: displayName.toLowerCase().replace(' ', ''),
		emailAddress: `${displayName.toLowerCase().replace(' ', '.')}@example.com`,
		displayName,
		active: true,
		timeZone: 'America/Sao_Paulo',
	},
	updateAuthor: {
		self: `https://mock.atlassian.net/rest/api/2/user?accountId=${displayName.toLowerCase().replace(' ', '')}`,
		accountId: displayName.toLowerCase().replace(' ', ''),
		emailAddress: `${displayName.toLowerCase().replace(' ', '.')}@example.com`,
		displayName,
		active: true,
		timeZone: 'America/Sao_Paulo',
	},
	comment: 'Test worklog',
	created: started,
	updated: started,
	started,
	timeSpent: '8h',
	timeSpentSeconds: 28800,
});

describe('groupWorklogsByUserAndDate', () => {
	it('should return empty object for null input', () => {
		const result = groupWorklogsByUserAndDate(null);
		expect(result).toEqual({});
	});

	it('should return empty object for empty array', () => {
		const result = groupWorklogsByUserAndDate([]);
		expect(result).toEqual({});
	});

	it('should group single worklog correctly', () => {
		const worklogs = [
			createMockWorklog('Alex Thompson', '2025-10-15T09:00:00.000-0300', '1'),
		];
		const result = groupWorklogsByUserAndDate(worklogs);

		expect(Object.keys(result)).toHaveLength(1);
		expect(result['Alex Thompson']).toBeDefined();
		expect(Object.keys(result['Alex Thompson'])).toHaveLength(1);
		expect(result['Alex Thompson']['2025-10-15']).toHaveLength(1);
	});

	it('should group multiple worklogs by same user on same day', () => {
		const worklogs = [
			createMockWorklog('Alex Thompson', '2025-10-15T09:00:00.000-0300', '1'),
			createMockWorklog('Alex Thompson', '2025-10-15T14:00:00.000-0300', '2'),
		];
		const result = groupWorklogsByUserAndDate(worklogs);

		expect(Object.keys(result)).toHaveLength(1);
		expect(result['Alex Thompson']['2025-10-15']).toHaveLength(2);
	});

	it('should group worklogs by same user on different days', () => {
		const worklogs = [
			createMockWorklog('Alex Thompson', '2025-10-15T09:00:00.000-0300', '1'),
			createMockWorklog('Alex Thompson', '2025-10-16T09:00:00.000-0300', '2'),
		];
		const result = groupWorklogsByUserAndDate(worklogs);

		expect(Object.keys(result)).toHaveLength(1);
		expect(Object.keys(result['Alex Thompson'])).toHaveLength(2);
		expect(result['Alex Thompson']['2025-10-15']).toHaveLength(1);
		expect(result['Alex Thompson']['2025-10-16']).toHaveLength(1);
	});

	it('should group worklogs by different users', () => {
		const worklogs = [
			createMockWorklog('Alex Thompson', '2025-10-15T09:00:00.000-0300', '1'),
			createMockWorklog('Sarah Johnson', '2025-10-15T09:00:00.000-0300', '2'),
		];
		const result = groupWorklogsByUserAndDate(worklogs);

		expect(Object.keys(result)).toHaveLength(2);
		expect(result['Alex Thompson']).toBeDefined();
		expect(result['Sarah Johnson']).toBeDefined();
	});

	it('should handle complex grouping scenario', () => {
		const worklogs = [
			// Alex: 2 worklogs on Oct 15, 1 on Oct 16
			createMockWorklog('Alex Thompson', '2025-10-15T09:00:00.000-0300', '1'),
			createMockWorklog('Alex Thompson', '2025-10-15T14:00:00.000-0300', '2'),
			createMockWorklog('Alex Thompson', '2025-10-16T09:00:00.000-0300', '3'),
			// Sarah: 1 worklog on Oct 15, 1 on Oct 17
			createMockWorklog('Sarah Johnson', '2025-10-15T09:00:00.000-0300', '4'),
			createMockWorklog('Sarah Johnson', '2025-10-17T09:00:00.000-0300', '5'),
			// Mike: 1 worklog on Oct 16
			createMockWorklog('Mike Chen', '2025-10-16T09:00:00.000-0300', '6'),
		];

		const result = groupWorklogsByUserAndDate(worklogs);

		// Check users
		expect(Object.keys(result)).toHaveLength(3);

		// Check Alex's worklogs
		expect(Object.keys(result['Alex Thompson'])).toHaveLength(2);
		expect(result['Alex Thompson']['2025-10-15']).toHaveLength(2);
		expect(result['Alex Thompson']['2025-10-16']).toHaveLength(1);

		// Check Sarah's worklogs
		expect(Object.keys(result['Sarah Johnson'])).toHaveLength(2);
		expect(result['Sarah Johnson']['2025-10-15']).toHaveLength(1);
		expect(result['Sarah Johnson']['2025-10-17']).toHaveLength(1);

		// Check Mike's worklogs
		expect(Object.keys(result['Mike Chen'])).toHaveLength(1);
		expect(result['Mike Chen']['2025-10-16']).toHaveLength(1);
	});

	it('should preserve worklog data in groups', () => {
		const worklog = createMockWorklog(
			'Alex Thompson',
			'2025-10-15T09:00:00.000-0300',
			'123',
		);
		const result = groupWorklogsByUserAndDate([worklog]);

		const grouped = result['Alex Thompson']['2025-10-15'][0];
		expect(grouped.id).toBe('123');
		expect(grouped.timeSpentSeconds).toBe(28800);
		expect(grouped.author.displayName).toBe('Alex Thompson');
	});
});
