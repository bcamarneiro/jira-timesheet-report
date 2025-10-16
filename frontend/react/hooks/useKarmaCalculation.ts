import { useMemo } from 'react';
import type { JiraWorklog } from '../../../types/JiraWorklog';
import { BASELINE_HOURS, WEEKEND_DAYS } from '../constants/timesheet';
import { isoDateFromYMD } from '../utils/date';

export function useKarmaCalculation(
	days: Record<string, JiraWorklog[]>,
	year: number,
	monthZeroIndexed: number,
	getTimeOffHours: (iso: string) => number,
) {
	const { totalSeconds, netKarmaSeconds } = useMemo(() => {
		let userTotalSeconds = 0;
		let userNetKarmaSeconds = 0;

		const now = new Date();
		const todayStartUtc = new Date(
			Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
		);

		for (let d = 1; d <= 31; d++) {
			const iso = isoDateFromYMD(year, monthZeroIndexed, d);
			const worklogs = days[iso] || [];
			const dayTotalSeconds = worklogs.reduce(
				(sum, wl) => sum + wl.timeSpentSeconds,
				0,
			);
			userTotalSeconds += dayTotalSeconds;

			const jsDate = new Date(Date.UTC(year, monthZeroIndexed, d));
			const weekday = jsDate.getUTCDay();
			const isWeekend = WEEKEND_DAYS.includes(weekday);
			const baselineSeconds = isWeekend ? 0 : BASELINE_HOURS * 3600;
			const isBeforeToday = jsDate.getTime() < todayStartUtc.getTime();
			const timeOffSeconds = !isWeekend ? getTimeOffHours(iso) * 3600 : 0;

			if (isBeforeToday) {
				userNetKarmaSeconds +=
					dayTotalSeconds + timeOffSeconds - baselineSeconds;
			}
		}

		return {
			totalSeconds: userTotalSeconds,
			netKarmaSeconds: userNetKarmaSeconds,
		};
	}, [days, year, monthZeroIndexed, getTimeOffHours]);

	return { totalSeconds, netKarmaSeconds };
}
