import { describe, it, expect } from 'vitest';
import { formatHours } from '../format';

describe('formatHours', () => {
	it('should format whole hours without decimal', () => {
		expect(formatHours(3600)).toBe('1h');
		expect(formatHours(7200)).toBe('2h');
		expect(formatHours(28800)).toBe('8h');
	});

	it('should format fractional hours with one decimal place', () => {
		expect(formatHours(5400)).toBe('1.5h');
		expect(formatHours(9000)).toBe('2.5h');
	});

	it('should handle zero seconds', () => {
		expect(formatHours(0)).toBe('0h');
	});

	it('should handle large values', () => {
		expect(formatHours(360000)).toBe('100h');
	});

	it('should round to one decimal place', () => {
		// 1h 20m = 4800s = 1.333...h -> 1.3h
		expect(formatHours(4800)).toBe('1.3h');
	});

	it('should handle common worklog durations', () => {
		// 30 minutes
		expect(formatHours(1800)).toBe('0.5h');
		// 15 minutes
		expect(formatHours(900)).toBe('0.3h');
		// 45 minutes
		expect(formatHours(2700)).toBe('0.8h');
	});
});
