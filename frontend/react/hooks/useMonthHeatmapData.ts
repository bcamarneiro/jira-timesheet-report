import { useMemo } from 'react';
import { useConfigStore } from '../../stores/useConfigStore';
import { useMonthWorklogs } from './useMonthWorklogs';

interface MonthHeatmapResult {
	data: Map<string, number>;
	isLoading: boolean;
	month: number;
	year: number;
}

export function useMonthHeatmapData(): MonthHeatmapResult {
	const now = new Date();
	const month = now.getMonth();
	const year = now.getFullYear();
	const email = useConfigStore((s) => s.config.email);

	const { data: worklogs, isLoading } = useMonthWorklogs(year, month, {
		currentUserOnly: true,
		prefetchAdjacent: true,
	});

	const data = useMemo(() => {
		const dayMap = new Map<string, number>();
		if (!worklogs) return dayMap;

		const lowerEmail = email.toLowerCase();

		for (const wl of worklogs) {
			if (wl.author?.emailAddress?.toLowerCase() !== lowerEmail) continue;
			const day = (wl.started ?? '').slice(0, 10);
			if (day) {
				dayMap.set(day, (dayMap.get(day) ?? 0) + (wl.timeSpentSeconds ?? 0));
			}
		}
		return dayMap;
	}, [worklogs, email]);

	return { data, isLoading, month, year };
}
