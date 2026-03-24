/**
 * Check if a worklog was retroactively logged — i.e. the `created` timestamp
 * falls in a different month than the `started` timestamp.
 *
 * This detects backfilled entries where someone logged time for a previous month.
 */
export function isRetroactivelyLogged(
	created: string | undefined,
	started: string | undefined,
): boolean {
	if (!created || !started) return false;

	const createdMonth = created.slice(0, 7); // "YYYY-MM"
	const startedMonth = started.slice(0, 7);

	return createdMonth !== startedMonth;
}

/**
 * Get the number of days between `created` and `started` (positive = logged later).
 * Returns 0 if either date is missing.
 */
export function getRetroactiveDays(
	created: string | undefined,
	started: string | undefined,
): number {
	if (!created || !started) return 0;

	const createdDate = new Date(created);
	const startedDate = new Date(started);
	const diffMs = createdDate.getTime() - startedDate.getTime();

	return Math.round(diffMs / (1000 * 60 * 60 * 24));
}
