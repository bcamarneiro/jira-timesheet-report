export function getMonthStartWeekday(
	year: number,
	monthZeroIndexed: number,
): number {
	return new Date(Date.UTC(year, monthZeroIndexed, 1)).getUTCDay();
}

export function getDaysInMonth(year: number, monthZeroIndexed: number): number {
	return new Date(Date.UTC(year, monthZeroIndexed + 1, 0)).getUTCDate();
}

export function isoDateFromYMD(
	year: number,
	monthZeroIndexed: number,
	day: number,
): string {
	const d = new Date(Date.UTC(year, monthZeroIndexed, day));
	return d.toISOString().substring(0, 10);
}

export function monthLabel(year: number, monthZeroIndexed: number): string {
	return new Date(Date.UTC(year, monthZeroIndexed, 1)).toLocaleString(
		undefined,
		{ month: 'long', year: 'numeric', timeZone: 'UTC' },
	);
}

/**
 * Check if a date string (YYYY-MM-DD) falls within the specified month.
 */
export function isDateInMonth(
	dateStr: string,
	year: number,
	monthZeroIndexed: number,
): boolean {
	const [dateYear, dateMonth] = dateStr.split('-').map(Number);
	return dateYear === year && dateMonth === monthZeroIndexed + 1;
}

/**
 * Count the number of weekdays (Mon-Fri) in a given month.
 */
export function getWorkingDaysInMonth(
	year: number,
	monthZeroIndexed: number,
): number {
	const numDays = getDaysInMonth(year, monthZeroIndexed);
	let count = 0;
	for (let d = 1; d <= numDays; d++) {
		const day = new Date(Date.UTC(year, monthZeroIndexed, d)).getUTCDay();
		if (day !== 0 && day !== 6) count++;
	}
	return count;
}

/**
 * Extract local date string (YYYY-MM-DD) from an ISO date string or Date object.
 * This avoids timezone conversion issues that occur with toISOString().
 */
export function toLocalDateString(dateInput: string | Date): string {
	const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

/**
 * Canonical "what day did this happen for the author?" extractor.
 *
 * For ISO strings with explicit TZ offset (e.g. "2025-10-05T23:30:00.000-0300"),
 * we slice the wall-clock prefix so the day matches what the author saw at
 * their desk — independent of viewer TZ. For inputs without TZ info we
 * fall back to local-TZ conversion via {@link toLocalDateString}.
 *
 * Returns an empty string for `undefined` or unparseable input.
 */
export function wallClockDay(input: string | Date | undefined): string {
	if (input === undefined || input === null) return '';
	if (typeof input === 'string') {
		if (input.length === 0) return '';
		const slice = input.slice(0, 10);
		if (/^\d{4}-\d{2}-\d{2}$/.test(slice)) return slice;
		const parsed = new Date(input);
		if (Number.isNaN(parsed.getTime())) return '';
		return toLocalDateString(parsed);
	}
	if (Number.isNaN(input.getTime())) return '';
	return toLocalDateString(input);
}

export function parseIsoDateLocal(dateStr: string): Date {
	const [year, month, day] = dateStr.split('-').map(Number);
	return new Date(year, month - 1, day);
}

export function addDaysToIsoDate(dateStr: string, days: number): string {
	const date = parseIsoDateLocal(dateStr);
	date.setDate(date.getDate() + days);
	return toLocalDateString(date);
}

/**
 * Append the local TZ offset to a `YYYY-MM-DDTHH:MM` string so Jira can
 * interpret it unambiguously. Output: `YYYY-MM-DDTHH:MM:00.000±HHMM`.
 *
 * Used at every site that POSTs/PUTs a worklog `started` field.
 *
 * Idempotent: if the input already ends with a `±HHMM` offset, returns it
 * unchanged.
 */
export function withLocalOffset(localDateTime: string): string {
	// If the input already carries a `±HHMM` offset, leave it alone.
	if (/[+-]\d{4}$/.test(localDateTime)) return localDateTime;

	const date = new Date(localDateTime);
	const offsetMinutes = -date.getTimezoneOffset();
	const sign = offsetMinutes >= 0 ? '+' : '-';
	const abs = Math.abs(offsetMinutes);
	const hh = String(Math.floor(abs / 60)).padStart(2, '0');
	const mm = String(abs % 60).padStart(2, '0');
	// Normalise to `YYYY-MM-DDTHH:MM:00.000` then append offset.
	const base =
		localDateTime.length === 16 ? `${localDateTime}:00.000` : localDateTime;
	return `${base}${sign}${hh}${mm}`;
}

/**
 * Compute the Monday of the week that contains `date`, in local TZ.
 * Single source of truth shared by useDashboardStore and useTeamStore so
 * any future change (e.g. Sunday-first week) only needs one edit.
 */
export function getMondayOfWeek(date: Date): string {
	const d = new Date(date);
	const day = d.getDay();
	const diff = d.getDate() - day + (day === 0 ? -6 : 1);
	d.setDate(diff);
	return toLocalDateString(d);
}

export function formatDateTimeLocalValue(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	return `${year}-${month}-${day}T${hours}:${minutes}`;
}
