import { useMemo } from "react";
import { WEEKDAY_LABELS } from "../constants/timesheet";
import { getDaysInMonth, getMonthStartWeekday } from "../utils/date";

export function useCalendar(year: number, monthZeroIndexed: number) {
	const firstWeekday = useMemo(
		() => getMonthStartWeekday(year, monthZeroIndexed),
		[year, monthZeroIndexed],
	);
	const numDays = useMemo(
		() => getDaysInMonth(year, monthZeroIndexed),
		[year, monthZeroIndexed],
	);
	const weekdayLabels = useMemo(() => WEEKDAY_LABELS, []);

	return { firstWeekday, numDays, weekdayLabels };
}
