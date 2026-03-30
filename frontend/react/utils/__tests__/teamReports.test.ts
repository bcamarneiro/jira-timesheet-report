import { describe, expect, it } from 'vitest';
import type { WorklogItem } from '../../../services/monthWorklogService';
import { buildManagerTrendModel, buildTeamSummaries } from '../teamReports';

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
});
