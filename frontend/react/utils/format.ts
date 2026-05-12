export function formatHours(seconds: number): string {
	const hours = seconds / 3600;
	return Number.isInteger(hours)
		? `${hours.toFixed(0)}h`
		: `${hours.toFixed(1)}h`;
}

/**
 * Canonical compliance percentage: `(totalSeconds / targetSeconds) * 100`
 * with a 0 fallback when there's no target. Shared by TimesheetGrid and
 * OverviewTable so a 1-second drift in either input doesn't produce a 1%
 * divergence between the two surfaces (see audit #19).
 */
export function computeCompliancePct(
	totalSeconds: number,
	targetSeconds: number,
): number {
	if (!Number.isFinite(targetSeconds) || targetSeconds <= 0) return 0;
	return (totalSeconds / targetSeconds) * 100;
}
