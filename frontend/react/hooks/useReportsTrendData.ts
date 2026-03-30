import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchMonthWorklogs } from '../../services/monthWorklogService';
import { useConfigStore } from '../../stores/useConfigStore';
import { addDaysToIsoDate, parseIsoDateLocal } from '../utils/date';
import { buildManagerTrendModel } from '../utils/teamReports';
import { monthWorklogsQueryKey } from './useMonthWorklogs';

function getMonthsInRange(startDate: string, endDate: string) {
	const cursor = parseIsoDateLocal(startDate);
	cursor.setDate(1);
	const last = parseIsoDateLocal(endDate);
	last.setDate(1);

	const pairs: Array<{ year: number; month: number }> = [];
	while (cursor <= last) {
		pairs.push({
			year: cursor.getFullYear(),
			month: cursor.getMonth(),
		});
		cursor.setMonth(cursor.getMonth() + 1);
	}

	return pairs;
}

export function useReportsTrendData(
	weekStart: string,
	trendWeeks: number,
	options?: { enabled?: boolean },
) {
	const queryClient = useQueryClient();
	const config = useConfigStore((state) => state.config);
	const enabled =
		(options?.enabled ?? true) && !!config.jiraHost && !!config.apiToken;

	return useQuery({
		queryKey: [
			'reportsTrends',
			weekStart,
			trendWeeks,
			config.jiraHost,
			config.corsProxy,
			config.allowedUsers,
		],
		enabled,
		staleTime: 15 * 60 * 1000,
		queryFn: async () => {
			const firstWeekStart = addDaysToIsoDate(weekStart, -7 * (trendWeeks - 1));
			const lastWeekEnd = addDaysToIsoDate(weekStart, 6);
			const monthPairs = getMonthsInRange(firstWeekStart, lastWeekEnd);
			const results = await Promise.all(
				monthPairs.map(({ year, month }) =>
					queryClient.fetchQuery({
						queryKey: monthWorklogsQueryKey(
							year,
							month,
							config.jiraHost,
							config.corsProxy,
							false,
							'',
						),
						queryFn: ({ signal }) =>
							fetchMonthWorklogs(config, year, month, {}, signal),
						staleTime: 15 * 60 * 1000,
					}),
				),
			);

			return buildManagerTrendModel(
				results.flat(),
				weekStart,
				trendWeeks,
				config.allowedUsers,
			);
		},
	});
}
