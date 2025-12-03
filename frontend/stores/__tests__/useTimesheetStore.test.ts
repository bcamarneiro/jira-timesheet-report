import { act } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import {
	useTimesheetStore,
	type EnrichedJiraWorklog,
} from '../useTimesheetStore';
import { useConfigStore } from '../useConfigStore';

const createMockWorklog = (
	displayName: string,
	started: string,
	id: string,
	issueId: string = 'PROJ-100',
	issueSummary: string = 'Test issue',
	email: string = `${displayName.toLowerCase().replace(' ', '.')}@example.com`,
): EnrichedJiraWorklog =>
	({
		self: `https://mock.atlassian.net/rest/api/2/issue/${issueId}/worklog/${id}`,
		id,
		author: {
			self: `https://mock.atlassian.net/rest/api/2/user`,
			accountId: displayName.toLowerCase().replace(' ', ''),
			emailAddress: email,
			displayName,
			active: true,
			timeZone: 'America/Sao_Paulo',
		},
		updateAuthor: {
			self: `https://mock.atlassian.net/rest/api/2/user`,
			accountId: displayName.toLowerCase().replace(' ', ''),
			emailAddress: email,
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
		issue: {
			id: issueId,
			key: issueId,
			fields: {
				summary: issueSummary,
			},
		},
	}) as EnrichedJiraWorklog;

describe('useTimesheetStore', () => {
	beforeEach(() => {
		// Reset stores
		act(() => {
			useTimesheetStore.setState({
				currentYear: 2025,
				currentMonth: 9, // October
				selectedUser: '',
				data: null,
				isLoading: false,
				error: null,
				issueSummaries: {},
				users: [],
				grouped: {},
				visibleEntries: [],
			});
			useConfigStore.setState({
				config: {
					jiraHost: '',
					email: '',
					apiToken: '',
					corsProxy: '',
					jqlFilter: '',
					allowedUsers: '',
				},
			});
		});
	});

	describe('navigation actions', () => {
		it('should set current month', () => {
			act(() => {
				useTimesheetStore.getState().setCurrentMonth(2024, 5);
			});

			expect(useTimesheetStore.getState().currentYear).toBe(2024);
			expect(useTimesheetStore.getState().currentMonth).toBe(5);
		});

		it('should go to previous month', () => {
			act(() => {
				useTimesheetStore.getState().setCurrentMonth(2025, 5);
			});

			act(() => {
				useTimesheetStore.getState().goPrevMonth();
			});

			expect(useTimesheetStore.getState().currentMonth).toBe(4);
			expect(useTimesheetStore.getState().currentYear).toBe(2025);
		});

		it('should wrap to previous year when going back from January', () => {
			act(() => {
				useTimesheetStore.getState().setCurrentMonth(2025, 0);
			});

			act(() => {
				useTimesheetStore.getState().goPrevMonth();
			});

			expect(useTimesheetStore.getState().currentMonth).toBe(11);
			expect(useTimesheetStore.getState().currentYear).toBe(2024);
		});

		it('should go to next month', () => {
			act(() => {
				useTimesheetStore.getState().setCurrentMonth(2025, 5);
			});

			act(() => {
				useTimesheetStore.getState().goNextMonth();
			});

			expect(useTimesheetStore.getState().currentMonth).toBe(6);
			expect(useTimesheetStore.getState().currentYear).toBe(2025);
		});

		it('should wrap to next year when going forward from December', () => {
			act(() => {
				useTimesheetStore.getState().setCurrentMonth(2025, 11);
			});

			act(() => {
				useTimesheetStore.getState().goNextMonth();
			});

			expect(useTimesheetStore.getState().currentMonth).toBe(0);
			expect(useTimesheetStore.getState().currentYear).toBe(2026);
		});
	});

	describe('data actions', () => {
		it('should set loading state', () => {
			act(() => {
				useTimesheetStore.getState().setLoading(true);
			});

			expect(useTimesheetStore.getState().isLoading).toBe(true);

			act(() => {
				useTimesheetStore.getState().setLoading(false);
			});

			expect(useTimesheetStore.getState().isLoading).toBe(false);
		});

		it('should set error state', () => {
			act(() => {
				useTimesheetStore.getState().setError('Something went wrong');
			});

			expect(useTimesheetStore.getState().error).toBe('Something went wrong');

			act(() => {
				useTimesheetStore.getState().setError(null);
			});

			expect(useTimesheetStore.getState().error).toBeNull();
		});

		it('should set data and compute derived state', () => {
			const worklogs = [
				createMockWorklog('Alex Thompson', '2025-10-15T09:00:00.000-0300', '1'),
				createMockWorklog('Sarah Johnson', '2025-10-15T09:00:00.000-0300', '2'),
			];

			act(() => {
				useTimesheetStore.getState().setData(worklogs);
			});

			const state = useTimesheetStore.getState();
			expect(state.data).toHaveLength(2);
			expect(state.users).toContain('Alex Thompson');
			expect(state.users).toContain('Sarah Johnson');
			expect(Object.keys(state.grouped)).toHaveLength(2);
		});

		it('should compute issue summaries from data', () => {
			const worklogs = [
				createMockWorklog(
					'Alex Thompson',
					'2025-10-15T09:00:00.000-0300',
					'1',
					'PROJ-100',
					'First issue',
				),
				createMockWorklog(
					'Sarah Johnson',
					'2025-10-15T09:00:00.000-0300',
					'2',
					'PROJ-101',
					'Second issue',
				),
			];

			act(() => {
				useTimesheetStore.getState().setData(worklogs);
			});

			const { issueSummaries } = useTimesheetStore.getState();
			expect(issueSummaries['PROJ-100']).toBe('First issue');
			expect(issueSummaries['PROJ-101']).toBe('Second issue');
		});

		it('should group worklogs by user and date', () => {
			const worklogs = [
				createMockWorklog('Alex Thompson', '2025-10-15T09:00:00.000-0300', '1'),
				createMockWorklog('Alex Thompson', '2025-10-15T14:00:00.000-0300', '2'),
				createMockWorklog('Alex Thompson', '2025-10-16T09:00:00.000-0300', '3'),
				createMockWorklog('Sarah Johnson', '2025-10-15T09:00:00.000-0300', '4'),
			];

			act(() => {
				useTimesheetStore.getState().setData(worklogs);
			});

			const { grouped } = useTimesheetStore.getState();
			expect(grouped['Alex Thompson']['2025-10-15']).toHaveLength(2);
			expect(grouped['Alex Thompson']['2025-10-16']).toHaveLength(1);
			expect(grouped['Sarah Johnson']['2025-10-15']).toHaveLength(1);
		});
	});

	describe('user selection', () => {
		it('should set selected user and filter visible entries', () => {
			const worklogs = [
				createMockWorklog('Alex Thompson', '2025-10-15T09:00:00.000-0300', '1'),
				createMockWorklog('Sarah Johnson', '2025-10-15T09:00:00.000-0300', '2'),
			];

			act(() => {
				useTimesheetStore.getState().setData(worklogs);
			});

			expect(useTimesheetStore.getState().visibleEntries).toHaveLength(2);

			act(() => {
				useTimesheetStore.getState().setSelectedUser('Alex Thompson');
			});

			const { visibleEntries } = useTimesheetStore.getState();
			expect(visibleEntries).toHaveLength(1);
			expect(visibleEntries[0][0]).toBe('Alex Thompson');
		});

		it('should show all users when selected user is empty', () => {
			const worklogs = [
				createMockWorklog('Alex Thompson', '2025-10-15T09:00:00.000-0300', '1'),
				createMockWorklog('Sarah Johnson', '2025-10-15T09:00:00.000-0300', '2'),
			];

			act(() => {
				useTimesheetStore.getState().setData(worklogs);
				useTimesheetStore.getState().setSelectedUser('Alex Thompson');
			});

			expect(useTimesheetStore.getState().visibleEntries).toHaveLength(1);

			act(() => {
				useTimesheetStore.getState().setSelectedUser('');
			});

			expect(useTimesheetStore.getState().visibleEntries).toHaveLength(2);
		});
	});

	describe('allowed users filtering', () => {
		it('should filter users by allowed emails', () => {
			act(() => {
				useConfigStore.getState().setConfig({
					jiraHost: '',
					email: '',
					apiToken: '',
					corsProxy: '',
					jqlFilter: '',
					allowedUsers: 'alex.thompson@example.com',
				});
			});

			const worklogs = [
				createMockWorklog('Alex Thompson', '2025-10-15T09:00:00.000-0300', '1'),
				createMockWorklog('Sarah Johnson', '2025-10-15T09:00:00.000-0300', '2'),
			];

			act(() => {
				useTimesheetStore.getState().setData(worklogs);
			});

			const { users, grouped } = useTimesheetStore.getState();
			expect(users).toContain('Alex Thompson');
			expect(users).not.toContain('Sarah Johnson');
			expect(grouped['Alex Thompson']).toBeDefined();
			expect(grouped['Sarah Johnson']).toBeUndefined();
		});

		it('should show all users when no allowed users configured', () => {
			const worklogs = [
				createMockWorklog('Alex Thompson', '2025-10-15T09:00:00.000-0300', '1'),
				createMockWorklog('Sarah Johnson', '2025-10-15T09:00:00.000-0300', '2'),
			];

			act(() => {
				useTimesheetStore.getState().setData(worklogs);
			});

			const { users } = useTimesheetStore.getState();
			expect(users).toContain('Alex Thompson');
			expect(users).toContain('Sarah Johnson');
		});
	});

	describe('recomputeDerived', () => {
		it('should recompute derived state from current data', () => {
			const worklogs = [
				createMockWorklog('Alex Thompson', '2025-10-15T09:00:00.000-0300', '1'),
			];

			act(() => {
				useTimesheetStore.getState().setData(worklogs);
			});

			// Manually clear derived state
			act(() => {
				useTimesheetStore.setState({
					users: [],
					grouped: {},
					visibleEntries: [],
				});
			});

			expect(useTimesheetStore.getState().users).toHaveLength(0);

			act(() => {
				useTimesheetStore.getState().recomputeDerived();
			});

			expect(useTimesheetStore.getState().users).toContain('Alex Thompson');
		});
	});
});
