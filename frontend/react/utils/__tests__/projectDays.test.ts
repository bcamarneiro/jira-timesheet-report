import { describe, expect, it } from 'vitest';
import type { EnrichedJiraWorklog } from '../../../../types/jira';
import { projectDays } from '../projectDays';

const author = { displayName: 'Sarah', accountId: 'a1' };
const issue = { id: '1', key: 'PROJ-1', fields: { summary: 'X' } };

function w(over: Partial<EnrichedJiraWorklog>): EnrichedJiraWorklog {
	return {
		id: 'w',
		author,
		issue,
		timeSpentSeconds: 28800,
		...over,
	} as EnrichedJiraWorklog;
}

describe('projectDays', () => {
	it('places non-backdated worklogs on the same day, no ghosts', () => {
		const days = {
			'2025-10-15': [
				w({
					id: '1',
					started: '2025-10-15T10:00:00Z',
					created: '2025-10-15T10:30:00Z',
				}),
			],
		};

		const { loggedDays, ghostsByDay, backdatedIds } = projectDays(days);
		expect(Object.keys(loggedDays)).toEqual(['2025-10-15']);
		expect(loggedDays['2025-10-15']).toHaveLength(1);
		expect(Object.keys(ghostsByDay)).toEqual([]);
		expect(backdatedIds.size).toBe(0);
	});

	it('routes a Pattern A backdate to the logged day with a ghost on the intended day', () => {
		const days = {
			'2025-10-05': [
				w({
					id: '2',
					started: '2025-10-05T14:00:00Z',
					created: '2025-10-05T14:00:00Z',
					comment: 'Original Worklog Date was: 2025/09/25',
				}),
			],
		};

		const { loggedDays, ghostsByDay, backdatedIds } = projectDays(days);
		expect(loggedDays['2025-10-05']).toHaveLength(1);
		expect(ghostsByDay['2025-09-25']).toHaveLength(1);
		expect(backdatedIds.has('2')).toBe(true);
	});

	it('moves a Pattern B entry from the intended day (started) to the logged day (created), leaving a ghost behind', () => {
		const days = {
			// Note: grouped by started, which is the intended date for Pattern B
			'2025-09-28': [
				w({
					id: '3',
					started: '2025-09-28T10:00:00Z',
					created: '2025-10-02T10:00:00Z',
				}),
			],
		};

		const { loggedDays, ghostsByDay } = projectDays(days);
		expect(loggedDays['2025-10-02']).toHaveLength(1);
		expect(loggedDays['2025-09-28']).toBeUndefined();
		expect(ghostsByDay['2025-09-28']).toHaveLength(1);
	});

	it('does not duplicate ghost on the logged day for same-day backdates', () => {
		const days = {
			'2025-10-05': [
				w({
					id: '4',
					started: '2025-10-05T10:00:00Z',
					created: '2025-10-05T10:00:00Z',
					comment: 'Original Worklog Date was: 2025/10/05',
				}),
			],
		};

		const { ghostsByDay } = projectDays(days);
		expect(Object.keys(ghostsByDay)).toEqual([]);
	});
});
