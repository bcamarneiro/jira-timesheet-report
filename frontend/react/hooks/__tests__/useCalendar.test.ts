import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useCalendar } from '../useCalendar';

describe('useCalendar', () => {
	it('should return correct values for January 2025', () => {
		// January 2025: 31 days, starts on Wednesday (3)
		const { result } = renderHook(() => useCalendar(2025, 0));

		expect(result.current.firstWeekday).toBe(3);
		expect(result.current.numDays).toBe(31);
		expect(result.current.weekdayLabels).toEqual([
			'Sun',
			'Mon',
			'Tue',
			'Wed',
			'Thu',
			'Fri',
			'Sat',
		]);
	});

	it('should return correct values for February 2024 (leap year)', () => {
		// February 2024: 29 days, starts on Thursday (4)
		const { result } = renderHook(() => useCalendar(2024, 1));

		expect(result.current.firstWeekday).toBe(4);
		expect(result.current.numDays).toBe(29);
	});

	it('should return correct values for February 2025 (non-leap year)', () => {
		// February 2025: 28 days, starts on Saturday (6)
		const { result } = renderHook(() => useCalendar(2025, 1));

		expect(result.current.firstWeekday).toBe(6);
		expect(result.current.numDays).toBe(28);
	});

	it('should return correct values for October 2025', () => {
		// October 2025: 31 days, starts on Wednesday (3)
		const { result } = renderHook(() => useCalendar(2025, 9));

		expect(result.current.firstWeekday).toBe(3);
		expect(result.current.numDays).toBe(31);
	});

	it('should update when year changes', () => {
		const { result, rerender } = renderHook(
			({ year, month }) => useCalendar(year, month),
			{
				initialProps: { year: 2025, month: 1 }, // February 2025 (non-leap)
			},
		);

		expect(result.current.numDays).toBe(28);

		rerender({ year: 2024, month: 1 }); // February 2024 (leap)

		expect(result.current.numDays).toBe(29);
	});

	it('should update when month changes', () => {
		const { result, rerender } = renderHook(
			({ year, month }) => useCalendar(year, month),
			{
				initialProps: { year: 2025, month: 0 }, // January
			},
		);

		expect(result.current.numDays).toBe(31);
		expect(result.current.firstWeekday).toBe(3);

		rerender({ year: 2025, month: 1 }); // February

		expect(result.current.numDays).toBe(28);
		expect(result.current.firstWeekday).toBe(6);
	});

	it('should always return the same weekdayLabels reference', () => {
		const { result } = renderHook(() => useCalendar(2025, 0));
		const labels = result.current.weekdayLabels;

		expect(labels).toBe(result.current.weekdayLabels); // Same reference
	});
});
