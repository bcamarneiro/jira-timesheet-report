import type { WeekWorklogEntry } from '../../stores/useDashboardStore';
import { parseIsoDateLocal } from './date';

const SEP = ';';
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function csvEscape(value: string): string {
	const safe = (value ?? '')
		.replace(/\r?\n|\r/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
	if (safe.includes('"') || safe.includes(',') || safe.includes(';')) {
		return `"${safe.replace(/"/g, '""')}"`;
	}
	return safe;
}

function formatDuration(seconds: number): string {
	const totalMinutes = Math.round(seconds / 60);
	const h = Math.floor(totalMinutes / 60);
	const m = totalMinutes % 60;
	if (m === 0) return `${h}h`;
	if (h === 0) return `${m}m`;
	return `${h}h ${m}m`;
}

export function generateWeeklyCsv(
	weekStart: string,
	weekEnd: string,
	worklogs: WeekWorklogEntry[],
): string {
	const headers = [
		'Date',
		'Day',
		'Issue Key',
		'Issue Summary',
		'Time Spent (hours)',
		'Time Spent (formatted)',
	].join(SEP);
	const metadata = [`Week Range`, `${weekStart} to ${weekEnd}`].join(SEP);

	// Sort by date then issue key
	const sorted = [...worklogs].sort((a, b) => {
		const dateCompare = a.date.localeCompare(b.date);
		if (dateCompare !== 0) return dateCompare;
		return a.issueKey.localeCompare(b.issueKey);
	});

	const rows = sorted.map((entry) => {
		const d = parseIsoDateLocal(entry.date);
		const dayLabel = DAY_LABELS[d.getDay()];
		const hours = entry.timeSpentSeconds / 3600;
		const formatted = formatDuration(entry.timeSpentSeconds);

		return [
			entry.date,
			dayLabel,
			entry.issueKey,
			csvEscape(entry.issueSummary ?? ''),
			hours.toFixed(2),
			formatted,
		].join(SEP);
	});

	const totalSeconds = sorted.reduce(
		(sum, entry) => sum + entry.timeSpentSeconds,
		0,
	);
	const totalRow = [
		'Week Total',
		'',
		'',
		'',
		(totalSeconds / 3600).toFixed(2),
		formatDuration(totalSeconds),
	].join(SEP);

	return [metadata, headers, ...rows, totalRow].join('\n');
}
