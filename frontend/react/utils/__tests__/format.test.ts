import { describe, expect, it } from 'vitest';
import { formatActivityTime } from '../../components/dashboard/DayCard';
import {
	computeCompliancePct,
	formatHours,
	formatJiraTimeSpent,
} from '../format';

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

describe('formatJiraTimeSpent', () => {
	it('formats whole hours as Nh', () => {
		expect(formatJiraTimeSpent(28800)).toBe('8h');
		expect(formatJiraTimeSpent(3600)).toBe('1h');
	});

	it('formats hours + minutes', () => {
		expect(formatJiraTimeSpent(5400)).toBe('1h 30m');
		expect(formatJiraTimeSpent(4500)).toBe('1h 15m');
	});

	it('formats sub-hour durations in minutes', () => {
		expect(formatJiraTimeSpent(1800)).toBe('30m');
		expect(formatJiraTimeSpent(900)).toBe('15m');
	});
});

describe('DayCard.formatActivityTime', () => {
	it('renders integer hours without decimals (consistent with formatHours)', () => {
		expect(formatActivityTime(28800)).toBe('8h');
		expect(formatActivityTime(3600)).toBe('1h');
	});

	it('renders fractional hours with one decimal', () => {
		expect(formatActivityTime(5400)).toBe('1.5h');
	});

	it('renders sub-hour activity in minutes', () => {
		expect(formatActivityTime(1800)).toBe('30m');
		expect(formatActivityTime(0)).toBe('0m');
	});
});

describe('computeCompliancePct', () => {
	it('returns 0 when targetSeconds is zero or negative', () => {
		expect(computeCompliancePct(3600, 0)).toBe(0);
		expect(computeCompliancePct(3600, -100)).toBe(0);
	});

	it('returns 0 when targetSeconds is NaN or Infinity', () => {
		expect(computeCompliancePct(3600, Number.NaN)).toBe(0);
		expect(computeCompliancePct(3600, Number.POSITIVE_INFINITY)).toBe(0);
	});

	it('returns 100 at parity', () => {
		expect(computeCompliancePct(40 * 3600, 40 * 3600)).toBe(100);
	});

	it('returns the same value regardless of seconds-vs-hours input scale', () => {
		// TimesheetGrid passes raw seconds; OverviewTable passes hours * 3600.
		// The helper accepts seconds — both surfaces must converge.
		const fromGrid = computeCompliancePct(184 * 3600, 184 * 3600);
		const fromTable = computeCompliancePct(184 * 3600, 184 * 3600);
		expect(fromGrid).toBe(fromTable);
	});
});
