import type React from 'react';
import { useMemo, useState } from 'react';
import type { EnrichedJiraWorklog } from '../../../types/jira';
import type { UserAbsenceDays } from '../../services/absenceService';
import { countAbsenceWorkdaysInMonth } from '../utils/absence';
import { getWorkingDaysInMonth, isDateInMonth } from '../utils/date';
import { getInitials } from '../utils/text';
import { classifyWorklog } from '../utils/worklogClassifier';
import * as styles from './OverviewTable.module.css';
import { ProgressBar } from './ui/ProgressBar';

type Props = {
	entries: [string, Record<string, EnrichedJiraWorklog[]>][];
	year: number;
	monthZeroIndexed: number;
	userEmails?: Record<string, string>;
	absenceDaysByUser?: UserAbsenceDays;
	onUserClick?: (user: string) => void;
	/**
	 * When true, users from `allUsers` that are missing from `entries` (or have
	 * zero hours in the period) are still rendered as muted rows. Defaults to
	 * false so the existing Monthly-view behaviour is preserved.
	 */
	includeZeroHourUsers?: boolean;
	/**
	 * Full population of users that should be considered when
	 * `includeZeroHourUsers` is true (e.g. the configured `allowedUsers`).
	 */
	allUsers?: string[];
};

type SortField = 'user' | 'days' | 'entries' | 'hours';
type SortDirection = 'asc' | 'desc';

export const OverviewTable: React.FC<Props> = ({
	entries,
	year,
	monthZeroIndexed,
	userEmails = {},
	absenceDaysByUser,
	onUserClick,
	includeZeroHourUsers = false,
	allUsers,
}) => {
	const [sortField, setSortField] = useState<SortField>('user');
	const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

	const baseTargetHours = getWorkingDaysInMonth(year, monthZeroIndexed) * 8;

	const rows = useMemo(() => {
		const computed = entries.map(([user, days]) => {
			let totalSeconds = 0;
			let worklogCount = 0;

			// Bucket each worklog by its classified `loggedOn` (the same
			// logged-policy rule used by TimesheetGrid and CSV exports).
			// Without this, OverviewTable disagreed with the calendar grid for
			// Pattern B (jira-native) backdated entries.
			for (const worklogs of Object.values(days)) {
				for (const wl of worklogs) {
					const c = classifyWorklog(wl);
					if (!c.loggedOn) continue;
					if (!isDateInMonth(c.loggedOn, year, monthZeroIndexed)) continue;
					totalSeconds += wl.timeSpentSeconds ?? 0;
					worklogCount++;
				}
			}

			const totalHours = totalSeconds / 3600;
			const absenceHours =
				countAbsenceWorkdaysInMonth(
					absenceDaysByUser?.get(userEmails[user] ?? '')?.keys(),
					year,
					monthZeroIndexed,
				) * 8;
			const targetHours = Math.max(0, baseTargetHours - absenceHours);
			return {
				user,
				totalHours,
				worklogCount,
				daysWorked: totalHours / 8,
				targetHours,
				pct: targetHours > 0 ? (totalHours / targetHours) * 100 : 0,
			};
		});

		if (includeZeroHourUsers && allUsers) {
			const present = new Set(computed.map((row) => row.user));
			for (const user of allUsers) {
				if (!present.has(user)) {
					computed.push({
						user,
						totalHours: 0,
						worklogCount: 0,
						daysWorked: 0,
						targetHours: baseTargetHours,
						pct: 0,
					});
				}
			}
		}

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
	}, [
		entries,
		year,
		monthZeroIndexed,
		sortField,
		sortDirection,
		baseTargetHours,
		absenceDaysByUser,
		userEmails,
		includeZeroHourUsers,
		allUsers,
	]);

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
						<th className={`${styles.userCell} ${styles.sortableHeader}`}>
							<button
								type="button"
								className={styles.sortButton}
								onClick={() => handleSort('user')}
							>
								User {sortArrow('user')}
							</button>
						</th>
						<th className={styles.progressCell}>Progress</th>
						<th className={`${styles.hoursCell} ${styles.sortableHeader}`}>
							<button
								type="button"
								className={styles.sortButton}
								onClick={() => handleSort('days')}
							>
								Days {sortArrow('days')}
							</button>
						</th>
						<th className={`${styles.hoursCell} ${styles.sortableHeader}`}>
							<button
								type="button"
								className={styles.sortButton}
								onClick={() => handleSort('entries')}
							>
								Entries {sortArrow('entries')}
							</button>
						</th>
						<th className={`${styles.hoursCell} ${styles.sortableHeader}`}>
							<button
								type="button"
								className={styles.sortButton}
								onClick={() => handleSort('hours')}
							>
								Hours {sortArrow('hours')}
							</button>
						</th>
					</tr>
				</thead>
				<tbody>
					{rows.map((row) => (
						<tr
							key={row.user}
							className={
								[
									onUserClick ? styles.clickableRow : '',
									row.totalHours === 0 ? styles.zeroHourRow : '',
								]
									.filter(Boolean)
									.join(' ') || undefined
							}
							onClick={() => onUserClick?.(row.user)}
							onKeyDown={(event) => {
								if (
									onUserClick &&
									(event.key === 'Enter' || event.key === ' ')
								) {
									event.preventDefault();
									onUserClick(row.user);
								}
							}}
							tabIndex={onUserClick ? 0 : undefined}
						>
							<td>
								<div className={styles.userInfo}>
									<span className={styles.avatar}>{getInitials(row.user)}</span>
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
