import { useEffect } from 'react';
import { useConfigStore } from '../../stores/useConfigStore';
import type { EnrichedJiraWorklog } from '../../stores/useTimesheetStore';
import { useTimesheetStore } from '../../stores/useTimesheetStore';
import { useMonthWorklogs } from './useMonthWorklogs';

/**
 * Hook that fetches timesheet data via the shared month worklog query
 * and populates the Zustand store.
 *
 * TanStack Query handles caching, deduplication, and background refetching.
 */
export function useTimesheetDataFetcher() {
	const currentYear = useTimesheetStore((state) => state.currentYear);
	const currentMonth = useTimesheetStore((state) => state.currentMonth);
	const setData = useTimesheetStore((state) => state.setData);
	const setLoading = useTimesheetStore((state) => state.setLoading);
	const setError = useTimesheetStore((state) => state.setError);
	const jqlFilter = useConfigStore((state) => state.config.jqlFilter);

	const { data, isLoading, error } = useMonthWorklogs(
		currentYear,
		currentMonth,
		{
			currentUserOnly: true,
			jqlFilter: jqlFilter || undefined,
			prefetchAdjacent: true,
		},
	);

	// Sync loading state to store
	useEffect(() => {
		setLoading(isLoading);
	}, [isLoading, setLoading]);

	// Sync error state to store
	useEffect(() => {
		if (error) {
			setError(
				error instanceof Error
					? `Failed to fetch data from Jira: ${error.message}`
					: 'An unknown error occurred.',
			);
		} else {
			setError(null);
		}
	}, [error, setError]);

	// Sync data to store (cast to EnrichedJiraWorklog — same JSON shape)
	useEffect(() => {
		if (data) {
			setData(data as unknown as EnrichedJiraWorklog[]);
		}
	}, [data, setData]);
}
