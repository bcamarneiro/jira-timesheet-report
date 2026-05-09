import type { EnrichedJiraWorklog } from '../../../types/jira';
import { sanitizeFilename } from './downloadFile';
import {
	type ClassifiedWorklog,
	type ClassifierOptions,
	classifyWorklog,
} from './worklogClassifier';

const SEP = ';';

export type AggregationPolicy = 'logged' | 'intended';

export interface TimesheetCsvProvenance {
	jiraHost?: string;
	sourceVersion?: string;
	generatedAt?: string;
}

export interface BuildTimesheetCsvOptions {
	worklogs: EnrichedJiraWorklog[];
	issueSummaries: Record<string, string>;
	policy: AggregationPolicy;
	period?: { year: number; month: number };
	classifierOptions?: ClassifierOptions;
	provenance?: TimesheetCsvProvenance;
}

const TIMESHEET_HEADERS = [
	'Name',
	'TicketKey',
	'TicketName',
	'IntendedDate',
	'LoggedDate',
	'DaysLate',
	'IsBackdated',
	'BackdateSource',
	'BookedHours',
];

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

function isInPeriod(
	isoDay: string,
	period: { year: number; month: number },
): boolean {
	if (!isoDay) return false;
	const expected = `${period.year}-${String(period.month + 1).padStart(2, '0')}`;
	return isoDay.startsWith(expected);
}

function pickPeriodKey(
	c: ClassifiedWorklog,
	policy: AggregationPolicy,
): string {
	return policy === 'logged' ? c.loggedOn : c.intendedFor;
}

function sortRows(
	rows: Array<{ classified: ClassifiedWorklog; entry: EnrichedJiraWorklog }>,
	policy: AggregationPolicy,
): typeof rows {
	return [...rows].sort((a, b) => {
		const primaryA = pickPeriodKey(a.classified, policy);
		const primaryB = pickPeriodKey(b.classified, policy);
		if (primaryA !== primaryB) return primaryA.localeCompare(primaryB);

		const secondaryA =
			policy === 'logged' ? a.classified.intendedFor : a.classified.loggedOn;
		const secondaryB =
			policy === 'logged' ? b.classified.intendedFor : b.classified.loggedOn;
		if (secondaryA !== secondaryB) return secondaryA.localeCompare(secondaryB);

		const keyA = a.entry.issue?.key ?? '';
		const keyB = b.entry.issue?.key ?? '';
		if (keyA !== keyB) return keyA.localeCompare(keyB);

		return (a.entry.id ?? '').localeCompare(b.entry.id ?? '');
	});
}

export function buildTimesheetCsv(opts: BuildTimesheetCsvOptions): string {
	const {
		worklogs,
		issueSummaries,
		policy,
		period,
		classifierOptions,
		provenance,
	} = opts;

	const classified = worklogs.map((entry) => ({
		entry,
		classified: classifyWorklog(entry, classifierOptions),
	}));

	const filtered = period
		? classified.filter((row) =>
				isInPeriod(pickPeriodKey(row.classified, policy), period),
			)
		: classified;

	const sorted = sortRows(filtered, policy);

	const headerLine = TIMESHEET_HEADERS.join(SEP);

	const dataLines = sorted.map(({ entry, classified: c }) => {
		const name = entry.author?.displayName ?? '';
		const ticketKey = entry.issue?.key ?? '';
		const ticketName =
			issueSummaries[entry.issue?.id ?? ''] ??
			issueSummaries[entry.issue?.key ?? ''] ??
			entry.issue?.fields?.summary ??
			'';
		const hours = ((entry.timeSpentSeconds ?? 0) / 3600).toFixed(2);

		return [
			csvEscape(name),
			ticketKey,
			csvEscape(ticketName),
			c.intendedFor,
			c.loggedOn,
			c.daysLate.toString(),
			c.isBackdated ? 'true' : 'false',
			c.source,
			hours,
		].join(SEP);
	});

	const totalHours = sorted.reduce(
		(sum, r) => sum + (r.entry.timeSpentSeconds ?? 0) / 3600,
		0,
	);
	const backdatedHours = sorted.reduce(
		(sum, r) =>
			sum +
			(r.classified.isBackdated ? (r.entry.timeSpentSeconds ?? 0) / 3600 : 0),
		0,
	);
	const totalRow = [
		'',
		'',
		'',
		'',
		'',
		'',
		'',
		'Total',
		totalHours.toFixed(2),
	].join(SEP);
	const backdatedRow = [
		'',
		'',
		'',
		'',
		'',
		'',
		'',
		'Backdated',
		backdatedHours.toFixed(2),
	].join(SEP);

	const generatedAt = provenance?.generatedAt ?? new Date().toISOString();
	const periodLabel = period
		? `${period.year}-${String(period.month + 1).padStart(2, '0')}`
		: 'all';
	const provenanceLine = `# generated=${generatedAt} jira=${
		provenance?.jiraHost ?? 'unknown'
	} policy=${policy} period=${periodLabel} version=${
		provenance?.sourceVersion ?? 'dev'
	}`;

	return [
		headerLine,
		...dataLines,
		totalRow,
		backdatedRow,
		provenanceLine,
	].join('\n');
}

