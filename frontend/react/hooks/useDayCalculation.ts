import { useMemo } from 'react';
import type { JiraWorklog } from '../../../types/JiraWorklog';
import { BASELINE_HOURS } from '../constants/timesheet';
import { classifyWorklog } from '../utils/worklogClassifier';

export function useDayCalculation(
	worklogs: JiraWorklog[],
	isWeekend: boolean,
	isAbsent = false,
) {
	const calculations = useMemo(() => {
		let countedSeconds = 0;
		let backdatedSeconds = 0;
		for (const wl of worklogs) {
			const seconds = wl.timeSpentSeconds ?? 0;
			if (classifyWorklog(wl).isBackdated) {
				backdatedSeconds += seconds;
			} else {
				countedSeconds += seconds;
			}
		}

		const baselineSeconds = isWeekend || isAbsent ? 0 : BASELINE_HOURS * 3600;
		const dayTotalSeconds = countedSeconds;
		const effectiveSeconds = countedSeconds;
		const missingSeconds = Math.max(0, baselineSeconds - effectiveSeconds);

		return {
			dayTotalSeconds,
			backdatedSeconds,
			baselineSeconds,
			effectiveSeconds,
			missingSeconds,
		};
	}, [worklogs, isWeekend, isAbsent]);

	return calculations;
}
