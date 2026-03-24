import { describe, expect, it } from 'vitest';
import type { EnrichedJiraWorklog } from '../../../../types/jira';
import { deriveMonthlyReportState } from '../monthlyReport';

const createWorklog = (
	displayName: string,
	email: string,
	started: string,
	id: string,
	issueKey: string,
	summary: string,
): EnrichedJiraWorklog => ({
	id,
	author: {
		displayName,
		emailAddress: email,
		accountId: displayName.toLowerCase().replace(' ', ''),
		active: true,
	},
	started,
	timeSpentSeconds: 3600,
	comment: 'Worked on it',
	issue: {
		id: issueKey,
		key: issueKey,
		fields: {
			summary,
		},
	},
});

describe('deriveMonthlyReportState', () => {
	it('derives issue summaries by id and key', () => {
		const state = deriveMonthlyReportState(
			[
				createWorklog(
					'Alex Thompson',
					'alex@example.com',
					'2025-10-15T09:00:00.000-0300',
					'1',
					'PROJ-100',
					'First issue',
				),
			],
			'',
			'',
		);

		expect(state.issueSummaries['PROJ-100']).toBe('First issue');
	});

	it('groups worklogs by user and local date', () => {
		const state = deriveMonthlyReportState(
			[
				createWorklog(
					'Alex Thompson',
					'alex@example.com',
					'2025-10-15T09:00:00.000-0300',
					'1',
					'PROJ-100',
					'First issue',
				),
				createWorklog(
					'Alex Thompson',
					'alex@example.com',
					'2025-10-15T14:00:00.000-0300',
					'2',
					'PROJ-101',
					'Second issue',
				),
			],
			'',
			'',
		);

		expect(state.grouped['Alex Thompson']['2025-10-15']).toHaveLength(2);
		expect(state.visibleEntries).toHaveLength(1);
	});

	it('filters users by allowed email list and selected user', () => {
		const state = deriveMonthlyReportState(
			[
				createWorklog(
					'Alex Thompson',
					'alex@example.com',
					'2025-10-15T09:00:00.000-0300',
					'1',
					'PROJ-100',
					'First issue',
				),
				createWorklog(
					'Sarah Johnson',
					'sarah@example.com',
					'2025-10-15T09:00:00.000-0300',
					'2',
					'PROJ-101',
					'Second issue',
				),
			],
			'Alex Thompson',
			'alex@example.com',
		);

		expect(state.users).toEqual(['Alex Thompson']);
		expect(state.visibleEntries).toHaveLength(1);
		expect(state.visibleEntries[0]?.[0]).toBe('Alex Thompson');
	});
});