export function buildTimesheetFilename(
	user: string,
	policy: AggregationPolicy,
	period: { year: number; month: number },
): string {
	const segment = `${period.year}-${String(period.month + 1).padStart(2, '0')}`;
	return sanitizeFilename(`timesheet_${user}_${segment}_${policy}.csv`);
}

export type UserSummary = {
	user: string;
	totalHours: number;
	backdatedHours: number;
	worklogCount: number;
	backdatedCount: number;
	daysWorked: number;
};

export interface BuildSummaryCsvOptions {
	summaries: UserSummary[];
	policy: AggregationPolicy;
	period: { year: number; month: number };
	provenance?: TimesheetCsvProvenance;
}

export function buildSummaryCsv(opts: BuildSummaryCsvOptions): string {
	const { summaries, policy, period, provenance } = opts;

	const monthName = new Date(
		Date.UTC(period.year, period.month, 1),
	).toLocaleString(undefined, {
		month: 'long',
		year: 'numeric',
		timeZone: 'UTC',
	});

	const titleRow = csvEscape(
		`Timesheet Summary - ${monthName} (policy=${policy})`,
	);

	const headers = [
		'User',
		'DaysWorked',
		'Entries',
		'BackdatedEntries',
		'TotalHours',
		'BackdatedHours',
	].join(SEP);

	const rows = summaries.map((s) =>
		[
			csvEscape(s.user),
			s.daysWorked.toFixed(1),
			s.worklogCount.toString(),
			s.backdatedCount.toString(),
			s.totalHours.toFixed(2),
			s.backdatedHours.toFixed(2),
		].join(SEP),
	);

	const grandTotalHours = summaries.reduce((sum, s) => sum + s.totalHours, 0);
	const grandBackdatedHours = summaries.reduce(
		(sum, s) => sum + s.backdatedHours,
		0,
	);
	const grandEntries = summaries.reduce((sum, s) => sum + s.worklogCount, 0);
	const grandBackdatedEntries = summaries.reduce(
		(sum, s) => sum + s.backdatedCount,
		0,
	);
	const grandDays = grandTotalHours / 8;

	const totalRow = [
		csvEscape(`Total (${summaries.length} users)`),
		grandDays.toFixed(1),
		grandEntries.toString(),
		grandBackdatedEntries.toString(),
		grandTotalHours.toFixed(2),
		grandBackdatedHours.toFixed(2),
	].join(SEP);

	const generatedAt = provenance?.generatedAt ?? new Date().toISOString();
	const periodLabel = `${period.year}-${String(period.month + 1).padStart(2, '0')}`;
	const provenanceLine = `# generated=${generatedAt} jira=${
		provenance?.jiraHost ?? 'unknown'
	} policy=${policy} period=${periodLabel} version=${
		provenance?.sourceVersion ?? 'dev'
	}`;

	return [titleRow, '', headers, ...rows, totalRow, provenanceLine].join('\n');
}

export function download(filename: string, content: string) {
	const element = document.createElement('a');
	element.setAttribute(
		'href',
		`data:text/csv;charset=utf-8,${encodeURIComponent(content)}`,
	);
	element.setAttribute('download', sanitizeFilename(filename));
	element.style.display = 'none';
	document.body.appendChild(element);
	try {
		element.click();
	} finally {
		document.body.removeChild(element);
	}
}
