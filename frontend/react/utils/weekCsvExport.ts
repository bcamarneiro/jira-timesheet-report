import type { WeekWorklogEntry } from '../../stores/useDashboardStore';
import { buildProvenanceFooter, CSV_SEP as SEP, csvEscape } from './csvHelpers';
import { parseIsoDateLocal } from './date';
import { classifyWorklog } from './worklogClassifier';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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

function isEntryBackdated(entry: WeekWorklogEntry): boolean {
	// `entry.date` is already the classifier-bucketed `loggedOn` for the
	// dashboard. We synthesise a shape compatible with the classifier so the
	// returned isBackdated matches what the rest of the app reports.
	return classifyWorklog({
		started: `${entry.date}T00:00:00`,
		created: entry.created,
		comment: entry.comment,
	}).isBackdated;
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
	].join(SEP);
	const metadata = [`Week Range`, `${weekStart} to ${weekEnd}`].join(SEP);

	// Sort by date then issue key
	const sorted = [...worklogs].sort((a, b) => {
		const dateCompare = a.date.localeCompare(b.date);
		if (dateCompare !== 0) return dateCompare;
		return a.issueKey.localeCompare(b.issueKey);
	});

	const classified = sorted.map((entry) => ({
		entry,
		isBackdated: isEntryBackdated(entry),
	}));

	const rows = classified.map(({ entry, isBackdated }) => {
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
			isBackdated ? 'true' : 'false',
		].join(SEP);
	});

	const totalSeconds = sorted.reduce(
		(sum, entry) => sum + entry.timeSpentSeconds,
		0,
	);
	const backdatedSeconds = classified.reduce(
		(sum, c) => sum + (c.isBackdated ? c.entry.timeSpentSeconds : 0),
		0,
	);
	const nonBackdatedSeconds = totalSeconds - backdatedSeconds;
	const makeTotalRow = (label: string, seconds: number) =>
		[
			label,
			'',
			'',
			'',
			(seconds / 3600).toFixed(2),
			formatDuration(seconds),
			'',
		].join(SEP);
	const backdatedRow = makeTotalRow('Backdated', backdatedSeconds);
	const nonBackdatedRow = makeTotalRow('Non-backdated', nonBackdatedSeconds);
	const totalRow = makeTotalRow('Week Total', totalSeconds);

	const provenanceFooter = buildProvenanceFooter({
		policy: 'logged',
		period: `${weekStart}..${weekEnd}`,
		provenance,
		omitMissingVersion: true,
	});

	return [
		metadata,
		headers,
		...rows,
		backdatedRow,
		nonBackdatedRow,
		totalRow,
		provenanceFooter,
	].join('\n');
}
