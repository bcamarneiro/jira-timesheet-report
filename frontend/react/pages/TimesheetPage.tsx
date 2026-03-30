import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { TeamMemberSummary } from '../../services/teamService';
import { useConfigStore } from '../../stores/useConfigStore';
import { useTeamStore } from '../../stores/useTeamStore';
import { useTimesheetStore } from '../../stores/useTimesheetStore';
import { useUserDataStore, type ReportPreset } from '../../stores/useUserDataStore';
import { WeekNavigator } from '../components/dashboard/WeekNavigator';
import { ManagerInsightsPanel } from '../components/reports/ManagerInsightsPanel';
import { MonthNavigator } from '../components/MonthNavigator';
import { OverviewTable } from '../components/OverviewTable';
import { ReportsControlPanel } from '../components/reports/ReportsControlPanel';
import { TimesheetGrid } from '../components/TimesheetGrid';
import { TeamStatsCards } from '../components/team/TeamStatsCards';
import { TimesheetStatsCards } from '../components/timesheet/TimesheetStatsCards';
import { UserSelector } from '../components/UserSelector';
import { Button } from '../components/ui/Button';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Spinner } from '../components/ui/Spinner';
import { toast } from '../components/ui/Toast';
import { useReportsURLState } from '../hooks/useReportsURLState';
import { useDownload } from '../hooks/useDownload';
import { useReportsTrendData } from '../hooks/useReportsTrendData';
import { useTeamData } from '../hooks/useTeamData';
import { useTimesheetDataFetcher } from '../hooks/useTimesheetDataFetcher';
import { addDaysToIsoDate, monthLabel, parseIsoDateLocal } from '../utils/date';
import { downloadAsFile } from '../utils/downloadFile';
import { formatHours } from '../utils/format';
import { deriveMonthlyReportState } from '../utils/monthlyReport';
import { validateReportsConsistency } from '../utils/reportConsistency';
import {
	buildReportsSnapshotHtml,
	buildReportsSnapshotMarkdown,
} from '../utils/reportSnapshots';
import { buildTeamCsv } from '../utils/teamCsvExport';
import { monthWorklogsQueryKey } from '../hooks/useMonthWorklogs';
import { fetchMonthWorklogs } from '../../services/monthWorklogService';
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
	return Array.from({ length: 5 }, (_, index) =>
		addDaysToIsoDate(weekStart, index),
	);
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
type ReportsValidationState = {
	status: 'idle' | 'checking' | 'consistent' | 'inconsistent' | 'error';
	message: string;
	checkedAt: string | null;
	mismatches: Array<{
		displayName: string;
		weeklySeconds: number;
		monthlySeconds: number;
	}>;
};

