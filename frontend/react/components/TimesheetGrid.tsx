import type React from 'react';
import type { JiraWorklog } from '../../../types/JiraWorklog';
import { useTimesheetStore } from '../../stores/useTimesheetStore';
import { useCalendar } from '../hooks/useCalendar';
import { useMonthTotalCalculation } from '../hooks/useMonthTotalCalculation';
import { isoDateFromYMD } from '../utils/date';
import { CalendarGrid } from './calendar/CalendarGrid';
import { DayCell } from './DayCell';
import * as styles from './TimesheetGrid.module.css';
import { UserHeader } from './user/UserHeader';

type Props = {
	user: string;
	days: Record<string, JiraWorklog[]>;
	onDownloadUser: (user: string) => void;
};

export const TimesheetGrid: React.FC<Props> = ({
	user,
	days,
	onDownloadUser,
}) => {
	const year = useTimesheetStore((state) => state.currentYear);
	const monthZeroIndexed = useTimesheetStore((state) => state.currentMonth);

	const { firstWeekday, numDays, weekdayLabels } = useCalendar(
		year,
		monthZeroIndexed,
	);

	const { totalSeconds } = useMonthTotalCalculation(
		days,
		year,
		monthZeroIndexed,
	);

	const now = new Date();
	const todayIso =
		now.getFullYear() === year && now.getMonth() === monthZeroIndexed
			? isoDateFromYMD(year, monthZeroIndexed, now.getDate())
			: null;

	const cells: React.ReactNode[] = [];

	for (let d = 1; d <= numDays; d++) {
		const iso = isoDateFromYMD(year, monthZeroIndexed, d);
		const worklogs = days[iso] || [];
		const jsDate = new Date(Date.UTC(year, monthZeroIndexed, d));
		const weekday = jsDate.getUTCDay();
		const isWeekend = weekday === 0 || weekday === 6;

		cells.push(
			<DayCell
				key={iso}
				iso={iso}
				dayNumber={d}
				worklogs={worklogs}
				isWeekend={isWeekend}
				isToday={iso === todayIso}
			/>,
		);
	}

	return (
		<div key={user} className={styles.container}>
			<UserHeader
				user={user}
				totalSeconds={totalSeconds}
				onDownloadUser={onDownloadUser}
			/>

			<CalendarGrid firstWeekday={firstWeekday} weekdayLabels={weekdayLabels}>
				{cells}
			</CalendarGrid>

			<div className={styles.monthTotal}>
				<span className={styles.monthTotalLabel}>Month Total</span>
				<span className={styles.monthTotalValue}>
					{(totalSeconds / 3600).toFixed(2)} h
				</span>
			</div>
		</div>
	);
};
