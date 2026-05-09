import type { WeekWorklogEntry } from '../../stores/useDashboardStore';
import { parseIsoDateLocal } from './date';
import { classifyWorklog } from './worklogClassifier';

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

/**
 * Provenance metadata appended as a `# generated=…` footer line, mirroring
 * `buildCsvForUser`/`buildSummaryCsv` conventions for finance-grade exports.
 */
export interface WeeklyCsvProvenance {
	jiraHost?: string;
	sourceVersion?: string;
	generatedAt?: string;
}

function classifyEntry(entry: WeekWorklogEntry): {
	isBackdated: boolean;
	daysLate: number;
} {
	// `entry.date` is already the classifier-bucketed `loggedOn` for the
	// dashboard. We synthesise a shape compatible with the classifier so the
	// returned isBackdated/daysLate match what the rest of the app reports.
	const c = classifyWorklog({
		started: `${entry.date}T00:00:00`,
		created: entry.created,
		comment: entry.comment,
	});
	return { isBackdated: c.isBackdated, daysLate: c.daysLate };
}

export function generateWeeklyCsv(
	weekStart: string,
	weekEnd: string,
	worklogs: WeekWorklogEntry[],
	provenance?: WeeklyCsvProvenance,
): string {
	const headers = [
		'Date',
		'Day',
		'Issue Key',
		'Issue Summary',
		'Time Spent (hours)',
		'Time Spent (formatted)',
		'IsBackdated',
		'DaysLate',
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
		const { isBackdated, daysLate } = classifyEntry(entry);

		return [
			entry.date,
			dayLabel,
			entry.issueKey,
			csvEscape(entry.issueSummary ?? ''),
			hours.toFixed(2),
			formatted,
			isBackdated ? 'true' : 'false',
			String(daysLate),
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
		'',
		'',
	].join(SEP);

	const generatedAt = provenance?.generatedAt ?? new Date().toISOString();
	const jiraHost = provenance?.jiraHost ?? '';
	const version = provenance?.sourceVersion ?? '';
	const footerParts = [
		`# generated=${generatedAt}`,
		`jira=${jiraHost}`,
		`policy=logged`,
		`period=${weekStart}..${weekEnd}`,
	];
	if (version) footerParts.push(`version=${version}`);
	const provenanceFooter = footerParts.join(' ');

	return [metadata, headers, ...rows, totalRow, provenanceFooter].join('\n');
}
