import { sanitizeFilename } from './downloadFile';
import type { EnrichedJiraWorklog } from '../../../types/jira';

const SEP = ';';

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

function parseOriginalDateFromComment(
	comment: string | undefined,
): string | null {
	if (!comment) {
		return null;
	}

	const pattern = /Original Worklog Date was: (\d{4}\/\d{2}\/\d{2})/;
	const match = comment.match(pattern);
	return match ? match[1] : null;
}

function getActualLoggedDateParts(worklog: EnrichedJiraWorklog): {
	sortKey: number;
	formattedDate: string;
} {
	const started = worklog.started ? new Date(worklog.started) : null;
	if (!started || Number.isNaN(started.getTime())) {
		return {
			sortKey: Number.POSITIVE_INFINITY,
			formattedDate: '',
		};
	}

	const formattedDate = `${started.getFullYear()}/${String(
		started.getMonth() + 1,
	).padStart(2, '0')}/${String(started.getDate()).padStart(2, '0')}`;

	return {
		sortKey: started.getTime(),
		formattedDate,
	};
}

function getOriginalIntendedSortKey(worklog: EnrichedJiraWorklog): string {
	const originalDate = parseOriginalDateFromComment(worklog.comment);
	return originalDate ?? '9999/99/99';
}

function sortWorklogsForCsv(
	data: EnrichedJiraWorklog[],
): EnrichedJiraWorklog[] {
	return [...data].sort((a, b) => {
		const actualA = getActualLoggedDateParts(a);
		const actualB = getActualLoggedDateParts(b);
		if (actualA.sortKey !== actualB.sortKey) {
			return actualA.sortKey - actualB.sortKey;
		}

		const originalA = getOriginalIntendedSortKey(a);
		const originalB = getOriginalIntendedSortKey(b);
		if (originalA !== originalB) {
			return originalA.localeCompare(originalB);
		}

		const issueKeyA = a.issue?.key ?? '';
		const issueKeyB = b.issue?.key ?? '';
		if (issueKeyA !== issueKeyB) {
			return issueKeyA.localeCompare(issueKeyB);
		}

		return (a.id ?? '').localeCompare(b.id ?? '');
	});
}

export function isRetroactiveWorklog(
	worklog: EnrichedJiraWorklog,
	currentYear: number,
	currentMonth: number,
): boolean {
	const originalDate = parseOriginalDateFromComment(worklog.comment);
	if (!originalDate) {
		return false; // No original date found, not retroactive
	}

	const originalDateObj = new Date(originalDate);
	const loggedDateObj = new Date(worklog.started ?? '');

	// Check if logged in current month but original date is in a previous month
	const isLoggedInCurrentMonth =
		loggedDateObj.getFullYear() === currentYear &&
		loggedDateObj.getMonth() === currentMonth;
	const isOriginalInPreviousMonth =
		originalDateObj.getFullYear() < currentYear ||
		(originalDateObj.getFullYear() === currentYear &&
			originalDateObj.getMonth() < currentMonth);

	return isLoggedInCurrentMonth && isOriginalInPreviousMonth;
}

export function buildCsvForUser(
	data: EnrichedJiraWorklog[],
	issueSummaries: Record<string, string>,
): string {
	const sortedData = sortWorklogsForCsv(data);
	const headers = [
		'Name',
		'TicketKey',
		'TicketName',
		'OriginalIntendedDate',
		'ActualLoggedDate',
		'BookedTime',
	].join(SEP);
	const rows = sortedData.map((entry) => {
		const name = entry.author?.displayName ?? '';
		const ticketKey = entry.issue.key;
		const ticketName = issueSummaries[entry.issue.id] ?? '';

		// Parse original intended date from comment if retroactive
		const originalDate = parseOriginalDateFromComment(entry.comment);
		const originalIntendedDate = originalDate || '';

		// Actual logged date
		const actualLoggedDate = getActualLoggedDateParts(entry).formattedDate;

		// Booked time in hours
		const bookedTime = (entry.timeSpentSeconds ?? 0) / 3600;

		return [
			csvEscape(name),
			ticketKey,
			csvEscape(ticketName),
			originalIntendedDate,
			actualLoggedDate,
			bookedTime.toFixed(2),
		].join(SEP);
	});

	// Calculate total hours
	const totalSeconds = sortedData.reduce(
		(sum, entry) => sum + (entry.timeSpentSeconds ?? 0),
		0,
	);
	const totalHours = (totalSeconds / 3600).toFixed(2);

	// Add total row at the bottom
	const totalRow = ['', '', '', '', 'Total', totalHours].join(SEP);

	return [headers, ...rows, totalRow].join('\n');
}

export type UserSummary = {
	user: string;
	totalHours: number;
	worklogCount: number;
	daysWorked: number;
};

export function buildSummaryCsv(
	summaries: UserSummary[],
	year: number,
	month: number,
): string {
	const monthName = new Date(Date.UTC(year, month, 1)).toLocaleString(
		undefined,
		{ month: 'long', year: 'numeric', timeZone: 'UTC' },
	);

	const headers = ['User', 'Days Worked', 'Entries', 'Total Hours'].join(SEP);
	const rows = summaries.map((s) =>
		[
			csvEscape(s.user),
			s.daysWorked.toFixed(1),
			s.worklogCount,
			s.totalHours.toFixed(2),
		].join(SEP),
	);

	const grandTotalHours = summaries.reduce((sum, s) => sum + s.totalHours, 0);
	const grandTotalEntries = summaries.reduce(
		(sum, s) => sum + s.worklogCount,
		0,
	);
	const grandTotalDays = grandTotalHours / 8;

	const totalRow = [
		csvEscape(`Total (${summaries.length} users)`),
		grandTotalDays.toFixed(1),
		grandTotalEntries,
		grandTotalHours.toFixed(2),
	].join(SEP);

	return [
		csvEscape(`Timesheet Summary - ${monthName}`),
		'',
		headers,
		...rows,
		totalRow,
	].join('\n');
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
