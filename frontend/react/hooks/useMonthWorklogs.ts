import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import {
	fetchMonthWorklogs,
	type WorklogItem,
} from '../../services/monthWorklogService';
import { useConfigStore } from '../../stores/useConfigStore';

interface UseMonthWorklogsOptions {
	currentUserOnly?: boolean;
	jqlFilter?: string;
	enabled?: boolean;
	/** Prefetch adjacent months in background. Only useful for month-based navigation (timesheet, heatmap). */
	prefetchAdjacent?: boolean;
}

/** Build a query key for monthWorklogs (for use with queryClient.fetchQuery) */
export function monthWorklogsQueryKey(
	year: number,
	month: number,
	jiraHost: string,
	corsProxy: string,
	currentUserOnly: boolean,
	jqlFilter: string,
) {
	return [
		'monthWorklogs',
		year,
		month,
		jiraHost,
		corsProxy,
		currentUserOnly,
		jqlFilter,
	];
}

export function useMonthWorklogs(
	year: number,
	month: number,
	options?: UseMonthWorklogsOptions,
) {
	const config = useConfigStore((s) => s.config);
	const queryClient = useQueryClient();
	const currentUserOnly = options?.currentUserOnly ?? false;
	const jqlFilter = options?.jqlFilter ?? '';

	const result = useQuery<WorklogItem[]>({
		queryKey: monthWorklogsQueryKey(
			year,
			month,
			config.jiraHost,
			config.corsProxy,
			currentUserOnly,
			jqlFilter,
		),
		queryFn: ({ signal }) =>
			fetchMonthWorklogs(
				config,
				year,
				month,
				{
					currentUserOnly,
					jqlFilter: options?.jqlFilter,
				},
				signal,
			),
		enabled:
			(options?.enabled ?? true) && !!config.jiraHost && !!config.apiToken,
		staleTime: 15 * 60 * 1000,
	});

	// Prefetch adjacent months in background (opt-in, useful for month navigation)
	const prefetchAdjacent = options?.prefetchAdjacent ?? false;
	useEffect(() => {
		if (!prefetchAdjacent || !config.jiraHost || !config.apiToken) return;

		const prevMonth = month === 0 ? 11 : month - 1;
		const prevYear = month === 0 ? year - 1 : year;
		const nextMonth = month === 11 ? 0 : month + 1;
		const nextYear = month === 11 ? year + 1 : year;

		for (const [y, m] of [
			[prevYear, prevMonth],
			[nextYear, nextMonth],
		]) {
			queryClient.prefetchQuery({
				queryKey: monthWorklogsQueryKey(
					y,
					m,
					config.jiraHost,
					config.corsProxy,
					currentUserOnly,
					jqlFilter,
				),
				queryFn: ({ signal }) =>
					fetchMonthWorklogs(
						config,
						y,
						m,
						{
							currentUserOnly,
							jqlFilter: options?.jqlFilter,
						},
						signal,
					),
				staleTime: 15 * 60 * 1000,
			});
		}
	}, [
		prefetchAdjacent,
		year,
		month,
		config,
		currentUserOnly,
		jqlFilter,
		queryClient,
		options?.jqlFilter,
	]);

	return result;
}
