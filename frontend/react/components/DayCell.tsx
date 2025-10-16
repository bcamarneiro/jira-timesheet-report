import type React from "react";

import type { JiraWorklog } from "../../../types/JiraWorklog";
import { useDayCalculation } from "../hooks/useDayCalculation";
import * as styles from "./DayCell.module.css";
import { DaySummary } from "./day/DaySummary";
import { TimeOffSelector } from "./day/TimeOffSelector";
import { WorklogList } from "./day/WorklogList";

type Props = {
	iso: string;
	dayNumber: number;
	jiraDomain: string;
	worklogs: JiraWorklog[];
	isWeekend: boolean;
	timeOffHours: number;
	onTimeOffChange: (hours: number) => void;
	issueSummaries: Record<string, string>;
	currentYear: number;
	currentMonth: number;
};

export const DayCell: React.FC<Props> = ({
	iso,
	dayNumber,
	jiraDomain,
	worklogs,
	isWeekend,
	timeOffHours,
	onTimeOffChange,
	issueSummaries,
	currentYear,
	currentMonth,
}) => {
	const { dayTotalSeconds, effectiveSeconds, missingSeconds } =
		useDayCalculation(worklogs, isWeekend, timeOffHours);

	// Determine CSS class based on day type and work status
	const getDayClass = () => {
		if (isWeekend) {
			return dayTotalSeconds > 0 ? styles.weekend : styles.weekendEmpty;
		} else {
			if (effectiveSeconds === 8 * 3600) return styles.weekdayComplete;
			else if (effectiveSeconds < 8 * 3600) return styles.weekdayIncomplete;
			else return styles.weekdayOvertime;
		}
	};

	return (
		<div key={iso} className={`${styles.dayCell} ${getDayClass()}`}>
			<div className={styles.header}>
				<div className={styles.dayNumber}>{String(dayNumber)}</div>
				<div className={styles.logsContainer}>
					{worklogs.length > 0 && (
						<div className={styles.logInfo}>
							{worklogs.length} {worklogs.length === 1 ? "log" : "logs"}
						</div>
					)}
					<TimeOffSelector
						value={timeOffHours}
						onChange={onTimeOffChange}
						isWeekend={isWeekend}
					/>
				</div>
			</div>
			<WorklogList
				worklogs={worklogs}
				jiraDomain={jiraDomain}
				issueSummaries={issueSummaries}
				currentYear={currentYear}
				currentMonth={currentMonth}
			/>
			<DaySummary
				dayTotalSeconds={dayTotalSeconds}
				timeOffHours={timeOffHours}
				missingSeconds={missingSeconds}
				isWeekend={isWeekend}
			/>
		</div>
	);
};