function slugifyLabel(value: string): string {
	return value
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

function includesSearch(haystack: string, query: string): boolean {
	return haystack.toLowerCase().includes(query);
}

function buildIdleValidationState(
	viewMode: ViewMode,
	weekStart: string,
	weekEnd: string,
): ReportsValidationState {
	return {
		status: 'idle',
		message:
			viewMode === 'weekly'
				? `Ready to validate ${weekStart} to ${weekEnd} against the monthly worklog source.`
				: 'Switch to the Weekly view to validate the current week against monthly totals.',
		checkedAt: null,
		mismatches: [],
	};
}

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
	const queryClient = useQueryClient();
	const [viewMode, setViewMode] = useState<ViewMode>('weekly');
	const [sortField, setSortField] = useState<SortField>('name');
	const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
	const [searchQuery, setSearchQuery] = useState('');
	const [onlyAttentionNeeded, setOnlyAttentionNeeded] = useState(false);
	const [managerMode, setManagerMode] = useState(false);
	const [trendWeeks, setTrendWeeks] = useState(6);

	// Only fetch data for the active view
	const { isLoading, errorMessage } = useTimesheetDataFetcher({
		enabled: viewMode === 'monthly',
	});

	// Monthly view state
	const currentYear = useTimesheetStore((state) => state.currentYear);
	const currentMonth = useTimesheetStore((state) => state.currentMonth);
	const selectedUser = useTimesheetStore((state) => state.selectedUser);
	const setSelectedUser = useTimesheetStore((state) => state.setSelectedUser);
	const data = useTimesheetStore((state) => state.data);
	const goPrevMonth = useTimesheetStore((state) => state.goPrevMonth);
	const goNextMonth = useTimesheetStore((state) => state.goNextMonth);
	const config = useConfigStore((state) => state.config);
	const jiraDomain = config.jiraHost;
	const allowedUsers = config.allowedUsers;

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

	const { downloadUser, downloadAll } = useDownload();
	const reportPresets = useUserDataStore((state) => state.reportPresets);
	const saveReportPreset = useUserDataStore((state) => state.saveReportPreset);
	const removeReportPreset = useUserDataStore((state) => state.removeReportPreset);
	const { issueSummaries, users, grouped, visibleEntries } = useMemo(
		() => deriveMonthlyReportState(data, selectedUser, allowedUsers),
		[data, selectedUser, allowedUsers],
	);
	const [validationState, setValidationState] = useState<ReportsValidationState>(
		() => buildIdleValidationState(viewMode, weekStart, weekEnd),
	);

	useReportsURLState({
		viewMode,
		setViewMode,
		searchQuery,
		setSearchQuery,
		onlyAttentionNeeded,
		setOnlyAttentionNeeded,
		managerMode,
		setManagerMode,
		trendWeeks,
		setTrendWeeks,
		sortField,
		setSortField,
		sortDirection,
		setSortDirection,
	});
	const {
		data: trendModel,
		isLoading: trendsLoading,
		error: trendsError,
	} = useReportsTrendData(weekStart, trendWeeks, {
		enabled: viewMode === 'weekly' && managerMode,
	});

	const weekdays = getWeekdays(weekStart);
	const normalizedSearchQuery = searchQuery.trim().toLowerCase();
	const allMonthlyEntries = useMemo(
		() => Object.entries(grouped),
		[grouped],
	);
	const filteredTeamMembers = useMemo(
		() =>
			teamMembers.filter((member) => {
				const matchesQuery =
					normalizedSearchQuery.length === 0 ||
					includesSearch(member.displayName, normalizedSearchQuery) ||
					includesSearch(member.email, normalizedSearchQuery);
				if (!matchesQuery) return false;
				if (onlyAttentionNeeded && member.gapSeconds === 0) return false;
				return true;
			}),
		[teamMembers, normalizedSearchQuery, onlyAttentionNeeded],
	);
	const isValidUser = selectedUser !== '' && users.includes(selectedUser);
	const filteredUsers = useMemo(() => {
		if (normalizedSearchQuery.length === 0) return users;
		return users.filter((user) => includesSearch(user, normalizedSearchQuery));
	}, [users, normalizedSearchQuery]);
	const selectableUsers = useMemo(() => {
		if (isValidUser && !filteredUsers.includes(selectedUser)) {
			return [selectedUser, ...filteredUsers];
		}
		return filteredUsers;
	}, [filteredUsers, isValidUser, selectedUser]);
	const filteredVisibleEntries = useMemo(() => {
		if (isValidUser) {
			return visibleEntries;
		}

		if (normalizedSearchQuery.length === 0) {
			return allMonthlyEntries;
		}

		return allMonthlyEntries.filter(([user]) =>
			includesSearch(user, normalizedSearchQuery),
		);
	}, [allMonthlyEntries, isValidUser, normalizedSearchQuery, visibleEntries]);
	const selectedEntry = isValidUser ? grouped[selectedUser] : undefined;

	const sortedMembers = useMemo(() => {
		const sorted = [...filteredTeamMembers];
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
	}, [filteredTeamMembers, sortField, sortDirection]);

	const handleSort = (field: SortField) => {
		if (sortField === field) {
			setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
		} else {
			setSortField(field);
			setSortDirection('asc');
		}
	};

	const handleUserChange = (value: string) => {
		setSelectedUser(value);
	};

	const handleMemberClick = (name: string) => {
		setSelectedUser(name);
		setViewMode('monthly');
	};

	const handleDownloadUser = (user: string) => {
		downloadUser(user, grouped, issueSummaries, currentYear, currentMonth);
	};

	const handleDownloadAll = () => {
		downloadAll(
			filteredVisibleEntries.map(([user]) => user),
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
		toast.success('Weekly report exported');
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

	useEffect(() => {
		setValidationState(buildIdleValidationState(viewMode, weekStart, weekEnd));
	}, [viewMode, weekStart, weekEnd]);

	const handleClearFilters = () => {
		setSearchQuery('');
		setOnlyAttentionNeeded(false);
		setManagerMode(false);
		setTrendWeeks(6);
		setSortField('name');
		setSortDirection('asc');
		setSelectedUser('');
		toast.info('Reports filters cleared');
	};

	const handleSavePreset = (label: string) => {
		const trimmedLabel = label.trim();
		if (!trimmedLabel) return;

		saveReportPreset({
			id: `${slugifyLabel(trimmedLabel) || 'preset'}-${Date.now().toString(36)}`,
			label: trimmedLabel,
			viewMode,
			searchQuery,
			onlyAttentionNeeded,
			managerMode,
			trendWeeks,
			sortField,
			sortDirection,
			selectedUser,
		});
		toast.success(`Saved preset "${trimmedLabel}"`);
	};

	const handleApplyPreset = (preset: ReportPreset) => {
		setViewMode(preset.viewMode);
		setSearchQuery(preset.searchQuery);
		setOnlyAttentionNeeded(preset.onlyAttentionNeeded);
		setManagerMode(preset.managerMode);
		setTrendWeeks(preset.trendWeeks);
		setSortField(preset.sortField);
		setSortDirection(preset.sortDirection);
		setSelectedUser(preset.selectedUser);
		toast.success(`Applied preset "${preset.label}"`);
	};

	const handleRemovePreset = (id: string) => {
		const preset = reportPresets.find((item) => item.id === id);
		removeReportPreset(id);
		toast.success(
			preset ? `Removed preset "${preset.label}"` : 'Removed report preset',
		);
	};

	const handleCopyShareLink = async () => {
		try {
			await navigator.clipboard.writeText(window.location.href);
			toast.success('Share link copied to clipboard');
		} catch {
			toast.error('Failed to copy share link');
		}
	};

	const buildSnapshotInput = () =>
		viewMode === 'weekly'
			? {
					viewMode: 'weekly' as const,
					jiraHost: jiraDomain,
					weekStart,
					weekEnd,
					searchQuery,
					onlyAttentionNeeded,
					managerMode,
					trendWeeks,
					sortField,
					sortDirection,
					members: sortedMembers,
					validationState,
					trendModel,
				}
			: {
					viewMode: 'monthly' as const,
					jiraHost: jiraDomain,
					monthLabel: monthLabel(currentYear, currentMonth),
					year: currentYear,
					monthZeroIndexed: currentMonth,
					searchQuery,
					selectedUser,
					entries: filteredVisibleEntries,
				};

	const handleExportSnapshotHtml = () => {
		const html = buildReportsSnapshotHtml(buildSnapshotInput());
		const filename =
			viewMode === 'weekly'
				? `reports-snapshot-week-${weekStart}.html`
				: `reports-snapshot-month-${currentYear}-${String(currentMonth + 1).padStart(2, '0')}.html`;
		downloadAsFile(html, filename, 'text/html;charset=utf-8');
		toast.success('Read-only HTML snapshot exported');
	};

	const handleExportSnapshotMarkdown = () => {
		const markdown = buildReportsSnapshotMarkdown(buildSnapshotInput());
		const filename =
			viewMode === 'weekly'
				? `reports-snapshot-week-${weekStart}.md`
				: `reports-snapshot-month-${currentYear}-${String(currentMonth + 1).padStart(2, '0')}.md`;
		downloadAsFile(markdown, filename, 'text/markdown;charset=utf-8');
		toast.success('Read-only Markdown snapshot exported');
	};

	const handleValidateConsistency = async () => {
		if (viewMode !== 'weekly') {
			toast.info('Switch to Weekly to validate weekly and monthly totals');
			return;
		}

		setValidationState({
			status: 'checking',
			message: `Validating ${weekStart} to ${weekEnd} against monthly worklogs...`,
			checkedAt: null,
			mismatches: [],
		});

		try {
			const [startYear, startMonthStr] = weekStart.split('-').map(Number);
			const [endYear, endMonthStr] = weekEnd.split('-').map(Number);
			const monthPairs = new Map<string, { year: number; month: number }>();

			for (const [year, month] of [
				[startYear, startMonthStr - 1],
				[endYear, endMonthStr - 1],
			]) {
				monthPairs.set(`${year}-${month}`, { year, month });
			}

			const results = await Promise.all(
				[...monthPairs.values()].map(({ year, month }) =>
					queryClient.fetchQuery({
						queryKey: monthWorklogsQueryKey(
							year,
							month,
							config.jiraHost,
							config.corsProxy,
							false,
							'',
						),
						queryFn: ({ signal }) =>
							fetchMonthWorklogs(config, year, month, {}, signal),
						staleTime: 15 * 60 * 1000,
					}),
				),
			);
			const result = validateReportsConsistency(
				teamMembers,
				results.flat(),
				weekStart,
				weekEnd,
				allowedUsers,
			);
			const checkedAt = new Date().toLocaleString();

			if (result.matches) {
				setValidationState({
					status: 'consistent',
					message: `Weekly and monthly totals matched for ${result.checkedUsers} user${result.checkedUsers === 1 ? '' : 's'}.`,
					checkedAt,
					mismatches: [],
				});
				toast.success('Weekly and monthly totals are consistent');
				return;
			}

			setValidationState({
				status: 'inconsistent',
				message: `Found ${result.mismatches.length} mismatch${result.mismatches.length === 1 ? '' : 'es'} between weekly and monthly totals.`,
				checkedAt,
				mismatches: result.mismatches,
			});
			toast.error('Reports validation found mismatched totals');
		} catch (error) {
			const message =
				error instanceof Error ? error.message : 'Validation failed';
			setValidationState({
				status: 'error',
				message,
				checkedAt: new Date().toLocaleString(),
				mismatches: [],
			});
			toast.error(message);
		}
	};

	const hasNoData = !isLoading && data && allMonthlyEntries.length === 0;
	const hasNoFilteredMonthlyResults =
		!isLoading &&
		!!data &&
		allMonthlyEntries.length > 0 &&
		filteredVisibleEntries.length === 0;
	const hasNoFilteredWeeklyResults =
		!teamLoading &&
		!teamError &&
		teamMembers.length > 0 &&
		sortedMembers.length === 0;
	const monthlySummary = useMemo(() => {
		if (!data || viewMode !== 'monthly') return null;
		return {
			userCount: filteredVisibleEntries.length,
			totalSeconds: sumMonthlyHours(
				filteredVisibleEntries,
				currentYear,
				currentMonth,
			),
		};
	}, [data, viewMode, filteredVisibleEntries, currentYear, currentMonth]);
	const weeklySummary = useMemo(() => {
		if (viewMode !== 'weekly' || sortedMembers.length === 0) return null;
		return {
			totalSeconds: sortedMembers.reduce(
				(sum, member) => sum + member.totalSeconds,
				0,
			),
			totalGapSeconds: sortedMembers.reduce(
				(sum, member) => sum + member.gapSeconds,
				0,
			),
		};
	}, [viewMode, sortedMembers]);

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
							users={selectableUsers}
							value={isValidUser ? selectedUser : ''}
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
					{viewMode === 'monthly' && filteredVisibleEntries.length > 0 && (
						<Button variant="secondary" onClick={handleDownloadAll}>
							Export All
						</Button>
					)}
					{viewMode === 'weekly' && sortedMembers.length > 0 && (
						<Button variant="secondary" onClick={handleExportTeamCsv}>
							Export CSV
						</Button>
					)}
				</div>
			</div>

			<ReportsControlPanel
				viewMode={viewMode}
				searchQuery={searchQuery}
				onlyAttentionNeeded={onlyAttentionNeeded}
				managerMode={managerMode}
				trendWeeks={trendWeeks}
				sortField={sortField}
				sortDirection={sortDirection}
				presets={reportPresets}
				onSearchChange={setSearchQuery}
				onOnlyAttentionNeededChange={setOnlyAttentionNeeded}
				onManagerModeChange={setManagerMode}
				onTrendWeeksChange={setTrendWeeks}
				onClearFilters={handleClearFilters}
				onSavePreset={handleSavePreset}
				onApplyPreset={handleApplyPreset}
				onRemovePreset={handleRemovePreset}
				onCopyShareLink={handleCopyShareLink}
				onExportSnapshotHtml={handleExportSnapshotHtml}
				onExportSnapshotMarkdown={handleExportSnapshotMarkdown}
				onValidateConsistency={handleValidateConsistency}
				validationState={validationState}
				canValidate={
					viewMode === 'weekly' &&
					!!config.jiraHost &&
					!!config.apiToken &&
					!teamLoading &&
					!teamError
				}
				canExportSnapshot={
					viewMode === 'weekly'
						? sortedMembers.length > 0
						: filteredVisibleEntries.length > 0
				}
			/>

			{/* ---- WEEKLY VIEW ---- */}
			{viewMode === 'weekly' && (
				<>
					{weeklySummary && (
						<div className={styles.reportSummary}>
							<strong>Weekly Snapshot</strong>
							<span>
								{formatHours(weeklySummary.totalSeconds)} logged across the team
							</span>
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

					{managerMode && teamMembers.length > 0 ? (
						<ManagerInsightsPanel
							trendWeeks={trendWeeks}
							onTrendWeeksChange={setTrendWeeks}
							currentMembers={teamMembers}
							model={trendModel}
							isLoading={trendsLoading}
							errorMessage={
								trendsError instanceof Error ? trendsError.message : undefined
							}
						/>
					) : null}

					{hasNoFilteredWeeklyResults && (
						<div className={styles.emptyState}>
							<div className={styles.emptyIcon}>&#128269;</div>
							<div className={styles.emptyTitle}>No team members match these filters</div>
							<div className={styles.emptyDescription}>
								Try clearing the people filter or disable attention-only mode to
								see the full weekly report again.
							</div>
						</div>
					)}

					{teamMembers.length > 0 && !hasNoFilteredWeeklyResults && (
						<>
							{teamLoading && (
								<div className={styles.refetching}>
									<Spinner size="sm" />
									<span>Updating...</span>
								</div>
							)}
							<TeamStatsCards teamMembers={sortedMembers} />

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
											<th
												className={`${styles.dayHeader} ${styles.sortableHeader}`}
											>
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
											<th
												className={`${styles.dayHeader} ${styles.sortableHeader}`}
											>
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
										<SummaryRow members={sortedMembers} weekdays={weekdays} />
									</tbody>
								</table>
							</div>

							{sortedMembers.some((m) => m.targetSeconds > 0) &&
								sortedMembers.every((m) => m.gapSeconds === 0) && (
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

					{hasNoFilteredMonthlyResults && (
						<div className={styles.emptyState}>
							<div className={styles.emptyIcon}>&#128269;</div>
							<div className={styles.emptyTitle}>No monthly users match this filter</div>
							<div className={styles.emptyDescription}>
								Try clearing the people filter or pick a different user to bring
								results back into view.
							</div>
						</div>
					)}

					{data &&
						!hasNoData &&
						!hasNoFilteredMonthlyResults &&
						(isValidUser ? (
							<ErrorBoundary fallbackMessage="Failed to render this user's timesheet.">
								{selectedEntry ? (
									<TimesheetGrid
										key={selectedUser}
										user={selectedUser}
										days={selectedEntry}
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
									entries={filteredVisibleEntries}
									year={currentYear}
									monthZeroIndexed={currentMonth}
								/>
								{filteredVisibleEntries.length > 1 && (
									<OverviewTable
										entries={filteredVisibleEntries}
										year={currentYear}
										monthZeroIndexed={currentMonth}
										onUserClick={handleUserChange}
									/>
								)}
								{filteredVisibleEntries.map(([user, days]) => (
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
