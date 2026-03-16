import type React from 'react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { TeamMemberSummary } from '../../services/teamService';
import { useConfigStore } from '../../stores/useConfigStore';
import { useTeamStore } from '../../stores/useTeamStore';
import { WeekNavigator } from '../components/dashboard/WeekNavigator';
import { TeamStatsCards } from '../components/team/TeamStatsCards';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useTeamDataFetcher } from '../hooks/useTeamDataFetcher';
import { downloadAsFile } from '../utils/downloadFile';
import { formatHours } from '../utils/format';
import { buildTeamCsv } from '../utils/teamCsvExport';
import * as styles from './TeamPage.module.css';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

/** Static lookup map for hours cell styling (Biome noDynamicNamespaceImportAccess) */
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

/** Static lookup map for gap cell styling */
const gapCellStyleMap = {
	positive: styles.gapPositive,
	zero: styles.gapZero,
} as const;

function getGapCellStyle(gapSeconds: number): string {
	return gapSeconds > 0 ? gapCellStyleMap.positive : gapCellStyleMap.zero;
}

function getWeekdays(weekStart: string): string[] {
	const days: string[] = [];
	const d = new Date(weekStart);
	for (let i = 0; i < 5; i++) {
		days.push(d.toISOString().slice(0, 10));
		d.setDate(d.getDate() + 1);
	}
	return days;
}

function formatDayHeader(dateStr: string, index: number): string {
	const d = new Date(dateStr);
	return `${DAY_LABELS[index]} ${d.getDate()}`;
}

function formatHoursDecimal(hours: number): string {
	return Number.isInteger(hours)
		? `${hours.toFixed(0)}h`
		: `${hours.toFixed(1)}h`;
}

type SortField = 'name' | 'total' | 'gap';
type SortDirection = 'asc' | 'desc';

function TeamMemberRow({
	member,
	weekdays,
}: {
	member: TeamMemberSummary;
	weekdays: string[];
}) {
	const pct = (member.totalSeconds / member.targetSeconds) * 100;

	return (
		<tr>
			<td>
				<Link
					to={`/timesheet?user=${encodeURIComponent(member.displayName)}`}
					className={styles.memberNameLink}
				>
					{member.displayName}
				</Link>
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

export const TeamPage: React.FC = () => {
	useTeamDataFetcher();

	const jiraHost = useConfigStore((s) => s.config.jiraHost);
	const weekStart = useTeamStore((s) => s.weekStart);
	const weekEnd = useTeamStore((s) => s.weekEnd);
	const teamMembers = useTeamStore((s) => s.teamMembers);
	const isLoading = useTeamStore((s) => s.isLoading);
	const error = useTeamStore((s) => s.error);
	const goToPrevWeek = useTeamStore((s) => s.goToPrevWeek);
	const goToNextWeek = useTeamStore((s) => s.goToNextWeek);
	const goToCurrentWeek = useTeamStore((s) => s.goToCurrentWeek);

	const [sortField, setSortField] = useState<SortField>('name');
	const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

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

	const handleExportCsv = () => {
		const csv = buildTeamCsv(sortedMembers, weekdays);
		const filename = `team-report-${weekStart}.csv`;
		downloadAsFile(csv, filename, 'text/csv;charset=utf-8');
	};

	if (!jiraHost) {
		return (
			<div className={styles.container}>
				<div className={styles.empty}>
					<h2>Configure Jira first</h2>
					<p>
						The team dashboard needs your Jira connection to fetch worklogs
						across team members.
					</p>
					<Link to="/settings">Go to Settings</Link>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className={styles.container}>
				<div className={styles.toolbar}>
					<WeekNavigator
						weekStart={weekStart}
						weekEnd={weekEnd}
						onPrev={goToPrevWeek}
						onNext={goToNextWeek}
						onToday={goToCurrentWeek}
					/>
				</div>
				<div className={styles.error}>
					<h2>Unable to load team data</h2>
					<p>{error}</p>
					<Link to="/settings">Check your settings</Link>
				</div>
			</div>
		);
	}

	return (
		<div className={styles.container}>
			<div className={styles.toolbar}>
				<WeekNavigator
					weekStart={weekStart}
					weekEnd={weekEnd}
					onPrev={goToPrevWeek}
					onNext={goToNextWeek}
					onToday={goToCurrentWeek}
				/>
				{teamMembers.length > 0 && (
					<Button variant="secondary" onClick={handleExportCsv}>
						Export CSV
					</Button>
				)}
			</div>

			{isLoading && teamMembers.length === 0 && (
				<div className={styles.loading}>
					<div className={styles.spinner} />
					<p>Loading team worklogs...</p>
				</div>
			)}

			{!isLoading && teamMembers.length === 0 && (
				<div className={styles.empty}>
					<h2>No team data found</h2>
					<p>
						No worklogs were found for this week. Make sure team members have
						logged time, or configure allowed users in settings.
					</p>
				</div>
			)}

			{teamMembers.length > 0 && (
				<>
					<TeamStatsCards teamMembers={teamMembers} />

					<div className={styles.tableWrapper}>
						<table className={styles.table}>
							<thead>
								<tr>
									<th
										className={styles.sortableHeader}
										onClick={() => handleSort('name')}
									>
										Team Member
										<SortIndicator
											field="name"
											activeField={sortField}
											direction={sortDirection}
										/>
									</th>
									{weekdays.map((day, i) => (
										<th key={day} className={styles.dayHeader}>
											{formatDayHeader(day, i)}
										</th>
									))}
									<th
										className={`${styles.dayHeader} ${styles.sortableHeader}`}
										onClick={() => handleSort('total')}
									>
										Total
										<SortIndicator
											field="total"
											activeField={sortField}
											direction={sortDirection}
										/>
									</th>
									<th
										className={`${styles.dayHeader} ${styles.sortableHeader}`}
										onClick={() => handleSort('gap')}
									>
										Gap
										<SortIndicator
											field="gap"
											activeField={sortField}
											direction={sortDirection}
										/>
									</th>
								</tr>
							</thead>
							<tbody>
								{sortedMembers.map((member) => (
									<TeamMemberRow
										key={member.email}
										member={member}
										weekdays={weekdays}
									/>
								))}
								<SummaryRow members={teamMembers} weekdays={weekdays} />
							</tbody>
						</table>
					</div>

					{teamMembers.every((m) => m.gapSeconds === 0) && (
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
		</div>
	);
};
