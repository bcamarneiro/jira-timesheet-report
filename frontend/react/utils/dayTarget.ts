import { BASELINE_HOURS } from '../constants/timesheet';

export const BASELINE_DAY_SECONDS = BASELINE_HOURS * 3600;

/**
 * Single source of truth for "what is this day's target?".
 *
 * Rules:
 * - Weekend → 0 (no expectation regardless of absence/work).
 * - Weekday, not absent → BASELINE_DAY_SECONDS (full 8h target).
 * - Weekday, absent, 0h logged → 0 (full day off; 100% compliant).
 * - Weekday, absent, 0 < X ≤ 8h logged → X (partial day; still 100% compliant).
 * - Weekday, absent, > 8h logged → BASELINE_DAY_SECONDS (overtime past PTO).
 *
 * Holidays use the same `isAbsent` channel, so a worked-on-holiday is treated
 * the same as a worked-on-vacation.
 */
export function computeDayTargetSeconds(
	isWeekend: boolean,
	isAbsent: boolean,
	loggedSeconds: number,
): number {
	if (isWeekend) return 0;
	if (!isAbsent) return BASELINE_DAY_SECONDS;
	const clamped = Math.max(0, loggedSeconds);
	return Math.min(clamped, BASELINE_DAY_SECONDS);
}

/**
 * Sum per-day targets across a list of weekdays. Callers pass lookup
 * functions for absence and logged-seconds so this helper stays agnostic of
 * the data shape (Map, Set, AbsenceDay record, …).
 */
export function sumWeekdayTargetSeconds(
	weekdays: Iterable<string>,
	isAbsent: (day: string) => boolean,
	loggedSeconds: (day: string) => number,
): number {
	let total = 0;
	for (const day of weekdays) {
		total += computeDayTargetSeconds(false, isAbsent(day), loggedSeconds(day));
	}
	return total;
}
