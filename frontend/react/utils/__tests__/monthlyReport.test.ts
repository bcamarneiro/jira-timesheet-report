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
		expect(state.userEmails['Alex Thompson']).toBe('alex@example.com');
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

	it('matches allowedUsers regardless of email casing on either side', () => {
		// Pin the contract: a worklog whose author.emailAddress is mixed-case
		// must still match an allowedUsers config in lowercase.
		const state = deriveMonthlyReportState(
			[
				createWorklog(
					'Bruno Camarneiro',
					'Bruno@Example.com',
					'2025-10-15T09:00:00.000-0300',
					'1',
					'PROJ-100',
					'First issue',
				),
			],
			'',
			'bruno@example.com',
		);

		expect(state.users).toEqual(['Bruno Camarneiro']);
		expect(state.grouped['Bruno Camarneiro']?.['2025-10-15']).toHaveLength(1);
	});

	it('disambiguates two authors with the same displayName by suffixing email (#47)', () => {
		const state = deriveMonthlyReportState(
			[
				createWorklog(
					'John Smith',
					'john.smith@first.com',
					'2025-10-15T09:00:00.000Z',
					'1',
					'PROJ-1',
					'A',
				),
				createWorklog(
					'John Smith',
					'john.smith@second.com',
					'2025-10-16T09:00:00.000Z',
					'2',
					'PROJ-2',
					'B',
				),
			],
			'',
			'',
		);

		// Two distinct users emerge instead of one silently overwriting the other.
		expect(state.users).toEqual([
			'John Smith (john.smith@first.com)',
			'John Smith (john.smith@second.com)',
		]);
		expect(state.userEmails['John Smith (john.smith@first.com)']).toBe(
			'john.smith@first.com',
		);
		expect(state.userEmails['John Smith (john.smith@second.com)']).toBe(
			'john.smith@second.com',
		);
		expect(
			state.grouped['John Smith (john.smith@first.com)']?.['2025-10-15'],
		).toHaveLength(1);
		expect(
			state.grouped['John Smith (john.smith@second.com)']?.['2025-10-16'],
		).toHaveLength(1);
	});

	it('does NOT add the email suffix when displayName is unique', () => {
		const state = deriveMonthlyReportState(
			[
				createWorklog(
					'Unique Person',
					'unique@example.com',
					'2025-10-15T09:00:00.000Z',
					'1',
					'PROJ-1',
					'A',
				),
			],
			'',
			'',
		);
		expect(state.users).toEqual(['Unique Person']);
		expect(state.userEmails['Unique Person']).toBe('unique@example.com');
	});
});
