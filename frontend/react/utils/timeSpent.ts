const TIME_SPENT_PATTERN = /^(\d+[wdhm]\s*)+$/i;

export function isValidTimeSpentFormat(value: string): boolean {
	return TIME_SPENT_PATTERN.test(value.trim());
}

export function parseTimeSpentToSeconds(value: string): number {
	let total = 0;
	const input = value.trim();
	const hours = input.match(/(\d+)\s*h/i);
	const minutes = input.match(/(\d+)\s*m/i);
	const days = input.match(/(\d+)\s*d/i);
	const weeks = input.match(/(\d+)\s*w/i);

	if (weeks) total += Number.parseInt(weeks[1], 10) * 5 * 8 * 3600;
	if (days) total += Number.parseInt(days[1], 10) * 8 * 3600;
	if (hours) total += Number.parseInt(hours[1], 10) * 3600;
	if (minutes) total += Number.parseInt(minutes[1], 10) * 60;

	return total;
}
