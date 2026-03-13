import type {
	DaySummary,
	RescueTimeDaySummary,
	WorklogSuggestion,
} from '../../types/Suggestion';

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

function formatTimeSpent(seconds: number): string {
	const hours = seconds / 3600;
	if (hours >= 1) {
		const h = Math.floor(hours);
		const remaining = seconds % 3600;
		return remaining > 0 ? `${h}h ${Math.round(remaining / 60)}m` : `${h}h`;
	}
	return `${Math.round(seconds / 60)}m`;
}

/**
 * Scale suggestion durations using RescueTime data.
 *
 * If RT says the user worked 6h productive but Jira/GitLab only account
 * for 2h of traceable activity, we scale suggestion times up so the total
 * better reflects actual work done.
 */
function scaleSuggestionsWithRT(
	suggestions: WorklogSuggestion[],
	rtData: RescueTimeDaySummary | undefined,
	gapSeconds: number,
): WorklogSuggestion[] {
	if (!rtData || suggestions.length === 0 || gapSeconds <= 0)
		return suggestions;

	const rtProductiveSeconds = rtData.productiveSeconds;
	if (rtProductiveSeconds <= 0) return suggestions;

	const totalSuggested = suggestions.reduce(
		(sum, s) => sum + s.suggestedSeconds,
		0,
	);
	if (totalSuggested <= 0) return suggestions;

	// RT productive time is our best estimate of actual work done.
	// Scale suggestions so their total approaches RT productive time,
	// but never exceed the gap.
	const targetTotal = Math.min(rtProductiveSeconds, gapSeconds);
	const scaleFactor = targetTotal / totalSuggested;

	// Only scale up, not down. If suggestions already exceed RT, leave them.
	if (scaleFactor <= 1) return suggestions;

	// Cap scale factor at 3x to avoid absurd estimates
	const cappedFactor = Math.min(scaleFactor, 3);

	return suggestions.map((s) => {
		const newSeconds = Math.round(s.suggestedSeconds * cappedFactor);
		const cappedSeconds = Math.min(newSeconds, gapSeconds);
		return {
			...s,
			suggestedSeconds: cappedSeconds,
			suggestedTimeSpent: formatTimeSpent(cappedSeconds),
			// Boost confidence when RT backs up the suggestion
			confidence:
				s.confidence === 'low' && cappedFactor > 1.5
					? 'medium'
					: s.confidence === 'medium' && cappedFactor > 2
						? 'high'
						: s.confidence,
		};
	});
}

/**
 * Merge suggestions from all sources, dedup, filter already-logged issues,
 * and produce a full week of DaySummary objects.
 *
 * Uses RescueTime data to:
 * 1. Scale suggestion durations to match actual productive hours
 * 2. Boost confidence when RT confirms heavy work
 * 3. Show activity breakdown per day
 */
export function mergeSuggestions(
	weekStart: string,
	jiraSuggestions: WorklogSuggestion[],
	gitlabSuggestions: WorklogSuggestion[],
	rescueTimeData: Map<string, RescueTimeDaySummary>,
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
		const rtDay = rescueTimeData.get(date);

		// Get suggestions for this day
		const daySuggestionsRaw = [...deduped.values()]
			.filter((s) => s.date === date)
			.sort(
				(a, b) => confidenceOrder[b.confidence] - confidenceOrder[a.confidence],
			);

		// Scale suggestions using RescueTime productive hours
		const scaled = scaleSuggestionsWithRT(daySuggestionsRaw, rtDay, gapSeconds);

		// Cap total at gap
		const daySuggestions: WorklogSuggestion[] = [];
		let suggestedTotal = 0;

		for (const s of scaled) {
			if (suggestedTotal >= gapSeconds) break;
			const cappedSeconds = Math.min(
				s.suggestedSeconds,
				gapSeconds - suggestedTotal,
			);
			daySuggestions.push({
				...s,
				suggestedSeconds: cappedSeconds,
				suggestedTimeSpent: formatTimeSpent(cappedSeconds),
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
			rescueTime: rtDay,
		};
	});
}
