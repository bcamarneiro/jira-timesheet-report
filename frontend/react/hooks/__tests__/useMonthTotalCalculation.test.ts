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

		const { result } = renderHook(() =>
			useMonthTotalCalculation(days, 2025, 0),
		); // January 2025

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

		const { result } = renderHook(() =>
			useMonthTotalCalculation(days, 2025, 0),
		); // January 2025

		expect(result.current.totalSeconds).toBe(36000); // 10 hours total
	});

	it('should return 0 for empty days', () => {
		const days: Record<string, JiraWorklog[]> = {};

		const { result } = renderHook(() =>
			useMonthTotalCalculation(days, 2025, 0),
		);

		expect(result.current.totalSeconds).toBe(0);
	});

	it('should return 0 for days with empty worklog arrays', () => {
		const days: Record<string, JiraWorklog[]> = {
			'2025-01-15': [],
			'2025-01-16': [],
		};

		const { result } = renderHook(() =>
			useMonthTotalCalculation(days, 2025, 0),
		);

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

		const { result } = renderHook(() =>
			useMonthTotalCalculation(days, 2025, 0),
		);

		expect(result.current.totalSeconds).toBe(10800); // 3 hours total
	});

	it('should recalculate when days data changes', () => {
		const initialDays: Record<string, JiraWorklog[]> = {
			'2025-01-15': [
				createMockWorklog(3600, '2025-01-15T10:00:00.000Z'), // 1 hour
			],
		};

		const { result, rerender } = renderHook(
			({ days, year, month }) => useMonthTotalCalculation(days, year, month),
			{
				initialProps: { days: initialDays, year: 2025, month: 0 },
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

		rerender({ days: updatedDays, year: 2025, month: 0 });

		expect(result.current.totalSeconds).toBe(10800); // 3 hours total
	});

	it('should count all worklogs in the days object regardless of comments', () => {
		// Viewing February 2025
		// Some worklogs have retroactive comments but we count ALL worklogs in the days object
		const days: Record<string, JiraWorklog[]> = {
			'2025-02-05': [
				createMockWorklog(3600, '2025-02-05T10:00:00.000Z'), // 1 hour
				{
					...createMockWorklog(7200, '2025-02-05T14:00:00.000Z'), // 2 hours
					comment: 'Original Worklog Date was: 2025/01/20',
				},
			],
			'2025-02-06': [
				createMockWorklog(5400, '2025-02-06T10:00:00.000Z'), // 1.5 hours
				{
					...createMockWorklog(3600, '2025-02-06T14:00:00.000Z'), // 1 hour
					comment: 'Work done earlier. Original Worklog Date was: 2025/01/15',
				},
			],
		};

		const { result } = renderHook(() =>
			useMonthTotalCalculation(days, 2025, 1),
		); // Viewing February 2025

		// Should count ALL worklogs: 3600 + 7200 + 5400 + 3600 = 19800 seconds
		expect(result.current.totalSeconds).toBe(19800); // 5.5 hours total
	});

	it('should handle large numbers of worklogs', () => {
		const days: Record<string, JiraWorklog[]> = {};

		// Create 31 days (full January) with 10 worklogs each (30 minutes each)
		for (let day = 1; day <= 31; day++) {
			const dateStr = `2025-01-${day.toString().padStart(2, '0')}`;
			days[dateStr] = [];
			for (let i = 0; i < 10; i++) {
				const hour = (9 + i).toString().padStart(2, '0');
				days[dateStr].push(
					createMockWorklog(1800, `${dateStr}T${hour}:00:00.000Z`),
				); // 0.5 hours each
			}
		}

		const { result } = renderHook(() =>
			useMonthTotalCalculation(days, 2025, 0),
		);

		// 31 days * 10 worklogs * 1800 seconds = 558000 seconds = 155 hours
		expect(result.current.totalSeconds).toBe(558000);
	});
});
