import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { JiraWorklog } from '../../../../types/JiraWorklog';
import { useDayCalculation } from '../useDayCalculation';

const createMockWorklog = (
	timeSpentSeconds: number,
	started: string,
): JiraWorklog => ({
	id: Math.random().toString(),
	self: 'http://jira.com/worklog/1',
	author: {
		self: 'http://jira.com/user/1',
		accountId: 'acc123',
		displayName: 'John Doe',
		active: true,
	},
	updateAuthor: {
		self: 'http://jira.com/user/1',
		accountId: 'acc123',
		displayName: 'John Doe',
		active: true,
	},
	comment: '',
	created: started,
	updated: started,
	started,
	timeSpent: `${timeSpentSeconds / 3600}h`,
	timeSpentSeconds,
	issueId: '12345',
	issueKey: 'PROJ-123',
});

describe('useDayCalculation', () => {
	describe('weekday calculations', () => {
		it('should calculate correct totals for a full 8h workday', () => {
			const worklogs = [createMockWorklog(28800, '2025-10-15T09:00:00.000Z')]; // 8h

			const { result } = renderHook(() =>
				useDayCalculation(worklogs, false, 0),
			);

			expect(result.current.dayTotalSeconds).toBe(28800);
			expect(result.current.baselineSeconds).toBe(28800); // 8h baseline
			expect(result.current.timeOffSeconds).toBe(0);
			expect(result.current.effectiveSeconds).toBe(28800);
			expect(result.current.missingSeconds).toBe(0);
		});

		it('should calculate missing hours for partial workday', () => {
			const worklogs = [createMockWorklog(14400, '2025-10-15T09:00:00.000Z')]; // 4h

			const { result } = renderHook(() =>
				useDayCalculation(worklogs, false, 0),
			);

			expect(result.current.dayTotalSeconds).toBe(14400);
			expect(result.current.baselineSeconds).toBe(28800);
			expect(result.current.effectiveSeconds).toBe(14400);
			expect(result.current.missingSeconds).toBe(14400); // Missing 4h
		});

		it('should not show missing for overtime', () => {
			const worklogs = [createMockWorklog(36000, '2025-10-15T09:00:00.000Z')]; // 10h

			const { result } = renderHook(() =>
				useDayCalculation(worklogs, false, 0),
			);

			expect(result.current.dayTotalSeconds).toBe(36000);
			expect(result.current.effectiveSeconds).toBe(36000);
			expect(result.current.missingSeconds).toBe(0); // No missing (overtime)
		});

		it('should handle multiple worklogs on same day', () => {
			const worklogs = [
				createMockWorklog(14400, '2025-10-15T09:00:00.000Z'), // 4h
				createMockWorklog(10800, '2025-10-15T14:00:00.000Z'), // 3h
			];

			const { result } = renderHook(() =>
				useDayCalculation(worklogs, false, 0),
			);

			expect(result.current.dayTotalSeconds).toBe(25200); // 7h
			expect(result.current.missingSeconds).toBe(3600); // Missing 1h
		});

		it('should handle empty worklogs', () => {
			const { result } = renderHook(() => useDayCalculation([], false, 0));

			expect(result.current.dayTotalSeconds).toBe(0);
			expect(result.current.effectiveSeconds).toBe(0);
			expect(result.current.missingSeconds).toBe(28800); // Missing full day
		});
	});

	describe('weekend calculations', () => {
		it('should have zero baseline for weekends', () => {
			const worklogs = [createMockWorklog(14400, '2025-10-18T09:00:00.000Z')]; // 4h on Saturday

			const { result } = renderHook(() => useDayCalculation(worklogs, true, 0));

			expect(result.current.dayTotalSeconds).toBe(14400);
			expect(result.current.baselineSeconds).toBe(0); // No baseline on weekend
			expect(result.current.missingSeconds).toBe(0); // No missing on weekend
		});

		it('should not apply time off on weekends', () => {
			const { result } = renderHook(() => useDayCalculation([], true, 4));

			expect(result.current.timeOffSeconds).toBe(0); // Time off ignored on weekend
		});
	});

	describe('time off calculations', () => {
		it('should include time off in effective seconds', () => {
			const worklogs = [createMockWorklog(14400, '2025-10-15T09:00:00.000Z')]; // 4h

			const { result } = renderHook(() =>
				useDayCalculation(worklogs, false, 4),
			); // 4h time off

			expect(result.current.dayTotalSeconds).toBe(14400);
			expect(result.current.timeOffSeconds).toBe(14400); // 4h time off
			expect(result.current.effectiveSeconds).toBe(28800); // 4h work + 4h time off
			expect(result.current.missingSeconds).toBe(0); // Complete day
		});

		it('should calculate missing with partial time off', () => {
			const worklogs = [createMockWorklog(10800, '2025-10-15T09:00:00.000Z')]; // 3h

			const { result } = renderHook(() =>
				useDayCalculation(worklogs, false, 2),
			); // 2h time off

			expect(result.current.dayTotalSeconds).toBe(10800);
			expect(result.current.timeOffSeconds).toBe(7200); // 2h
			expect(result.current.effectiveSeconds).toBe(18000); // 5h effective
			expect(result.current.missingSeconds).toBe(10800); // Missing 3h
		});

		it('should handle full day time off', () => {
			const { result } = renderHook(() => useDayCalculation([], false, 8)); // 8h time off

			expect(result.current.dayTotalSeconds).toBe(0);
			expect(result.current.timeOffSeconds).toBe(28800);
			expect(result.current.effectiveSeconds).toBe(28800);
			expect(result.current.missingSeconds).toBe(0);
		});
	});

	describe('reactivity', () => {
		it('should recalculate when worklogs change', () => {
			const initialWorklogs = [
				createMockWorklog(14400, '2025-10-15T09:00:00.000Z'),
			];

			const { result, rerender } = renderHook(
				({ worklogs, isWeekend, timeOff }) =>
					useDayCalculation(worklogs, isWeekend, timeOff),
				{
					initialProps: {
						worklogs: initialWorklogs,
						isWeekend: false,
						timeOff: 0,
					},
				},
			);

			expect(result.current.dayTotalSeconds).toBe(14400);

			const updatedWorklogs = [
				createMockWorklog(14400, '2025-10-15T09:00:00.000Z'),
				createMockWorklog(14400, '2025-10-15T14:00:00.000Z'),
			];

			rerender({
				worklogs: updatedWorklogs,
				isWeekend: false,
				timeOff: 0,
			});

			expect(result.current.dayTotalSeconds).toBe(28800);
		});

		it('should recalculate when time off changes', () => {
			const worklogs = [createMockWorklog(14400, '2025-10-15T09:00:00.000Z')];

			const { result, rerender } = renderHook(
				({ worklogs, isWeekend, timeOff }) =>
					useDayCalculation(worklogs, isWeekend, timeOff),
				{
					initialProps: { worklogs, isWeekend: false, timeOff: 0 },
				},
			);

			expect(result.current.missingSeconds).toBe(14400);

			rerender({ worklogs, isWeekend: false, timeOff: 4 });

			expect(result.current.missingSeconds).toBe(0);
		});
	});
});
