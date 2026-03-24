import type React from 'react';
import { useState } from 'react';
import type { EnrichedJiraWorklog } from '../../../types/jira';
import { useTimesheetStore } from '../../stores/useTimesheetStore';
import { useCalendar } from '../hooks/useCalendar';
import { useMonthTotalCalculation } from '../hooks/useMonthTotalCalculation';
import { getWorkingDaysInMonth, isoDateFromYMD } from '../utils/date';
import { CalendarGrid } from './calendar/CalendarGrid';
import { DayCell } from './DayCell';
import * as styles from './TimesheetGrid.module.css';
import { ProgressBar } from './ui/ProgressBar';
import { UserHeader } from './user/UserHeader';

type Props = {
	user: string;
	days: Record<string, EnrichedJiraWorklog[]>;
	issueSummaries: Record<string, string>;
	onDownloadUser: (user: string) => void;
	defaultCollapsed?: boolean;
};

export const TimesheetGrid: React.FC<Props> = ({
	user,
	days,
	issueSummaries,
	onDownloadUser,
	defaultCollapsed = false,
}) => {
	const [collapsed, setCollapsed] = useState(defaultCollapsed);
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

	const targetSeconds =
		getWorkingDaysInMonth(year, monthZeroIndexed) * 8 * 3600;
	const totalHours = totalSeconds / 3600;
	const targetHours = targetSeconds / 3600;
	const pct = targetSeconds > 0 ? (totalSeconds / targetSeconds) * 100 : 0;

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
				issueSummaries={issueSummaries}
				isWeekend={isWeekend}
				isToday={iso === todayIso}
			/>,
		);
	}

	return (
		<div key={user} className={styles.card}>
			<UserHeader
				user={user}
				totalSeconds={totalSeconds}
				targetSeconds={targetSeconds}
				onDownloadUser={onDownloadUser}
				collapsed={collapsed}
				onToggleCollapse={() => setCollapsed((c) => !c)}
			/>

			{!collapsed && (
				<>
					<CalendarGrid
						firstWeekday={firstWeekday}
						weekdayLabels={weekdayLabels}
					>
						{cells}
					</CalendarGrid>

					<div className={styles.monthTotal}>
						<div className={styles.monthTotalTop}>
							<span className={styles.monthTotalLabel}>Month Total</span>
							<span className={styles.monthTotalValue}>
								{totalHours.toFixed(1)}h / {targetHours}h ({Math.round(pct)}%)
							</span>
						</div>
						<ProgressBar value={pct} height={6} />
					</div>
				</>
			)}
		</div>
	);
};
