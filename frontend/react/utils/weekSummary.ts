import { parseIsoDateLocal } from './date';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatWeekRange(weekStart: string, weekEnd: string): string {
	const s = parseIsoDateLocal(weekStart);
	const e = parseIsoDateLocal(weekEnd);
	const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
	const startStr = s.toLocaleDateString('en-US', opts);
	const endStr = e.toLocaleDateString('en-US', {
		...opts,
		year: 'numeric',
	});
	return `${startStr} - ${endStr}`;
}

function formatDuration(seconds: number): string {
	const totalMinutes = Math.round(seconds / 60);
	const h = Math.floor(totalMinutes / 60);
	const m = totalMinutes % 60;
	if (m === 0) return `${h}h`;
	if (h === 0) return `${m}m`;
	return `${h}h ${m}m`;
}

export function generateWeeklySummary(
	weekStart: string,
	weekEnd: string,
	worklogs: Array<{
		date: string;
		issueKey: string;
		issueSummary?: string;
		timeSpentSeconds: number;
	}>,
): string {
	const lines: string[] = [];

	lines.push(`## Week: ${formatWeekRange(weekStart, weekEnd)}`);
	lines.push('');

	if (worklogs.length === 0) {
		lines.push('No worklogs recorded this week.');
		return lines.join('\n');
	}

	// Group by issueKey
	const issueMap = new Map<
		string,
		{
			summary?: string;
			daySeconds: Map<string, number>;
			totalSeconds: number;
		}
	>();

	for (const wl of worklogs) {
		let entry = issueMap.get(wl.issueKey);
		if (!entry) {
			entry = {
				summary: wl.issueSummary,
				daySeconds: new Map(),
				totalSeconds: 0,
			};
			issueMap.set(wl.issueKey, entry);
		}
		const prev = entry.daySeconds.get(wl.date) ?? 0;
		entry.daySeconds.set(wl.date, prev + wl.timeSpentSeconds);
		entry.totalSeconds += wl.timeSpentSeconds;
		// Keep the latest non-empty summary
		if (wl.issueSummary && !entry.summary) {
			entry.summary = wl.issueSummary;
		}
	}

	let weekTotalSeconds = 0;
	const dayTotals = new Map<string, number>();

	const sortedIssues = [...issueMap.entries()].sort(([, a], [, b]) => {
		if (b.totalSeconds !== a.totalSeconds) {
			return b.totalSeconds - a.totalSeconds;
		}
		return 0;
	});

	for (const [issueKey, entry] of sortedIssues) {
		const title = entry.summary
			? `### ${issueKey} - ${entry.summary}`
			: `### ${issueKey}`;
		lines.push(title);

		// Sort days chronologically
		const sortedDays = [...entry.daySeconds.entries()].sort(([a], [b]) =>
			a.localeCompare(b),
		);

		for (const [date, seconds] of sortedDays) {
			const d = parseIsoDateLocal(date);
			const dayLabel = DAY_LABELS[d.getDay()];
			lines.push(`- ${dayLabel}: ${formatDuration(seconds)}`);
			dayTotals.set(date, (dayTotals.get(date) ?? 0) + seconds);
		}

		lines.push(`- **Total: ${formatDuration(entry.totalSeconds)}**`);
		lines.push('');
		lines.push('---');

		weekTotalSeconds += entry.totalSeconds;
	}

	// Replace trailing --- with the week total
	lines.pop();
	lines.push(`**Week Total: ${formatDuration(weekTotalSeconds)} / 40h**`);
	lines.push('');
	lines.push('### Daily Totals');

	for (const [date, seconds] of [...dayTotals.entries()].sort(([a], [b]) =>
		a.localeCompare(b),
	)) {
		const d = parseIsoDateLocal(date);
		lines.push(`- ${DAY_LABELS[d.getDay()]} (${date}): ${formatDuration(seconds)}`);
	}

	return lines.join('\n');
}
