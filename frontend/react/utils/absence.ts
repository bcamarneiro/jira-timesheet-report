import type { AbsenceKind } from '../../../types/absence';
import type {
	AbsenceDay,
	UserAbsenceDays,
} from '../../services/absenceService';

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
		case 'holiday':
			return 'Holiday';
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
		case 'holiday':
			return 'hol';
		default:
			return 'off';
	}
}
