import type React from 'react';
import { useMemo } from 'react';
import type {
	EnrichedJiraWorklog,
	GroupedWorklogs,
} from '../../stores/useTimesheetStore';
import { isDateInMonth } from '../utils/date';
import * as styles from './OverviewTable.module.css';

type Props = {
	entries: [string, Record<string, EnrichedJiraWorklog[]>][];
	year: number;
	monthZeroIndexed: number;
};

export const OverviewTable: React.FC<Props> = ({
	entries,
	year,
	monthZeroIndexed,
}) => {
	const rows = useMemo(() => {
		return entries.map(([user, days]) => {
			let totalSeconds = 0;
			let worklogCount = 0;

			for (const [dateKey, worklogs] of Object.entries(days)) {
				if (!isDateInMonth(dateKey, year, monthZeroIndexed)) continue;
				for (const wl of worklogs) {
					totalSeconds += wl.timeSpentSeconds ?? 0;
					worklogCount++;
				}
			}

			const totalHours = totalSeconds / 3600;
			return {
				user,
				totalHours,
				worklogCount,
				daysWorked: totalHours / 8,
			};
		});
	}, [entries, year, monthZeroIndexed]);

	const grandTotalHours = rows.reduce((sum, r) => sum + r.totalHours, 0);
	const grandTotalWorklogs = rows.reduce((sum, r) => sum + r.worklogCount, 0);
	const grandTotalDays = grandTotalHours / 8;

	return (
		<div className={styles.container}>
			<h2 className={styles.heading}>Overview</h2>
			<table className={styles.table}>
				<thead>
					<tr>
						<th className={styles.userCell}>User</th>
						<th className={styles.hoursCell}>Days Worked</th>
						<th className={styles.hoursCell}>Entries</th>
						<th className={styles.hoursCell}>Total Hours</th>
					</tr>
				</thead>
				<tbody>
					{rows.map((row) => (
						<tr key={row.user}>
							<td>{row.user}</td>
							<td className={styles.hoursCell}>{row.daysWorked.toFixed(1)}</td>
							<td className={styles.hoursCell}>{row.worklogCount}</td>
							<td className={styles.hoursCell}>{row.totalHours.toFixed(2)}h</td>
						</tr>
					))}
					{rows.length > 1 && (
						<tr className={styles.totalRow}>
							<td>Total ({rows.length} users)</td>
							<td className={styles.hoursCell}>{grandTotalDays.toFixed(1)}</td>
							<td className={styles.hoursCell}>{grandTotalWorklogs}</td>
							<td className={styles.hoursCell}>
								{grandTotalHours.toFixed(2)}h
							</td>
						</tr>
					)}
				</tbody>
			</table>
		</div>
	);
};
