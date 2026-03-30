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
});
