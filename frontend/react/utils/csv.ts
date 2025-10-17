import type { EnrichedJiraWorklog } from '../hooks/useTimesheetData';

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
	comment: {
		type?: string;
		version?: number;
		content?: any[];
	} | null,
): string | null {
	if (!comment || !comment.content) {
		return null;
	}

	const pattern = /Original Worklog Date was: (\d{4}\/\d{2}\/\d{2})/;

	for (const item of comment.content) {
		if (item.type === 'paragraph' && item.content) {
			for (const textItem of item.content) {
				if (textItem.type === 'text' && textItem.text) {
					const match = textItem.text.match(pattern);
					if (match) {
						return match[1];
					}
				}
			}
		}
	}

	return null;
}

export function isRetroactiveWorklog(
	worklog: EnrichedJiraWorklog,
	currentYear: number,
	currentMonth: number,
): boolean {
	const originalDate = parseOriginalDateFromComment(worklog.comment ?? null);
	if (!originalDate) {
		return false; // No original date found, not retroactive
	}

	const originalDateObj = new Date(originalDate);
	const loggedDateObj = new Date(worklog.started as string);

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
	year: number,
	month: number,
): string {
	const headers = [
		'Date',
		'Time (h)',
		'Key',
		'Summary',
		'Comment',
		'Is Retroactive',
	].join(',');
	const rows = data.map((entry) => {
		const date = new Date(entry.started as string);
		const formattedDate = `${date.getFullYear()}/${String(
			date.getMonth() + 1,
		).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
		const time = (entry.timeSpentSeconds ?? 0) / 3600;
		const key = entry.issue.key;
		const summary = issueSummaries[entry.issue.id] ?? '';

		let commentText = '';
		if (entry.comment && entry.comment.content) {
			commentText = entry.comment.content
				.map((p: any) => p.content.map((t: any) => t.text || '').join(' '))
				.join(' ');
		}

		const isRetro = isRetroactiveWorklog(entry, year, month);

		return [
			formattedDate,
			time.toFixed(2),
			key,
			csvEscape(summary),
			csvEscape(commentText),
			isRetro ? 'Yes' : 'No',
		].join(',');
	});

	return [headers, ...rows].join('\n');
}

export function download(filename: string, content: string) {
	const element = document.createElement('a');
	element.setAttribute(
		'href',
		`data:text/csv;charset=utf-8,${encodeURIComponent(content)}`,
	);
	element.setAttribute('download', filename);
	element.style.display = 'none';
	document.body.appendChild(element);
	element.click();
	document.body.removeChild(element);
}
