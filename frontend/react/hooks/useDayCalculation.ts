import { useMemo } from 'react';
import type { JiraWorklog } from '../../../types/JiraWorklog';
import { BASELINE_HOURS } from '../constants/timesheet';

export function useDayCalculation(worklogs: JiraWorklog[], isWeekend: boolean) {
	const calculations = useMemo(() => {
		const dayTotalSeconds = worklogs.reduce(
			(sum, wl) => sum + wl.timeSpentSeconds,
			0,
		);
		const baselineSeconds = isWeekend ? 0 : BASELINE_HOURS * 3600;
		const effectiveSeconds = dayTotalSeconds;
		const missingSeconds = Math.max(0, baselineSeconds - effectiveSeconds);

		return {
			dayTotalSeconds,
			baselineSeconds,
			effectiveSeconds,
			missingSeconds,
		};
	}, [worklogs, isWeekend]);

	return calculations;
}
