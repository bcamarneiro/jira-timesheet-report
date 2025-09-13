import { useMemo } from 'react';
import { getMonthStartWeekday, getDaysInMonth } from '../utils/date';
import { WEEKDAY_LABELS } from '../constants/timesheet';

export function useCalendar(year: number, monthZeroIndexed: number) {
  const firstWeekday = useMemo(() => getMonthStartWeekday(year, monthZeroIndexed), [year, monthZeroIndexed]);
  const numDays = useMemo(() => getDaysInMonth(year, monthZeroIndexed), [year, monthZeroIndexed]);
  const weekdayLabels = useMemo(() => WEEKDAY_LABELS, []);

  return { firstWeekday, numDays, weekdayLabels };
}
