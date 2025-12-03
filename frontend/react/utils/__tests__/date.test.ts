import { describe, it, expect } from 'vitest';
import {
	getMonthStartWeekday,
	getDaysInMonth,
	isoDateFromYMD,
	monthLabel,
	isDateInMonth,
	toLocalDateString,
} from '../date';

describe('getMonthStartWeekday', () => {
	it('should return correct weekday for January 2025 (Wednesday = 3)', () => {
		// January 1, 2025 is a Wednesday
		expect(getMonthStartWeekday(2025, 0)).toBe(3);
	});

	it('should return correct weekday for October 2025 (Wednesday = 3)', () => {
		// October 1, 2025 is a Wednesday
		expect(getMonthStartWeekday(2025, 9)).toBe(3);
	});

	it('should return 0 for Sunday start', () => {
		// September 1, 2024 is a Sunday
		expect(getMonthStartWeekday(2024, 8)).toBe(0);
	});

	it('should return 6 for Saturday start', () => {
		// June 1, 2024 is a Saturday
		expect(getMonthStartWeekday(2024, 5)).toBe(6);
	});
});

describe('getDaysInMonth', () => {
	it('should return 31 for January', () => {
		expect(getDaysInMonth(2025, 0)).toBe(31);
	});

	it('should return 28 for February in non-leap year', () => {
		expect(getDaysInMonth(2025, 1)).toBe(28);
	});

	it('should return 29 for February in leap year', () => {
		expect(getDaysInMonth(2024, 1)).toBe(29);
	});

	it('should return 30 for April', () => {
		expect(getDaysInMonth(2025, 3)).toBe(30);
	});

	it('should return 31 for December', () => {
		expect(getDaysInMonth(2025, 11)).toBe(31);
	});
});

describe('isoDateFromYMD', () => {
	it('should format date correctly with single digit day', () => {
		expect(isoDateFromYMD(2025, 0, 5)).toBe('2025-01-05');
	});

	it('should format date correctly with double digit day', () => {
		expect(isoDateFromYMD(2025, 9, 15)).toBe('2025-10-15');
	});

	it('should handle December correctly', () => {
		expect(isoDateFromYMD(2025, 11, 25)).toBe('2025-12-25');
	});

	it('should handle first day of year', () => {
		expect(isoDateFromYMD(2025, 0, 1)).toBe('2025-01-01');
	});

	it('should handle last day of year', () => {
		expect(isoDateFromYMD(2025, 11, 31)).toBe('2025-12-31');
	});
});

describe('monthLabel', () => {
	it('should return formatted month and year', () => {
		const label = monthLabel(2025, 0);
		// Check that it contains the year and some representation of January
		expect(label).toContain('2025');
	});

	it('should handle different months', () => {
		const label = monthLabel(2025, 11);
		expect(label).toContain('2025');
	});
});

describe('isDateInMonth', () => {
	it('should return true for date in correct month', () => {
		expect(isDateInMonth('2025-10-15', 2025, 9)).toBe(true);
	});

	it('should return false for date in different month', () => {
		expect(isDateInMonth('2025-09-15', 2025, 9)).toBe(false);
	});

	it('should return false for date in different year', () => {
		expect(isDateInMonth('2024-10-15', 2025, 9)).toBe(false);
	});

	it('should handle January correctly (month 0)', () => {
		expect(isDateInMonth('2025-01-01', 2025, 0)).toBe(true);
	});

	it('should handle December correctly (month 11)', () => {
		expect(isDateInMonth('2025-12-31', 2025, 11)).toBe(true);
	});

	it('should return false for boundary dates', () => {
		// October 31 is in October (month 9), not November (month 10)
		expect(isDateInMonth('2025-10-31', 2025, 10)).toBe(false);
	});
});

describe('toLocalDateString', () => {
	it('should convert ISO string to local date string', () => {
		const result = toLocalDateString('2025-10-15T09:00:00.000-0300');
		expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
	});

	it('should convert Date object to local date string', () => {
		const date = new Date(2025, 9, 15); // October 15, 2025
		const result = toLocalDateString(date);
		expect(result).toBe('2025-10-15');
	});

	it('should handle single digit months', () => {
		const date = new Date(2025, 0, 5); // January 5, 2025
		const result = toLocalDateString(date);
		expect(result).toBe('2025-01-05');
	});

	it('should handle single digit days', () => {
		const date = new Date(2025, 9, 1); // October 1, 2025
		const result = toLocalDateString(date);
		expect(result).toBe('2025-10-01');
	});
});
