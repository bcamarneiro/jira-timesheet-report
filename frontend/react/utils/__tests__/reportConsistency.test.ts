import { describe, expect, it } from 'vitest';
import type { WorklogItem } from '../../../services/monthWorklogService';
import type { TeamMemberSummary } from '../../../services/teamService';
import { validateReportsConsistency } from '../reportConsistency';

function createMember(
	email: string,
	displayName: string,
	totalSeconds: number,
): TeamMemberSummary {
	return {
		email,
		displayName,
		dailyHours: new Map(),
		totalSeconds,
		targetSeconds: 40 * 3600,
		gapSeconds: Math.max(0, 40 * 3600 - totalSeconds),
	};
}

function createWorklog(
	email: string,
	displayName: string,
	started: string,
	timeSpentSeconds: number,
	extras: { comment?: string; created?: string } = {},
): WorklogItem {
	return {
		author: {
			emailAddress: email,
			displayName,
		},
		started,
		timeSpentSeconds,
		issue: {
			id: '10000',
			key: 'APP-1',
			fields: {
				summary: 'Consistency test',
			},
		},
		...(extras.comment !== undefined ? { comment: extras.comment } : {}),
		...(extras.created !== undefined ? { created: extras.created } : {}),
	};
}

describe('validateReportsConsistency', () => {
	it('matches weekly and monthly totals for the allowed users set', () => {
		const result = validateReportsConsistency(
			[
				createMember('alice@example.com', 'Alice', 7200),
				createMember('bob@example.com', 'Bob', 0),
			],
			[
				createWorklog(
					'alice@example.com',
					'Alice',
					'2026-03-24T09:00:00.000+0000',
					7200,
				),
				createWorklog(
					'charlie@example.com',
					'Charlie',
					'2026-03-24T10:00:00.000+0000',
					3600,
				),
			],
			'2026-03-23',
			'2026-03-29',
			'alice@example.com,bob@example.com',
		);

		expect(result).toEqual({
			matches: true,
			checkedUsers: 2,
			mismatches: [],
		});
	});

	it('reports mismatches when weekly and monthly totals diverge', () => {
		const result = validateReportsConsistency(
			[
				createMember('alice@example.com', 'Alice', 7200),
				createMember('bob@example.com', 'Bob', 3600),
			],
			[
				createWorklog(
					'alice@example.com',
					'Alice',
					'2026-03-24T09:00:00.000+0000',
					1800,
				),
				createWorklog(
					'bob@example.com',
					'Bob',
					'2026-03-25T09:00:00.000+0000',
					3600,
				),
			],
			'2026-03-23',
			'2026-03-29',
			'alice@example.com,bob@example.com',
		);

		expect(result.matches).toBe(false);
		expect(result.checkedUsers).toBe(2);
		expect(result.mismatches).toEqual([
			{
				email: 'alice@example.com',
				displayName: 'Alice',
				weeklySeconds: 7200,
				monthlySeconds: 1800,
			},
		]);
	});

	it('Pattern A (comment backdate): bucket by loggedOn for the week containing started', () => {
		const worklog = createWorklog(
			'alice@example.com',
			'Alice',
			'2025-10-05T09:00:00.000+0000',
			3600,
			{ comment: 'Original Worklog Date was: 2025/09/25' },
		);

		const loggedWeek = validateReportsConsistency(
			[createMember('alice@example.com', 'Alice', 3600)],
			[worklog],
			'2025-10-05',
			'2025-10-11',
			'alice@example.com',
		);
		expect(loggedWeek).toEqual({
			matches: true,
			checkedUsers: 1,
			mismatches: [],
		});

		const intendedWeek = validateReportsConsistency(
			[createMember('alice@example.com', 'Alice', 0)],
			[worklog],
			'2025-09-22',
			'2025-09-28',
			'alice@example.com',
		);
		expect(intendedWeek).toEqual({
			matches: true,
			checkedUsers: 1,
			mismatches: [],
		});
	});

	it('Pattern B (jira-native backdate): bucket by created when started is in a prior month', () => {
		const worklog = createWorklog(
			'alice@example.com',
			'Alice',
			'2025-09-28T10:00:00.000Z',
			3600,
			{ created: '2025-10-02T10:00:00.000Z' },
		);

		const createdWeek = validateReportsConsistency(
			[createMember('alice@example.com', 'Alice', 3600)],
			[worklog],
			'2025-09-29',
			'2025-10-05',
			'alice@example.com',
		);
		expect(createdWeek).toEqual({
			matches: true,
			checkedUsers: 1,
			mismatches: [],
		});

		const startedWeek = validateReportsConsistency(
			[createMember('alice@example.com', 'Alice', 0)],
			[worklog],
			'2025-09-22',
			'2025-09-28',
			'alice@example.com',
		);
		expect(startedWeek).toEqual({
			matches: true,
			checkedUsers: 1,
			mismatches: [],
		});
	});
});
