interface RescueTimeRow {
	// [rank, seconds, n_people, productivity]
	0: number;
	1: number;
	2: number;
	3: number;
}

interface RescueTimeResponse {
	rows: RescueTimeRow[];
	row_headers: string[];
}

/**
 * Fetch daily productive hours from RescueTime for the given week.
 * Returns a map of date -> productive hours.
 *
 * Requires the CORS proxy since RescueTime doesn't send CORS headers.
 */
export async function fetchRescueTimeData(
	apiKey: string,
	corsProxy: string,
	weekStart: string,
	weekEnd: string,
	signal?: AbortSignal,
): Promise<Map<string, number>> {
	if (!apiKey) return new Map();

	const params = new URLSearchParams({
		key: apiKey,
		perspective: 'interval',
		restrict_kind: 'productivity',
		interval: 'day',
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

	const data = (await res.json()) as RescueTimeResponse;
	const dailyHours = new Map<string, number>();

	// The response with interval=day groups data by date
	// row_headers should include 'Date' as the first column
	// rows format depends on the API response, but typically:
	// [rank, time_spent_seconds, number_of_people, productivity]
	// With restrict_kind=productivity, we get productivity scores

	// Parse date from row_headers
	const dateIndex = data.row_headers?.indexOf('Date') ?? 0;

	for (const row of data.rows || []) {
		// Productivity >= 1 means "productive" or "very productive"
		const productivity = row[3] ?? 0;
		if (productivity >= 1) {
			const seconds = row[1] ?? 0;
			const hours = seconds / 3600;
			// Group by date - we'll accumulate productive hours
			const dateStr = String(row[dateIndex] ?? '').slice(0, 10);
			if (dateStr) {
				dailyHours.set(dateStr, (dailyHours.get(dateStr) || 0) + hours);
			}
		}
	}

	return dailyHours;
}
