import { act } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import type { EnrichedJiraWorklog } from '../../../../types/jira';
import { useTimesheetStore } from '../useTimesheetStore';

const createMockWorklog = (
	displayName: string,
	started: string,
	id: string,
): EnrichedJiraWorklog => ({
	id,
	author: {
		accountId: displayName.toLowerCase().replace(' ', ''),
		displayName,
		emailAddress: `${displayName.toLowerCase().replace(' ', '.')}@example.com`,
		active: true,
	},
	comment: 'Test worklog',
	created: started,
	updated: started,
	started,
	timeSpent: '8h',
	timeSpentSeconds: 28800,
	issue: {
		id: 'PROJ-100',
		key: 'PROJ-100',
		fields: {
			summary: 'Test issue',
		},
	},
});

describe('useTimesheetStore', () => {
	beforeEach(() => {
		act(() => {
			useTimesheetStore.setState({
				currentYear: 2025,
				currentMonth: 9,
				selectedUser: '',
				data: null,
			});
		});
	});

	it('sets the current month', () => {
		act(() => {
			useTimesheetStore.getState().setCurrentMonth(2024, 5);
		});

		expect(useTimesheetStore.getState().currentYear).toBe(2024);
		expect(useTimesheetStore.getState().currentMonth).toBe(5);
	});

	it('wraps to the previous year when navigating back from January', () => {
		act(() => {
			useTimesheetStore.getState().setCurrentMonth(2025, 0);
			useTimesheetStore.getState().goPrevMonth();
		});

		expect(useTimesheetStore.getState().currentYear).toBe(2024);
		expect(useTimesheetStore.getState().currentMonth).toBe(11);
	});

	it('wraps to the next year when navigating forward from December', () => {
		act(() => {
			useTimesheetStore.getState().setCurrentMonth(2025, 11);
			useTimesheetStore.getState().goNextMonth();
		});

		expect(useTimesheetStore.getState().currentYear).toBe(2026);
		expect(useTimesheetStore.getState().currentMonth).toBe(0);
	});

	it('stores the selected user without recomputing derived data', () => {
		act(() => {
			useTimesheetStore.getState().setSelectedUser('Alex Thompson');
		});

		expect(useTimesheetStore.getState().selectedUser).toBe('Alex Thompson');
	});

	it('stores raw worklog data', () => {
		const worklogs = [
			createMockWorklog('Alex Thompson', '2025-10-15T09:00:00.000-0300', '1'),
			createMockWorklog('Sarah Johnson', '2025-10-15T09:00:00.000-0300', '2'),
		];

		act(() => {
			useTimesheetStore.getState().setData(worklogs);
		});

		expect(useTimesheetStore.getState().data).toEqual(worklogs);
	});
});
