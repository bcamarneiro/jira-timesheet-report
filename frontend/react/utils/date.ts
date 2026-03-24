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

export function parseIsoDateLocal(dateStr: string): Date {
	const [year, month, day] = dateStr.split('-').map(Number);
	return new Date(year, month - 1, day);
}

export function addDaysToIsoDate(dateStr: string, days: number): string {
	const date = parseIsoDateLocal(dateStr);
	date.setDate(date.getDate() + days);
	return toLocalDateString(date);
}

export function formatDateTimeLocalValue(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	return `${year}-${month}-${day}T${hours}:${minutes}`;
}
