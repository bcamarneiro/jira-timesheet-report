import { describe, expect, it } from 'vitest';
import type { TeamMemberSummary } from '../../../services/teamService';
import type { EnrichedJiraWorklog } from '../../../../types/jira';
import {
	buildReportsSnapshotHtml,
	buildReportsSnapshotMarkdown,
} from '../reportSnapshots';

function createMember(
	email: string,
	displayName: string,
	totalSeconds: number,
	gapSeconds: number,
): TeamMemberSummary {
	return {
		email,
		displayName,
		dailyHours: new Map(),
		totalSeconds,
		targetSeconds: 40 * 3600,
		gapSeconds,
	};
}

function createWorklog(
	user: string,
	date: string,
	timeSpentSeconds: number,
): EnrichedJiraWorklog {
	return {
		author: {
			displayName: user,
			emailAddress: `${user.toLowerCase()}@example.com`,
		},
		started: `${date}T09:00:00.000+0000`,
		timeSpentSeconds,
		issue: {
			id: '10000',
			key: 'APP-1',
			fields: {
				summary: 'Snapshot work',
			},
		},
	};
}

describe('buildReportsSnapshotMarkdown', () => {
	it('builds a weekly markdown snapshot with manager trends', () => {
		const output = buildReportsSnapshotMarkdown({
			viewMode: 'weekly',
			jiraHost: 'example.atlassian.net',
			weekStart: '2026-03-23',
			weekEnd: '2026-03-29',
			searchQuery: 'alice',
			onlyAttentionNeeded: true,
			managerMode: true,
			trendWeeks: 4,
			sortField: 'gap',
			sortDirection: 'desc',
			members: [createMember('alice@example.com', 'Alice', 32 * 3600, 8 * 3600)],
			validationState: {
				status: 'consistent',
				message: 'Weekly and monthly totals matched.',
				checkedAt: '2026-03-30 10:00',
			},
			trendModel: {
				weeks: [
					{
						weekStart: '2026-03-23',
						weekEnd: '2026-03-29',
						memberCount: 1,
						totalSeconds: 32 * 3600,
						totalGapSeconds: 8 * 3600,
						complianceRate: 0,
						attentionCount: 1,
					},
				],
				averageComplianceRate: 0,
				totalTrendGapSeconds: 8 * 3600,
				recurringGapMembers: [
					{
						email: 'alice@example.com',
						displayName: 'Alice',
						gapWeeks: 3,
						currentGapSeconds: 8 * 3600,
						averageGapSeconds: 6 * 3600,
						currentLoggedSeconds: 32 * 3600,
					},
				],
			},
		});

		expect(output).toContain('# Jira Timesheet Report Snapshot');
		expect(output).toContain('## 4-Week Trend');
		expect(output).toContain('Recurring Gap Watchlist');
		expect(output).toContain('| Alice | alice@example.com | 32h | 8h |');
	});

	it('builds a monthly markdown snapshot with daily breakdown for a single user', () => {
		const output = buildReportsSnapshotMarkdown({
			viewMode: 'monthly',
			jiraHost: 'example.atlassian.net',
			monthLabel: 'March 2026',
			year: 2026,
			monthZeroIndexed: 2,
			searchQuery: '',
			selectedUser: 'Alice',
			entries: [
				[
					'Alice',
					{
						'2026-03-03': [createWorklog('Alice', '2026-03-03', 4 * 3600)],
						'2026-03-04': [createWorklog('Alice', '2026-03-04', 2 * 3600)],
					},
				],
			],
		});

		expect(output).toContain('View: Monthly (March 2026)');
		expect(output).toContain('| Alice | 6h | 2 | 2 |');
		expect(output).toContain('## Daily breakdown for Alice');
		expect(output).toContain('- 2026-03-03: 4h across 1 entry');
	});
});

describe('buildReportsSnapshotHtml', () => {
	it('builds a weekly html snapshot with a visible team table', () => {
		const output = buildReportsSnapshotHtml({
			viewMode: 'weekly',
			jiraHost: 'example.atlassian.net',
			weekStart: '2026-03-23',
			weekEnd: '2026-03-29',
			searchQuery: '',
			onlyAttentionNeeded: false,
			managerMode: false,
			trendWeeks: 6,
			sortField: 'name',
			sortDirection: 'asc',
			members: [createMember('alice@example.com', 'Alice', 40 * 3600, 0)],
			validationState: {
				status: 'idle',
				message: 'Ready to validate.',
				checkedAt: null,
			},
		});

		expect(output).toContain('<title>Jira Timesheet Report Snapshot</title>');
		expect(output).toContain('<h2>Visible Team Table</h2>');
		expect(output).toContain('<td>Alice</td>');
		expect(output).toContain('<td>40h</td>');
	});
});
