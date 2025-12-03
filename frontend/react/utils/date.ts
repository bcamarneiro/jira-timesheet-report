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
