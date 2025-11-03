import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { JiraWorklog } from '../../../../types/JiraWorklog';
import { useMonthTotalCalculation } from '../useMonthTotalCalculation';

describe('useMonthTotalCalculation', () => {
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

	it('should calculate total seconds for a single day', () => {
		const days: Record<string, JiraWorklog[]> = {
			'2025-01-15': [
				createMockWorklog(3600, '2025-01-15T10:00:00.000Z'), // 1 hour
				createMockWorklog(7200, '2025-01-15T14:00:00.000Z'), // 2 hours
			],
		};

		const { result } = renderHook(() => useMonthTotalCalculation(days));

		expect(result.current.totalSeconds).toBe(10800); // 3 hours total
	});

	it('should calculate total seconds across multiple days', () => {
		const days: Record<string, JiraWorklog[]> = {
			'2025-01-15': [
				createMockWorklog(3600, '2025-01-15T10:00:00.000Z'), // 1 hour
				createMockWorklog(7200, '2025-01-15T14:00:00.000Z'), // 2 hours
			],
			'2025-01-16': [
				createMockWorklog(14400, '2025-01-16T09:00:00.000Z'), // 4 hours
			],
			'2025-01-17': [
				createMockWorklog(3600, '2025-01-17T10:00:00.000Z'), // 1 hour
				createMockWorklog(3600, '2025-01-17T11:00:00.000Z'), // 1 hour
				createMockWorklog(3600, '2025-01-17T15:00:00.000Z'), // 1 hour
			],
		};

		const { result } = renderHook(() => useMonthTotalCalculation(days));

		expect(result.current.totalSeconds).toBe(36000); // 10 hours total
	});

	it('should return 0 for empty days', () => {
		const days: Record<string, JiraWorklog[]> = {};

		const { result } = renderHook(() => useMonthTotalCalculation(days));

		expect(result.current.totalSeconds).toBe(0);
	});

	it('should return 0 for days with empty worklog arrays', () => {
		const days: Record<string, JiraWorklog[]> = {
			'2025-01-15': [],
			'2025-01-16': [],
		};

		const { result } = renderHook(() => useMonthTotalCalculation(days));

		expect(result.current.totalSeconds).toBe(0);
	});

	it('should handle mixed empty and non-empty days', () => {
		const days: Record<string, JiraWorklog[]> = {
			'2025-01-15': [
				createMockWorklog(3600, '2025-01-15T10:00:00.000Z'), // 1 hour
			],
			'2025-01-16': [],
			'2025-01-17': [
				createMockWorklog(7200, '2025-01-17T10:00:00.000Z'), // 2 hours
			],
		};

		const { result } = renderHook(() => useMonthTotalCalculation(days));

		expect(result.current.totalSeconds).toBe(10800); // 3 hours total
	});

	it('should recalculate when days data changes', () => {
		const initialDays: Record<string, JiraWorklog[]> = {
			'2025-01-15': [
				createMockWorklog(3600, '2025-01-15T10:00:00.000Z'), // 1 hour
			],
		};

		const { result, rerender } = renderHook(
			({ days }) => useMonthTotalCalculation(days),
			{
				initialProps: { days: initialDays },
			},
		);

		expect(result.current.totalSeconds).toBe(3600);

		const updatedDays: Record<string, JiraWorklog[]> = {
			'2025-01-15': [
				createMockWorklog(3600, '2025-01-15T10:00:00.000Z'), // 1 hour
			],
			'2025-01-16': [
				createMockWorklog(7200, '2025-01-16T10:00:00.000Z'), // 2 hours
			],
		};

		rerender({ days: updatedDays });

		expect(result.current.totalSeconds).toBe(10800); // 3 hours total
	});

	it('should handle worklogs with retroactive comments correctly', () => {
		// Note: The current implementation counts all worklogs regardless of retroactive status
		// This test documents current behavior - if retroactive worklogs should be excluded,
		// the implementation would need to be updated
		const days: Record<string, JiraWorklog[]> = {
			'2025-02-05': [
				createMockWorklog(3600, '2025-02-05T10:00:00.000Z'), // 1 hour, normal
				{
					...createMockWorklog(7200, '2025-02-05T14:00:00.000Z'), // 2 hours, retroactive
					comment: 'Original Worklog Date was: 2025/01/20',
				},
			],
		};

		const { result } = renderHook(() => useMonthTotalCalculation(days));

		// Current behavior: counts all worklogs including retroactive ones
		expect(result.current.totalSeconds).toBe(10800); // 3 hours total
	});

	it('should handle large numbers of worklogs', () => {
		const days: Record<string, JiraWorklog[]> = {};

		// Create 30 days with 10 worklogs each (30 minutes each)
		for (let day = 1; day <= 30; day++) {
			const dateStr = `2025-01-${day.toString().padStart(2, '0')}`;
			days[dateStr] = [];
			for (let i = 0; i < 10; i++) {
				days[dateStr].push(
					createMockWorklog(1800, `${dateStr}T${9 + i}:00:00.000Z`),
				); // 0.5 hours each
			}
		}

		const { result } = renderHook(() => useMonthTotalCalculation(days));

		// 30 days * 10 worklogs * 1800 seconds = 540000 seconds = 150 hours
		expect(result.current.totalSeconds).toBe(540000);
	});
});
