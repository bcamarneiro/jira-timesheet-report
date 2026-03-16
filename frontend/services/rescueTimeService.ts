import type {
	RescueTimeActivity,
	RescueTimeDaySummary,
} from '../../types/Suggestion';

/**
 * Fetch daily activity breakdown from RescueTime for the given week.
 * Returns a map of date -> RescueTimeDaySummary with productive hours
 * and top activities per day.
 *
 * Uses restrict_kind=activity to get per-app/site data grouped by day.
 * Requires the CORS proxy since RescueTime doesn't send CORS headers.
 */
export async function fetchRescueTimeData(
	apiKey: string,
	corsProxy: string,
	weekStart: string,
	weekEnd: string,
	signal?: AbortSignal,
): Promise<Map<string, RescueTimeDaySummary>> {
	if (!apiKey) return new Map();

	const params = new URLSearchParams({
		key: apiKey,
		perspective: 'interval',
		restrict_kind: 'activity',
		resolution_time: 'day',
		restrict_begin: weekStart,
		restrict_end: weekEnd,
		format: 'json',
	});

	const baseUrl = 'https://www.rescuetime.com/anapi/data';
	const url = corsProxy
		? `${corsProxy.replace(/\/$/, '')}/${baseUrl}?${params}`
		: `${baseUrl}?${params}`;

	const res = await fetch(url, { signal });
	if (!res.ok) {
		if (res.status === 403) throw new Error('Invalid RescueTime API key');
		throw new Error(`RescueTime API error: ${res.status}`);
	}

	const data = (await res.json()) as {
		row_headers: string[];
		rows: (string | number)[][];
	};

	// Row format with restrict_kind=activity, perspective=interval:
	// [Date, Time Spent (seconds), Number of People, Activity, Category, Productivity]
	const dateIdx = data.row_headers.indexOf('Date');
	const secondsIdx = data.row_headers.indexOf('Time Spent (seconds)');
	const activityIdx = data.row_headers.indexOf('Activity');
	const categoryIdx = data.row_headers.indexOf('Category');
	const productivityIdx = data.row_headers.indexOf('Productivity');

	// Group activities by date
	const byDay = new Map<string, RescueTimeActivity[]>();

	for (const row of data.rows || []) {
		const dateStr = String(row[dateIdx] ?? '').slice(0, 10);
		if (!dateStr) continue;

		const seconds = Number(row[secondsIdx] ?? 0);
		const productivity = Number(row[productivityIdx] ?? 0);

		const activity: RescueTimeActivity = {
			name: String(row[activityIdx] ?? ''),
			category: String(row[categoryIdx] ?? ''),
			seconds,
			productivity,
		};

		const existing = byDay.get(dateStr) || [];
		existing.push(activity);
		byDay.set(dateStr, existing);
	}

	// Build summaries: aggregate productive time, keep top activities
	const result = new Map<string, RescueTimeDaySummary>();

	for (const [date, activities] of byDay) {
		const productiveSeconds = activities
			.filter((a) => a.productivity >= 1)
			.reduce((sum, a) => sum + a.seconds, 0);

		// Merge activities with the same name (can appear under multiple categories)
		const mergedMap = new Map<string, RescueTimeActivity>();
		for (const a of activities.filter((a) => a.productivity >= 1)) {
			const existing = mergedMap.get(a.name);
			if (existing) {
				existing.seconds += a.seconds;
			} else {
				mergedMap.set(a.name, { ...a });
			}
		}

		// Top 5 productive activities by time spent
		const topActivities = [...mergedMap.values()]
			.sort((a, b) => b.seconds - a.seconds)
			.slice(0, 5);

		result.set(date, { productiveSeconds, topActivities });
	}

	return result;
}
