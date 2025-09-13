import type React from "react";
import type { JiraWorklog } from "../../../types/JiraWorklog";
import { isoDateFromYMD } from "../utils/date";
import { useTimeOff } from "../hooks/useTimeOff";
import { useCalendar } from "../hooks/useCalendar";
import { useKarmaCalculation } from "../hooks/useKarmaCalculation";
import { DayCell } from "./DayCell";
import { UserHeader } from "./user/UserHeader";
import { CalendarGrid } from "./calendar/CalendarGrid";
import { EmptyState } from "./calendar/EmptyState";

type Props = {
	user: string;
	days: Record<string, JiraWorklog[]>;
	year: number;
	monthZeroIndexed: number;
	jiraDomain: string;
	issueSummaries: Record<string, string>;
	onDownloadUser: (user: string) => void;
};

export const TimesheetGrid: React.FC<Props> = ({
	user,
	days,
	year,
	monthZeroIndexed,
	jiraDomain,
	issueSummaries,
	onDownloadUser,
}) => {
	const { firstWeekday, numDays, weekdayLabels } = useCalendar(
		year,
		monthZeroIndexed,
	);
	const { getTimeOffHours, setTimeOffHours } = useTimeOff(user);
	const { totalSeconds, netKarmaSeconds } = useKarmaCalculation(
		days,
		year,
		monthZeroIndexed,
		getTimeOffHours,
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
				jiraDomain={jiraDomain}
				worklogs={worklogs}
				isWeekend={isWeekend}
				timeOffHours={!isWeekend ? getTimeOffHours(iso) : 0}
				onTimeOffChange={(hours) => setTimeOffHours(iso, hours)}
				issueSummaries={issueSummaries}
				currentYear={year}
				currentMonth={monthZeroIndexed}
			/>,
		);
	}

	return (
		<div key={user}>
			<UserHeader
				user={user}
				totalSeconds={totalSeconds}
				netKarmaSeconds={netKarmaSeconds}
				onDownloadUser={onDownloadUser}
			/>
			<CalendarGrid firstWeekday={firstWeekday} weekdayLabels={weekdayLabels}>
				{cells}
			</CalendarGrid>
			<EmptyState hasData={totalSeconds > 0} />
			<div style={{ fontWeight: "bold", marginTop: "0.5em" }}>
				Month total: {(totalSeconds / 3600).toFixed(2)} h
			</div>
		</div>
	);
};
