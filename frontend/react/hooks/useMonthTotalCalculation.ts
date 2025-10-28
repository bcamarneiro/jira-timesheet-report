import { useMemo } from 'react';
import type { JiraWorklog } from '../../../types/JiraWorklog';

export function useMonthTotalCalculation(
	days: Record<string, JiraWorklog[]>,
) {
	const totalSeconds = useMemo(() => {
		let userTotalSeconds = 0;

		for (const dayWorklogs of Object.values(days)) {
			const dayTotalSeconds = dayWorklogs.reduce(
				(sum, wl) => sum + wl.timeSpentSeconds,
				0,
			);
			userTotalSeconds += dayTotalSeconds;
		}

		return userTotalSeconds;
	}, [days]);

	return { totalSeconds };
}
