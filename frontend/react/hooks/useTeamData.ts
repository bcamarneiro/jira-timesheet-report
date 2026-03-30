import { useMemo } from 'react';
import { useConfigStore } from '../../stores/useConfigStore';
import { buildTeamSummaries } from '../utils/teamReports';
import { useMonthWorklogs } from './useMonthWorklogs';

export function useTeamData(
	weekStart: string,
	weekEnd: string,
	options?: { enabled?: boolean },
) {
	const enabled = options?.enabled ?? true;
	const config = useConfigStore((s) => s.config);

	// Determine which month(s) the week spans
	const [startYear, startMonthStr] = weekStart.split('-').map(Number);
	const [endYear, endMonthStr] = weekEnd.split('-').map(Number);
	const startMonth = startMonthStr - 1;
	const endMonth = endMonthStr - 1;
	const spansMonths = startYear !== endYear || startMonth !== endMonth;

	// Primary month query (no prefetch — team page navigates by week, not month)
	const month1 = useMonthWorklogs(startYear, startMonth, { enabled });

	// Second month query (only when week spans two months)
	const month2 = useMonthWorklogs(endYear, endMonth, {
		enabled: enabled && spansMonths,
	});

	const isLoading = month1.isLoading || (spansMonths && month2.isLoading);
	const error = month1.error || month2.error;

	const teamMembers = useMemo(() => {
		const allWorklogs = [
			...(month1.data ?? []),
			...(spansMonths ? (month2.data ?? []) : []),
		];
		if (allWorklogs.length === 0 && !isLoading) return [];
		if (allWorklogs.length === 0) return [];

		return buildTeamSummaries(allWorklogs, weekStart, weekEnd, config.allowedUsers);
	}, [
		month1.data,
		month2.data,
		spansMonths,
		weekStart,
		weekEnd,
		config.allowedUsers,
		isLoading,
	]);

	return { data: teamMembers, isLoading, error };
}
