import type { DaySummary, WorklogSuggestion } from '../../types/Suggestion';

const BASELINE_SECONDS = 8 * 3600;

interface WorklogEntry {
	date: string;
	issueKey?: string;
	timeSpentSeconds: number;
}

/**
 * Get Monday-to-Sunday date strings for a given week start.
 */
function getWeekDates(weekStart: string): string[] {
	const dates: string[] = [];
	const start = new Date(weekStart);
	for (let i = 0; i < 7; i++) {
		const d = new Date(start);
		d.setDate(start.getDate() + i);
		dates.push(d.toISOString().slice(0, 10));
	}
	return dates;
}

/**
 * Merge suggestions from all sources, dedup, filter already-logged issues,
 * and produce a full week of DaySummary objects.
 */
export function mergeSuggestions(
	weekStart: string,
	jiraSuggestions: WorklogSuggestion[],
	gitlabSuggestions: WorklogSuggestion[],
	rescueTimeData: Map<string, number>,
	existingWorklogs: WorklogEntry[],
): DaySummary[] {
	const dates = getWeekDates(weekStart);

	// Build a set of (date, issueKey) already logged
	const loggedSet = new Set<string>();
	const loggedByDay = new Map<string, number>();

	for (const wl of existingWorklogs) {
		const day = wl.date.slice(0, 10);
		loggedByDay.set(day, (loggedByDay.get(day) || 0) + wl.timeSpentSeconds);
		if (wl.issueKey) {
			loggedSet.add(`${day}::${wl.issueKey}`);
		}
	}

	// Combine all suggestions
	const allSuggestions = [...jiraSuggestions, ...gitlabSuggestions];

	// Deduplicate: same (date, issueKey), keep higher confidence
	const deduped = new Map<string, WorklogSuggestion>();
	const confidenceOrder = { high: 3, medium: 2, low: 1 };

	for (const s of allSuggestions) {
		const key = `${s.date}::${s.issueKey}`;

		// Skip if already logged for this issue on this day
		if (loggedSet.has(key)) continue;

		const existing = deduped.get(key);
		if (
			!existing ||
			confidenceOrder[s.confidence] > confidenceOrder[existing.confidence]
		) {
			deduped.set(key, s);
		}
	}

	// Build day summaries
	return dates.map((date) => {
		const d = new Date(date);
		const dayOfWeek = d.getDay();
		const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
		const loggedSeconds = loggedByDay.get(date) || 0;
		const targetSeconds = isWeekend ? 0 : BASELINE_SECONDS;
		const gapSeconds = Math.max(0, targetSeconds - loggedSeconds);

		// Get suggestions for this day, cap total at gap
		const daySuggestions: WorklogSuggestion[] = [];
		let suggestedTotal = 0;

		const sorted = [...deduped.values()]
			.filter((s) => s.date === date)
			.sort(
				(a, b) => confidenceOrder[b.confidence] - confidenceOrder[a.confidence],
			);

		for (const s of sorted) {
			if (suggestedTotal >= gapSeconds) break;
			const cappedSeconds = Math.min(
				s.suggestedSeconds,
				gapSeconds - suggestedTotal,
			);
			const hours = cappedSeconds / 3600;
			daySuggestions.push({
				...s,
				suggestedSeconds: cappedSeconds,
				suggestedTimeSpent:
					hours >= 1
						? `${Math.floor(hours)}h${cappedSeconds % 3600 > 0 ? ` ${Math.round((cappedSeconds % 3600) / 60)}m` : ''}`
						: `${Math.round(cappedSeconds / 60)}m`,
			});
			suggestedTotal += cappedSeconds;
		}

		return {
			date,
			dayOfWeek,
			isWeekend,
			loggedSeconds,
			targetSeconds,
			gapSeconds,
			suggestions: daySuggestions,
			rescueTimeProductiveHours: rescueTimeData.get(date),
		};
	});
}
