import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { TeamMemberSummary } from '../../services/teamService';
import { useConfigStore } from '../../stores/useConfigStore';
import { useTeamStore } from '../../stores/useTeamStore';
import { useTimesheetStore } from '../../stores/useTimesheetStore';
import { WeekNavigator } from '../components/dashboard/WeekNavigator';
import { MonthNavigator } from '../components/MonthNavigator';
import { OverviewTable } from '../components/OverviewTable';
import { TimesheetGrid } from '../components/TimesheetGrid';
import { TeamStatsCards } from '../components/team/TeamStatsCards';
import { TimesheetStatsCards } from '../components/timesheet/TimesheetStatsCards';
import { UserSelector } from '../components/UserSelector';
import { Button } from '../components/ui/Button';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Spinner } from '../components/ui/Spinner';
import { useDownload } from '../hooks/useDownload';
import { useTeamData } from '../hooks/useTeamData';
import { useTimesheetDataFetcher } from '../hooks/useTimesheetDataFetcher';
import { useTimesheetURLSync } from '../hooks/useTimesheetURLSync';
import { addDaysToIsoDate, monthLabel, parseIsoDateLocal } from '../utils/date';
import { downloadAsFile } from '../utils/downloadFile';
import { formatHours } from '../utils/format';
import { deriveMonthlyReportState } from '../utils/monthlyReport';
import { buildTeamCsv } from '../utils/teamCsvExport';
import * as styles from './TimesheetPage.module.css';
import type { EnrichedJiraWorklog } from '../../../types/jira';

// --- Weekly compliance table helpers ---

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const hoursCellStyleMap = {
	green: styles.hoursCellGreen,
	yellow: styles.hoursCellYellow,
	red: styles.hoursCellRed,
	neutral: styles.hoursCell,
} as const;

function getHoursCellStyle(hours: number): string {
	if (hours >= 8) return hoursCellStyleMap.green;
	if (hours >= 4) return hoursCellStyleMap.yellow;
	if (hours > 0) return hoursCellStyleMap.red;
	return hoursCellStyleMap.neutral;
}

const gapCellStyleMap = {
	positive: styles.gapPositive,
	zero: styles.gapZero,
} as const;

function getGapCellStyle(gapSeconds: number): string {
	return gapSeconds > 0 ? gapCellStyleMap.positive : gapCellStyleMap.zero;
}

function getWeekdays(weekStart: string): string[] {
	return Array.from({ length: 5 }, (_, index) => addDaysToIsoDate(weekStart, index));
}

function formatDayHeader(dateStr: string, index: number): string {
	const d = parseIsoDateLocal(dateStr);
	return `${DAY_LABELS[index]} ${d.getDate()}`;
}

function formatHoursDecimal(hours: number): string {
	return Number.isInteger(hours)
		? `${hours.toFixed(0)}h`
		: `${hours.toFixed(1)}h`;
}

function sumMonthlyHours(
	entries: [string, Record<string, EnrichedJiraWorklog[]>][],
	year: number,
	monthZeroIndexed: number,
): number {
	const monthPrefix = `${year}-${String(monthZeroIndexed + 1).padStart(2, '0')}`;
	let totalSeconds = 0;

	for (const [, days] of entries) {
		for (const [dateKey, worklogs] of Object.entries(days)) {
			if (!dateKey.startsWith(monthPrefix)) continue;
			for (const worklog of worklogs) {
				totalSeconds += worklog.timeSpentSeconds ?? 0;
			}
		}
	}

	return totalSeconds;
}

type SortField = 'name' | 'total' | 'gap';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'monthly' | 'weekly';

