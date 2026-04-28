import type {
	AbsenceDay,
	UserAbsenceDays,
} from '../../services/absenceService';
import type { AbsenceKind } from '../../../types/absence';
import { isDateInMonth, parseIsoDateLocal } from './date';

function isWeekday(dateStr: string): boolean {
	const day = parseIsoDateLocal(dateStr).getDay();
	return day !== 0 && day !== 6;
}

export function getUserAbsenceDates(
	absenceDaysByUser: UserAbsenceDays | undefined,
	userEmail: string | undefined,
): Set<string> | undefined {
	if (!absenceDaysByUser || !userEmail) return undefined;

	const dates = absenceDaysByUser.get(userEmail.trim().toLowerCase());
	if (!dates || dates.size === 0) return undefined;

	return new Set(dates.keys());
}

export function getUserAbsenceDayMap(
	absenceDaysByUser: UserAbsenceDays | undefined,
	userEmail: string | undefined,
): Map<string, AbsenceDay> | undefined {
	if (!absenceDaysByUser || !userEmail) return undefined;

	return absenceDaysByUser.get(userEmail.trim().toLowerCase());
}

export function getAbsenceDateSet(
	absenceDays: Map<string, AbsenceDay> | undefined,
): Set<string> | undefined {
	if (!absenceDays || absenceDays.size === 0) return undefined;
	return new Set(absenceDays.keys());
}

export function getAbsenceKindLabel(kind: AbsenceKind | undefined): string {
	switch (kind) {
		case 'vacation':
			return 'Vacation';
		case 'sick':
			return 'Sick';
		case 'off':
			return 'Off';
		default:
			return 'Time off';
	}
}

export function getAbsenceKindShortLabel(
	kind: AbsenceKind | undefined,
): string {
	switch (kind) {
		case 'vacation':
			return 'vac';
		case 'sick':
			return 'sick';
		case 'off':
			return 'off';
		default:
			return 'off';
	}
}

export function countAbsenceWorkdaysInRange(
	absenceDates: Iterable<string> | undefined,
	rangeStart: string,
	rangeEnd: string,
): number {
	if (!absenceDates) return 0;

	let count = 0;
	for (const date of absenceDates) {
		if (date >= rangeStart && date <= rangeEnd && isWeekday(date)) {
			count += 1;
		}
	}
	return count;
}

export function countAbsenceWorkdaysInMonth(
	absenceDates: Iterable<string> | undefined,
	year: number,
	monthZeroIndexed: number,
): number {
	if (!absenceDates) return 0;

	let count = 0;
	for (const date of absenceDates) {
		if (isDateInMonth(date, year, monthZeroIndexed) && isWeekday(date)) {
			count += 1;
		}
	}
	return count;
}
