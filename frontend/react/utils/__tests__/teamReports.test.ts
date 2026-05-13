import { describe, expect, it } from 'vitest';
import type { WorklogItem } from '../../../services/monthWorklogService';
import { buildManagerTrendModel, buildTeamSummaries } from '../teamReports';

function createWorklog(
	email: string,
	displayName: string,
	started: string,
	timeSpentSeconds: number,
	created?: string,
): WorklogItem {
	return {
		author: {
			emailAddress: email,
			displayName,
		},
		started,
		timeSpentSeconds,
		...(created ? { created } : {}),
		issue: {
			id: '10000',
			key: 'APP-1',
			fields: {
				summary: 'Trend work',
			},
		},
	};
}

describe('buildTeamSummaries', () => {
	it('includes allowed users with zero hours and calculates historical week targets', () => {
		const summaries = buildTeamSummaries(
			[
				createWorklog(
					'alice@example.com',
					'Alice',
					'2026-03-03T09:00:00.000+0000',
					40 * 3600,
				),
				createWorklog(
					'bob@example.com',
					'Bob',
					'2026-03-04T09:00:00.000+0000',
					32 * 3600,
				),
			],
			'2026-03-02',
			'2026-03-08',
			'alice@example.com,bob@example.com,charlie@example.com',
		);

		expect(summaries.map((member) => member.displayName)).toEqual([
			'Alice',
			'Bob',
			'charlie@example.com',
		]);
		expect(summaries[0]?.gapSeconds).toBe(0);
		expect(summaries[1]?.gapSeconds).toBe(8 * 3600);
		expect(summaries[2]?.totalSeconds).toBe(0);
		expect(summaries[2]?.targetSeconds).toBe(40 * 3600);
	});

	it('excludes backdated worklogs from a member weekly total and gap', () => {
		const summaries = buildTeamSummaries(
			[
				createWorklog(
					'alice@example.com',
					'Alice',
					'2026-03-03T09:00:00.000+0000',
					32 * 3600,
				),
				{
					...createWorklog(
						'alice@example.com',
						'Alice',
						'2026-03-04T09:00:00.000+0000',
						8 * 3600,
					),
					comment: 'Original Worklog Date was: 2026/02/15',
				} as WorklogItem,
			],
			'2026-03-02',
			'2026-03-08',
			'alice@example.com',
		);

		// Without the 8h backdated log Alice has 32h of 40h target.
		expect(summaries[0]?.totalSeconds).toBe(32 * 3600);
		expect(summaries[0]?.gapSeconds).toBe(8 * 3600);
	});

	it('reduces a member target when a shared absence assignment covers part of the week', () => {
		const absenceDaysByUser = new Map([
			[
				'bob@example.com',
				new Map([
					[
						'2026-03-05',
						{
							date: '2026-03-05',
							reasons: ['[Team PTO] Vacation - Bob'],
							kind: 'vacation' as const,
						},
					],
				]),
			],
		]);

		const summaries = buildTeamSummaries(
			[
				createWorklog(
					'bob@example.com',
					'Bob',
					'2026-03-04T09:00:00.000+0000',
					32 * 3600,
				),
			],
			'2026-03-02',
			'2026-03-08',
			'bob@example.com',
			absenceDaysByUser,
		);

		expect(summaries[0]?.targetSeconds).toBe(32 * 3600);
		expect(summaries[0]?.gapSeconds).toBe(0);
	});
});

describe('buildManagerTrendModel', () => {
	it('builds recurring gap signals across multiple weeks', () => {
		const model = buildManagerTrendModel(
			[
				createWorklog(
					'alice@example.com',
					'Alice',
					'2026-03-03T09:00:00.000+0000',
					40 * 3600,
				),
				createWorklog(
					'bob@example.com',
					'Bob',
					'2026-03-04T09:00:00.000+0000',
					32 * 3600,
				),
				createWorklog(
					'alice@example.com',
					'Alice',
					'2026-03-10T09:00:00.000+0000',
					40 * 3600,
				),
				createWorklog(
					'bob@example.com',
					'Bob',
					'2026-03-11T09:00:00.000+0000',
					24 * 3600,
				),
			],
			'2026-03-09',
			2,
			'alice@example.com,bob@example.com',
		);

		expect(model.weeks).toHaveLength(2);
		expect(model.weeks[0]).toMatchObject({
			weekStart: '2026-03-02',
			complianceRate: 50,
			attentionCount: 1,
		});
		expect(model.weeks[1]).toMatchObject({
			weekStart: '2026-03-09',
			complianceRate: 50,
			attentionCount: 1,
		});
		expect(model.averageComplianceRate).toBe(50);
		expect(model.recurringGapMembers).toEqual([
			{
				email: 'bob@example.com',
				displayName: 'Bob',
				gapWeeks: 2,
				currentGapSeconds: 16 * 3600,
				averageGapSeconds: 12 * 3600,
				currentLoggedSeconds: 24 * 3600,
			},
		]);
	});

	it('uses reduced targets when absences are attributed during the trend window', () => {
		const absenceDaysByUser = new Map([
			[
				'bob@example.com',
				new Map([
					[
						'2026-03-11',
						{
							date: '2026-03-11',
							reasons: ['[Team PTO] Vacation - Bob'],
							kind: 'vacation' as const,
						},
					],
				]),
			],
		]);

		const model = buildManagerTrendModel(
			[
				createWorklog(
					'bob@example.com',
					'Bob',
					'2026-03-11T09:00:00.000+0000',
					32 * 3600,
				),
			],
			'2026-03-09',
			1,
			'bob@example.com',
			absenceDaysByUser,
		);

		expect(model.weeks[0]?.totalGapSeconds).toBe(0);
		expect(model.weeks[0]?.complianceRate).toBe(100);
	});

	it('excludes Pattern B jira-native backdates from weekly totals entirely', () => {
		// Started 2025-09-28, created 2025-10-06 (different month) — classifier
		// flags this as a backdated submission. Per the project-wide invariant,
		// backdated worklogs never contribute to a week's total. They show as
		// ghosts/side notes in the UI and remain in CSV exports for finance.
		const model = buildManagerTrendModel(
			[
				createWorklog(
					'alice@example.com',
					'Alice',
					'2025-09-28T10:00:00.000Z',
					4 * 3600,
					'2025-10-06T10:00:00.000Z',
				),
			],
			'2025-10-06',
			3,
			'alice@example.com',
		);

		expect(model.weeks.map((week) => week.weekStart)).toEqual([
			'2025-09-22',
			'2025-09-29',
			'2025-10-06',
		]);
		// Not counted on loggedOn week...
		expect(model.weeks[2]?.totalSeconds).toBe(0);
		// ...and not counted on intendedFor week either.
		expect(model.weeks[1]?.totalSeconds).toBe(0);
		expect(model.weeks[0]?.totalSeconds).toBe(0);
	});
});
