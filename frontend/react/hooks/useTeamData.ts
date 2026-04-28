import { useMemo, useState } from 'react';
import { useConfigStore } from '../../stores/useConfigStore';
import { buildTeamSummaries } from '../utils/teamReports';
import { useAbsenceDaysByUser } from './useAbsenceDays';
import { useMonthWorklogs } from './useMonthWorklogs';
import type { WorklogFetchProgress } from '../../../types/worklogLoading';

export function useTeamData(
	weekStart: string,
	weekEnd: string,
	options?: { enabled?: boolean },
) {
	const enabled = options?.enabled ?? true;
	const config = useConfigStore((s) => s.config);
	const [month1Progress, setMonth1Progress] =
		useState<WorklogFetchProgress | null>(null);
	const [month2Progress, setMonth2Progress] =
		useState<WorklogFetchProgress | null>(null);

	// Determine which month(s) the week spans
	const [startYear, startMonthStr] = weekStart.split('-').map(Number);
	const [endYear, endMonthStr] = weekEnd.split('-').map(Number);
	const startMonth = startMonthStr - 1;
	const endMonth = endMonthStr - 1;
	const spansMonths = startYear !== endYear || startMonth !== endMonth;

	// Primary month query (no prefetch — team page navigates by week, not month)
	const month1 = useMonthWorklogs(startYear, startMonth, {
		enabled,
		onProgress: setMonth1Progress,
	});

	// Second month query (only when week spans two months)
	const month2 = useMonthWorklogs(endYear, endMonth, {
		enabled: enabled && spansMonths,
		onProgress: setMonth2Progress,
	});
	const {
		data: absenceDaysByUser,
		isLoading: absencesLoading,
		isFetching: absencesFetching,
	} = useAbsenceDaysByUser(weekStart, weekEnd, { enabled });

	const isLoading =
		month1.isLoading || (spansMonths && month2.isLoading) || absencesLoading;
	const isFetching =
		month1.isFetching || (spansMonths && month2.isFetching) || absencesFetching;
	const error = month1.error || month2.error;
	const lastUpdatedAt = Math.max(
		month1.dataUpdatedAt ?? 0,
		spansMonths ? (month2.dataUpdatedAt ?? 0) : 0,
	);
	const loadingProgress = useMemo(() => {
		if (!spansMonths) return month1Progress;
		if (month1Progress && month2Progress) {
			return {
				phase: 'fetching-truncated' as const,
				percent: Math.round(
					(month1Progress.percent + month2Progress.percent) / 2,
				),
				message: 'Loading cross-month worklogs',
				detail: `${month1Progress.message} · ${month2Progress.message}`,
			};
		}
		return month1Progress ?? month2Progress;
	}, [spansMonths, month1Progress, month2Progress]);

	const teamMembers = useMemo(() => {
		const allWorklogs = [
			...(month1.data ?? []),
			...(spansMonths ? (month2.data ?? []) : []),
		];
		if (allWorklogs.length === 0 && !isLoading) return [];
		if (allWorklogs.length === 0) return [];

		return buildTeamSummaries(
			allWorklogs,
			weekStart,
			weekEnd,
			config.allowedUsers,
			absenceDaysByUser,
		);
	}, [
		month1.data,
		month2.data,
		spansMonths,
		weekStart,
		weekEnd,
		config.allowedUsers,
		absenceDaysByUser,
		isLoading,
	]);

	return {
		data: teamMembers,
		isLoading,
		isFetching,
		error,
		lastUpdatedAt: lastUpdatedAt > 0 ? lastUpdatedAt : null,
		loadingProgress,
	};
}