function TeamMemberRow({
	member,
	weekdays,
	onMemberClick,
}: {
	member: TeamMemberSummary;
	weekdays: string[];
	onMemberClick: (name: string) => void;
}) {
	const pct = (member.totalSeconds / member.targetSeconds) * 100;

	return (
		<tr>
			<td>
				<button
					type="button"
					className={styles.memberNameButton}
					onClick={() => onMemberClick(member.displayName)}
				>
					{member.displayName}
				</button>
				<div className={styles.memberEmail}>{member.email}</div>
				<div className={styles.rowProgress}>
					<ProgressBar value={pct} height={4} />
				</div>
			</td>
			{weekdays.map((day) => {
				const hours = member.dailyHours.get(day) || 0;
				return (
					<td key={day} className={getHoursCellStyle(hours)}>
						{hours > 0 ? formatHoursDecimal(hours) : '-'}
					</td>
				);
			})}
			<td className={styles.totalCell}>{formatHours(member.totalSeconds)}</td>
			<td className={getGapCellStyle(member.gapSeconds)}>
				{member.gapSeconds > 0 ? formatHours(member.gapSeconds) : 'OK'}
			</td>
		</tr>
	);
}

function SummaryRow({
	members,
	weekdays,
}: {
	members: TeamMemberSummary[];
	weekdays: string[];
}) {
	if (members.length === 0) return null;

	const count = members.length;

	return (
		<tr className={styles.summaryRow}>
			<td>
				<span className={styles.summaryLabel}>Team Average</span>
				<span className={styles.memberCount}> ({count} members)</span>
			</td>
			{weekdays.map((day) => {
				const avg =
					members.reduce((sum, m) => sum + (m.dailyHours.get(day) || 0), 0) /
					count;
				return (
					<td key={day} className={getHoursCellStyle(avg)}>
						{avg > 0 ? formatHoursDecimal(avg) : '-'}
					</td>
				);
			})}
			<td className={styles.totalCell}>
				{formatHours(
					Math.round(
						members.reduce((sum, m) => sum + m.totalSeconds, 0) / count,
					),
				)}
			</td>
			<td className={styles.gapCell}>
				{formatHours(
					Math.round(members.reduce((sum, m) => sum + m.gapSeconds, 0) / count),
				)}
			</td>
		</tr>
	);
}

function SortIndicator({
	field,
	activeField,
	direction,
}: {
	field: SortField;
	activeField: SortField;
	direction: SortDirection;
}) {
	if (field !== activeField) return null;
	return (
		<span className={styles.sortIndicator}>
			{direction === 'asc' ? '\u25B2' : '\u25BC'}
		</span>
	);
}

// --- Main component ---

