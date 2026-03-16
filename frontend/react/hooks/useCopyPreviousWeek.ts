import { useState } from 'react';
import type { WorklogSuggestion } from '../../../types/Suggestion';
import { fetchWeekWorklogs } from '../../services/worklogService';
import { useConfigStore } from '../../stores/useConfigStore';
import { useDashboardStore } from '../../stores/useDashboardStore';

/**
 * Given a date string, shift it forward by 7 days and return the new date string.
 */
function shiftDateByWeek(dateStr: string): string {
	const d = new Date(dateStr);
	d.setDate(d.getDate() + 7);
	return d.toISOString().slice(0, 10);
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
 * Get the Monday of the previous week given the current week's Monday.
 */
function getPreviousWeekStart(weekStart: string): string {
	const d = new Date(weekStart);
	d.setDate(d.getDate() - 7);
	return d.toISOString().slice(0, 10);
}

function getPreviousWeekEnd(prevWeekStart: string): string {
	const d = new Date(prevWeekStart);
	d.setDate(d.getDate() + 6);
	return d.toISOString().slice(0, 10);
}

export function useCopyPreviousWeek() {
	const config = useConfigStore((s) => s.config);
	const weekStart = useDashboardStore((s) => s.weekStart);
	const mergePreviousWeekSuggestions = useDashboardStore(
		(s) => s.mergePreviousWeekSuggestions,
	);
	const [isLoading, setIsLoading] = useState(false);

	const copyPreviousWeek = async () => {
		if (!config.jiraHost || !config.apiToken) return;

		setIsLoading(true);
		try {
			const prevStart = getPreviousWeekStart(weekStart);
			const prevEnd = getPreviousWeekEnd(prevStart);

			const prevWorklogs = await fetchWeekWorklogs(config, prevStart, prevEnd);

			if (prevWorklogs.length === 0) return;

			// Group worklogs by (dayOfWeek, issueKey) and aggregate time
			const grouped = new Map<
				string,
				{
					issueKey: string;
					issueSummary?: string;
					date: string;
					totalSeconds: number;
				}
			>();

			for (const wl of prevWorklogs) {
				if (!wl.issueKey) continue;
				const key = `${wl.date}::${wl.issueKey}`;
				const existing = grouped.get(key);
				if (existing) {
					existing.totalSeconds += wl.timeSpentSeconds;
				} else {
					grouped.set(key, {
						issueKey: wl.issueKey,
						issueSummary: wl.issueSummary,
						date: wl.date,
						totalSeconds: wl.timeSpentSeconds,
					});
				}
			}

			// Map each previous-week entry to the corresponding day of the current week
			const suggestions: WorklogSuggestion[] = [];

			for (const entry of grouped.values()) {
				const currentDate = shiftDateByWeek(entry.date);
				suggestions.push({
					id: `prev-week-${entry.issueKey}-${currentDate}`,
					source: 'previous-week',
					issueKey: entry.issueKey,
					issueSummary: entry.issueSummary,
					date: currentDate,
					suggestedTimeSpent: formatTimeSpent(entry.totalSeconds),
					suggestedSeconds: entry.totalSeconds,
					confidence: 'medium',
					reason: 'Logged last week on the same day',
					logged: false,
				});
			}

			mergePreviousWeekSuggestions(suggestions);
		} finally {
			setIsLoading(false);
		}
	};

	return { copyPreviousWeek, isLoading };
}
