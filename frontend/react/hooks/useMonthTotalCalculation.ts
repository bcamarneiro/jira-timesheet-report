import { useMemo } from 'react';
import type { JiraWorklog } from '../../../types/JiraWorklog';
import { isDateInMonth } from '../utils/date';

export function useMonthTotalCalculation(
	days: Record<string, JiraWorklog[]>,
	currentYear: number,
	currentMonth: number,
) {
	const totalSeconds = useMemo(() => {
		let userTotalSeconds = 0;

		for (const [dateKey, dayWorklogs] of Object.entries(days)) {
			// Only include worklogs from dates within the current month
			if (!isDateInMonth(dateKey, currentYear, currentMonth)) {
				continue;
			}
			const dayTotalSeconds = dayWorklogs.reduce(
				(sum, wl) => sum + wl.timeSpentSeconds,
				0,
			);
			userTotalSeconds += dayTotalSeconds;
		}

		return userTotalSeconds;
	}, [days, currentYear, currentMonth]);

	return { totalSeconds };
}
