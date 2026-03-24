import { useEffect } from 'react';
import { useConfigStore } from '../../stores/useConfigStore';
import { useTimesheetStore } from '../../stores/useTimesheetStore';
import { useMonthWorklogs } from './useMonthWorklogs';

/**
 * Hook that fetches timesheet data via the shared month worklog query
 * and populates the Zustand store.
 *
 * TanStack Query handles caching, deduplication, and background refetching.
 */
export function useTimesheetDataFetcher(options?: { enabled?: boolean }) {
	const enabled = options?.enabled ?? true;
	const currentYear = useTimesheetStore((state) => state.currentYear);
	const currentMonth = useTimesheetStore((state) => state.currentMonth);
	const setData = useTimesheetStore((state) => state.setData);
	const jqlFilter = useConfigStore((state) => state.config.jqlFilter);

	const query = useMonthWorklogs(currentYear, currentMonth, {
		jqlFilter: jqlFilter || undefined,
		prefetchAdjacent: enabled,
		enabled,
	});

	// Sync data to store (cast to EnrichedJiraWorklog — same JSON shape)
	useEffect(() => {
		if (query.data) {
			setData(query.data);
		}
	}, [query.data, setData]);

	return {
		...query,
		errorMessage: query.error
			? query.error instanceof Error
				? `Failed to fetch data from Jira: ${query.error.message}`
				: 'An unknown error occurred.'
			: null,
	};
}