export const TimesheetPage: React.FC = () => {
	const [viewMode, setViewMode] = useState<ViewMode>('weekly');
	const [sortField, setSortField] = useState<SortField>('name');
	const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

	// Only fetch data for the active view
	const { isLoading, errorMessage } = useTimesheetDataFetcher({
		enabled: viewMode === 'monthly',
	});

	const { handleSetSelectedUser } = useTimesheetURLSync();

	// Monthly view state
	const currentYear = useTimesheetStore((state) => state.currentYear);
	const currentMonth = useTimesheetStore((state) => state.currentMonth);
	const selectedUser = useTimesheetStore((state) => state.selectedUser);
	const data = useTimesheetStore((state) => state.data);
	const goPrevMonth = useTimesheetStore((state) => state.goPrevMonth);
	const goNextMonth = useTimesheetStore((state) => state.goNextMonth);
	const allowedUsers = useConfigStore((state) => state.config.allowedUsers);

	// Weekly view state
	const weekStart = useTeamStore((s) => s.weekStart);
	const weekEnd = useTeamStore((s) => s.weekEnd);
	const goToPrevWeek = useTeamStore((s) => s.goToPrevWeek);
	const goToNextWeek = useTeamStore((s) => s.goToNextWeek);
	const goToCurrentWeek = useTeamStore((s) => s.goToCurrentWeek);

	const {
		data: teamMembers,
		isLoading: teamLoading,
		error: teamError,
	} = useTeamData(weekStart, weekEnd, { enabled: viewMode === 'weekly' });

	const jiraDomain = useConfigStore((state) => state.config.jiraHost);

	const { downloadUser, downloadAll } = useDownload();
	const { issueSummaries, users, grouped, visibleEntries } = useMemo(
		() => deriveMonthlyReportState(data, selectedUser, allowedUsers),
		[data, selectedUser, allowedUsers],
	);

	const weekdays = getWeekdays(weekStart);

	const sortedMembers = useMemo(() => {
		const sorted = [...teamMembers];
		sorted.sort((a, b) => {
			let cmp: number;
			switch (sortField) {
				case 'total':
					cmp = a.totalSeconds - b.totalSeconds;
					break;
				case 'gap':
					cmp = a.gapSeconds - b.gapSeconds;
					break;
				default:
					cmp = a.displayName.localeCompare(b.displayName);
			}
			return sortDirection === 'desc' ? -cmp : cmp;
		});
		return sorted;
	}, [teamMembers, sortField, sortDirection]);

	const handleSort = (field: SortField) => {
		if (sortField === field) {
			setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
		} else {
			setSortField(field);
			setSortDirection('asc');
		}
	};

	const handleUserChange = (value: string) => {
		handleSetSelectedUser(value);
	};

	const handleMemberClick = (name: string) => {
		handleSetSelectedUser(name);
		setViewMode('monthly');
	};

	const handleDownloadUser = (user: string) => {
		downloadUser(user, grouped, issueSummaries, currentYear, currentMonth);
	};

	const handleDownloadAll = () => {
		downloadAll(
			visibleEntries.map(([user]) => user),
			grouped,
			issueSummaries,
			currentYear,
			currentMonth,
		);
	};

	const handleExportTeamCsv = () => {
		const csv = buildTeamCsv(sortedMembers, weekdays);
		const filename = `team-report-${weekStart}.csv`;
		downloadAsFile(csv, filename, 'text/csv;charset=utf-8');
	};

	// Keyboard shortcuts for month navigation (only in monthly view)
	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			const tag = (e.target as HTMLElement)?.tagName;
			if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

			if (viewMode === 'monthly') {
				if (e.key === 'ArrowLeft') {
					e.preventDefault();
					goPrevMonth();
				} else if (e.key === 'ArrowRight') {
					e.preventDefault();
					goNextMonth();
				}
			} else {
				if (e.key === 'ArrowLeft') {
					e.preventDefault();
					goToPrevWeek();
				} else if (e.key === 'ArrowRight') {
					e.preventDefault();
					goToNextWeek();
				}
			}
		},
		[viewMode, goPrevMonth, goNextMonth, goToPrevWeek, goToNextWeek],
	);

	useEffect(() => {
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [handleKeyDown]);

	const isValidUser = selectedUser !== '' && users.includes(selectedUser);
	const selectedEntry = visibleEntries.find(([user]) => user === selectedUser);
	const hasNoData = !isLoading && data && visibleEntries.length === 0;
	const monthlySummary = useMemo(() => {
		if (!data || viewMode !== 'monthly') return null;
		return {
			userCount: visibleEntries.length,
			totalSeconds: sumMonthlyHours(visibleEntries, currentYear, currentMonth),
		};
	}, [data, viewMode, visibleEntries, currentYear, currentMonth]);
	const weeklySummary = useMemo(() => {
		if (viewMode !== 'weekly' || teamMembers.length === 0) return null;
		return {
			totalSeconds: teamMembers.reduce(
				(sum, member) => sum + member.totalSeconds,
				0,
			),
			totalGapSeconds: teamMembers.reduce(
				(sum, member) => sum + member.gapSeconds,
				0,
			),
		};
	}, [viewMode, teamMembers]);

	if (errorMessage && viewMode === 'monthly') {
		return (
			<div className={styles.container}>
				<div className={styles.error}>
					<h2>Unable to load timesheets</h2>
					<p>{errorMessage}</p>
					{errorMessage.includes('configured') ? (
						<Link to="/settings">Go to Settings</Link>
					) : errorMessage.includes('401') || errorMessage.includes('403') ? (
						<Link to="/settings">Check your credentials in Settings</Link>
					) : (
						<p>
							Try refreshing the page or check your{' '}
							<Link to="/settings">connection settings</Link>.
						</p>
					)}
				</div>
			</div>
		);
	}

	return (
		<div className={styles.container}>
			<div className={styles.toolbar}>
				{/* View toggle */}
				<div className={styles.viewToggle}>
					<button
						type="button"
						aria-pressed={viewMode === 'weekly'}
						className={
							viewMode === 'weekly'
								? styles.viewToggleButtonActive
								: styles.viewToggleButton
						}
						onClick={() => setViewMode('weekly')}
					>
						Weekly
					</button>
					<button
						type="button"
						aria-pressed={viewMode === 'monthly'}
						className={
							viewMode === 'monthly'
								? styles.viewToggleButtonActive
								: styles.viewToggleButton
						}
						onClick={() => setViewMode('monthly')}
					>
						Monthly
					</button>
				</div>

				{/* Navigation */}
				{viewMode === 'monthly' ? (
					<>
						<UserSelector
							users={users}
							value={selectedUser}
							onChange={handleUserChange}
						/>
						<MonthNavigator
							label={monthLabel(currentYear, currentMonth)}
							onPrev={goPrevMonth}
							onNext={goNextMonth}
						/>
					</>
				) : (
					<WeekNavigator
						weekStart={weekStart}
						weekEnd={weekEnd}
						onPrev={goToPrevWeek}
						onNext={goToNextWeek}
						onToday={goToCurrentWeek}
					/>
				)}

				<div className={styles.toolbarRight}>
					{jiraDomain && <span className={styles.context}>{jiraDomain}</span>}
					{viewMode === 'monthly' && visibleEntries.length > 0 && (
						<Button variant="secondary" onClick={handleDownloadAll}>
							Export All
						</Button>
					)}
					{viewMode === 'weekly' && teamMembers.length > 0 && (
						<Button variant="secondary" onClick={handleExportTeamCsv}>
							Export CSV
						</Button>
					)}
				</div>
			</div>

			{/* ---- WEEKLY VIEW ---- */}
			{viewMode === 'weekly' && (
				<>
					{weeklySummary && (
						<div className={styles.reportSummary}>
							<strong>Weekly Snapshot</strong>
							<span>{formatHours(weeklySummary.totalSeconds)} logged across the team</span>
							<span>
								{weeklySummary.totalGapSeconds > 0
									? `${formatHours(weeklySummary.totalGapSeconds)} remaining gap`
									: 'No team gap remaining'}
							</span>
						</div>
					)}
					{teamError && (
						<div className={styles.error}>
							<h2>Unable to load team data</h2>
							<p>{teamError.message}</p>
							<Link to="/settings">Check your settings</Link>
						</div>
					)}

					{teamLoading && teamMembers.length === 0 && (
						<div className={styles.loading}>
							<Spinner size="lg" />
							<p>Loading team worklogs...</p>
						</div>
					)}

					{!teamLoading && !teamError && teamMembers.length === 0 && (
						<div className={styles.emptyState}>
							<div className={styles.emptyIcon}>&#128203;</div>
							<div className={styles.emptyTitle}>No team data found</div>
							<div className={styles.emptyDescription}>
								No worklogs were found for this week. Make sure team members
								have logged time, or configure allowed users in settings.
							</div>
						</div>
					)}

					{teamMembers.length > 0 && (
						<>
							{teamLoading && (
								<div className={styles.refetching}>
									<Spinner size="sm" />
									<span>Updating...</span>
								</div>
							)}
							<TeamStatsCards teamMembers={teamMembers} />

							<div className={styles.tableWrapper}>
								<table className={styles.table}>
									<thead>
										<tr>
											<th className={styles.sortableHeader}>
												<button
													type="button"
													className={styles.sortButton}
													onClick={() => handleSort('name')}
												>
													Team Member
													<SortIndicator
														field="name"
														activeField={sortField}
														direction={sortDirection}
													/>
												</button>
											</th>
											{weekdays.map((day, i) => (
												<th key={day} className={styles.dayHeader}>
													{formatDayHeader(day, i)}
												</th>
											))}
											<th className={`${styles.dayHeader} ${styles.sortableHeader}`}>
												<button
													type="button"
													className={styles.sortButton}
													onClick={() => handleSort('total')}
												>
													Total
													<SortIndicator
														field="total"
														activeField={sortField}
														direction={sortDirection}
													/>
												</button>
											</th>
											<th className={`${styles.dayHeader} ${styles.sortableHeader}`}>
												<button
													type="button"
													className={styles.sortButton}
													onClick={() => handleSort('gap')}
												>
													Gap
													<SortIndicator
														field="gap"
														activeField={sortField}
														direction={sortDirection}
													/>
												</button>
											</th>
										</tr>
									</thead>
									<tbody>
										{sortedMembers.map((member) => (
											<TeamMemberRow
												key={member.email}
												member={member}
												weekdays={weekdays}
												onMemberClick={handleMemberClick}
											/>
										))}
										<SummaryRow members={teamMembers} weekdays={weekdays} />
									</tbody>
								</table>
							</div>

							{teamMembers.some((m) => m.targetSeconds > 0) &&
								teamMembers.every((m) => m.gapSeconds === 0) && (
									<div className={styles.allCompliant}>
										<div className={styles.allCompliantIcon}>&#10003;</div>
										<div className={styles.allCompliantTitle}>
											Full team compliance!
										</div>
										<div className={styles.allCompliantText}>
											Every team member has logged 40+ hours this week.
										</div>
									</div>
								)}
						</>
					)}
				</>
			)}

			{/* ---- MONTHLY VIEW ---- */}
			{viewMode === 'monthly' && (
				<>
					{monthlySummary && !hasNoData && (
						<div className={styles.reportSummary}>
							<strong>Monthly Snapshot</strong>
							<span>
								{formatHours(monthlySummary.totalSeconds)} logged in{' '}
								{monthLabel(currentYear, currentMonth)}
							</span>
							<span>
								{isValidUser
									? `Filtered to ${selectedUser}`
									: `${monthlySummary.userCount} user${monthlySummary.userCount === 1 ? '' : 's'} in view`}
							</span>
						</div>
					)}
					{isLoading && !data && (
						<div className={styles.loading}>
							<Spinner size="lg" />
							<p>Loading worklogs...</p>
						</div>
					)}

					{isLoading && data && (
						<div className={styles.refetching}>
							<Spinner size="sm" />
							<span>Updating...</span>
						</div>
					)}

					{hasNoData && (
						<div className={styles.emptyState}>
							<div className={styles.emptyIcon}>&#128203;</div>
							<div className={styles.emptyTitle}>No worklogs found</div>
							<div className={styles.emptyDescription}>
								No worklogs were recorded for{' '}
								{monthLabel(currentYear, currentMonth)}. Try a different month
								or adjust your filters.
							</div>
						</div>
					)}

					{data &&
						!hasNoData &&
						(isValidUser ? (
							<ErrorBoundary fallbackMessage="Failed to render this user's timesheet.">
								{selectedEntry ? (
									<TimesheetGrid
										key={selectedEntry[0]}
										user={selectedEntry[0]}
										days={selectedEntry[1]}
										issueSummaries={issueSummaries}
										onDownloadUser={handleDownloadUser}
									/>
								) : (
									<TimesheetGrid
										key={selectedUser}
										user={selectedUser}
										days={{}}
										issueSummaries={issueSummaries}
										onDownloadUser={handleDownloadUser}
									/>
								)}
							</ErrorBoundary>
						) : (
							<>
								<TimesheetStatsCards
									entries={visibleEntries}
									year={currentYear}
									monthZeroIndexed={currentMonth}
								/>
								{visibleEntries.length > 1 && (
									<OverviewTable
										entries={visibleEntries}
										year={currentYear}
										monthZeroIndexed={currentMonth}
										onUserClick={handleUserChange}
									/>
								)}
								{visibleEntries.map(([user, days]) => (
									<ErrorBoundary
										key={user}
										fallbackMessage={`Failed to render timesheet for ${user}.`}
									>
										<TimesheetGrid
											user={user}
											days={days}
											issueSummaries={issueSummaries}
											onDownloadUser={handleDownloadUser}
										/>
									</ErrorBoundary>
								))}
							</>
						))}
				</>
			)}
		</div>
	);
};
