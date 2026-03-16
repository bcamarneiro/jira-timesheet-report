import type React from 'react';
import { useMemo, useState } from 'react';
import type { EnrichedJiraWorklog } from '../../stores/useTimesheetStore';
import { getWorkingDaysInMonth, isDateInMonth } from '../utils/date';
import { getInitials } from '../utils/text';
import { ProgressBar } from './ui/ProgressBar';
import * as styles from './OverviewTable.module.css';

type Props = {
	entries: [string, Record<string, EnrichedJiraWorklog[]>][];
	year: number;
	monthZeroIndexed: number;
	onUserClick?: (user: string) => void;
};

type SortField = 'user' | 'days' | 'entries' | 'hours';
type SortDirection = 'asc' | 'desc';

export const OverviewTable: React.FC<Props> = ({
	entries,
	year,
	monthZeroIndexed,
	onUserClick,
}) => {
	const [sortField, setSortField] = useState<SortField>('user');
	const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

	const targetHours = getWorkingDaysInMonth(year, monthZeroIndexed) * 8;

	const rows = useMemo(() => {
		const computed = entries.map(([user, days]) => {
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
				pct: targetHours > 0 ? (totalHours / targetHours) * 100 : 0,
			};
		});

		computed.sort((a, b) => {
			let cmp: number;
			switch (sortField) {
				case 'days':
					cmp = a.daysWorked - b.daysWorked;
					break;
				case 'entries':
					cmp = a.worklogCount - b.worklogCount;
					break;
				case 'hours':
					cmp = a.totalHours - b.totalHours;
					break;
				default:
					cmp = a.user.localeCompare(b.user);
			}
			return sortDirection === 'desc' ? -cmp : cmp;
		});

		return computed;
	}, [entries, year, monthZeroIndexed, sortField, sortDirection, targetHours]);

	const grandTotalHours = rows.reduce((sum, r) => sum + r.totalHours, 0);
	const grandTotalWorklogs = rows.reduce((sum, r) => sum + r.worklogCount, 0);
	const grandTotalDays = grandTotalHours / 8;

	const handleSort = (field: SortField) => {
		if (sortField === field) {
			setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
		} else {
			setSortField(field);
			setSortDirection('asc');
		}
	};

	const sortArrow = (field: SortField) => {
		if (sortField !== field) return null;
		return (
			<span className={styles.sortIndicator}>
				{sortDirection === 'asc' ? '\u25B2' : '\u25BC'}
			</span>
		);
	};

	return (
		<div className={styles.container}>
			<table className={styles.table}>
				<thead>
					<tr>
						<th
							className={`${styles.userCell} ${styles.sortableHeader}`}
							onClick={() => handleSort('user')}
						>
							User {sortArrow('user')}
						</th>
						<th className={styles.progressCell}>Progress</th>
						<th
							className={`${styles.hoursCell} ${styles.sortableHeader}`}
							onClick={() => handleSort('days')}
						>
							Days {sortArrow('days')}
						</th>
						<th
							className={`${styles.hoursCell} ${styles.sortableHeader}`}
							onClick={() => handleSort('entries')}
						>
							Entries {sortArrow('entries')}
						</th>
						<th
							className={`${styles.hoursCell} ${styles.sortableHeader}`}
							onClick={() => handleSort('hours')}
						>
							Hours {sortArrow('hours')}
						</th>
					</tr>
				</thead>
				<tbody>
					{rows.map((row) => (
						<tr
							key={row.user}
							className={onUserClick ? styles.clickableRow : undefined}
							onClick={() => onUserClick?.(row.user)}
						>
							<td>
								<div className={styles.userInfo}>
									<span className={styles.avatar}>
										{getInitials(row.user)}
									</span>
									<span className={styles.userName}>{row.user}</span>
								</div>
							</td>
							<td className={styles.progressCell}>
								<div className={styles.progressWrapper}>
									<ProgressBar value={row.pct} height={6} />
									<span className={styles.progressPct}>
										{Math.round(row.pct)}%
									</span>
								</div>
							</td>
							<td className={styles.hoursCell}>{row.daysWorked.toFixed(1)}</td>
							<td className={styles.hoursCell}>{row.worklogCount}</td>
							<td className={styles.hoursCell}>{row.totalHours.toFixed(1)}h</td>
						</tr>
					))}
					{rows.length > 1 && (
						<tr className={styles.totalRow}>
							<td>Total ({rows.length})</td>
							<td />
							<td className={styles.hoursCell}>{grandTotalDays.toFixed(1)}</td>
							<td className={styles.hoursCell}>{grandTotalWorklogs}</td>
							<td className={styles.hoursCell}>
								{grandTotalHours.toFixed(1)}h
							</td>
						</tr>
					)}
				</tbody>
			</table>
		</div>
	);
};
