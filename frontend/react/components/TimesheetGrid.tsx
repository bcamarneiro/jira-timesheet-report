import type React from 'react';
import type { JiraWorklog } from '../../../types/JiraWorklog';
import { useTimeOffStore } from '../../stores/useTimeOffStore';
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
	// Read from stores
	const year = useTimesheetStore((state) => state.currentYear);
	const monthZeroIndexed = useTimesheetStore((state) => state.currentMonth);
	const getTimeOffHours = useTimeOffStore((state) => state.getTimeOffHours);
	const setTimeOffHoursStore = useTimeOffStore(
		(state) => state.setTimeOffHours,
	);

	const { firstWeekday, numDays, weekdayLabels } = useCalendar(
		year,
		monthZeroIndexed,
	);

	const setTimeOffHours = (iso: string, hours: number) => {
		setTimeOffHoursStore(user, iso, hours);
	};

	const getTimeOffHoursForUser = (iso: string) => {
		return getTimeOffHours(user, iso);
	};

	const { totalSeconds } = useMonthTotalCalculation(
		days,
		year,
		monthZeroIndexed,
	);

	const cells: React.ReactNode[] = [];

	for (let d = 1; d <= numDays; d++) {
		const iso = isoDateFromYMD(year, monthZeroIndexed, d);
		const worklogs = days[iso] || [];
		const jsDate = new Date(Date.UTC(year, monthZeroIndexed, d));
		const weekday = jsDate.getUTCDay(); // 0=Sun,6=Sat
		const isWeekend = weekday === 0 || weekday === 6;

		cells.push(
			<DayCell
				key={iso}
				iso={iso}
				dayNumber={d}
				user={user}
				worklogs={worklogs}
				isWeekend={isWeekend}
				timeOffHours={!isWeekend ? getTimeOffHoursForUser(iso) : 0}
				onTimeOffChange={(hours) => setTimeOffHours(iso, hours)}
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
