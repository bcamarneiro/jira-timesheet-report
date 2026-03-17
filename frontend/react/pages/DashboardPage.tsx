import type React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useConfigStore } from '../../stores/useConfigStore';
import { useDashboardStore } from '../../stores/useDashboardStore';
import { DayCard } from '../components/dashboard/DayCard';
import { FavoritesManager } from '../components/dashboard/FavoritesManager';
import { KeyboardShortcutsHelp } from '../components/dashboard/KeyboardShortcutsHelp';
import { MonthHeatmap } from '../components/dashboard/MonthHeatmap';
import { OfflineIndicator } from '../components/dashboard/OfflineIndicator';
import { SourceStatusBar } from '../components/dashboard/SourceStatusBar';
import { TemplatesManager } from '../components/dashboard/TemplatesManager';
import { WeekNavigator } from '../components/dashboard/WeekNavigator';
import { WeekOverview } from '../components/dashboard/WeekOverview';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { toast } from '../components/ui/Toast';
import { useComplianceReminder } from '../hooks/useComplianceReminder';
import { useCopyPreviousWeek } from '../hooks/useCopyPreviousWeek';
import { useDashboardDataFetcher } from '../hooks/useDashboardDataFetcher';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useMonthHeatmapData } from '../hooks/useMonthHeatmapData';
import { downloadAsFile } from '../utils/downloadFile';
import { generateWeeklyCsv } from '../utils/weekCsvExport';
import { generateWeeklySummary } from '../utils/weekSummary';
import * as styles from './DashboardPage.module.css';

export const DashboardPage: React.FC = () => {
	useDashboardDataFetcher();

	const jiraHost = useConfigStore((s) => s.config.jiraHost);
	const weekStart = useDashboardStore((s) => s.weekStart);
	const weekEnd = useDashboardStore((s) => s.weekEnd);
	const daySummaries = useDashboardStore((s) => s.daySummaries);
	const isLoadingWorklogs = useDashboardStore((s) => s.isLoadingWorklogs);
	const goToPrevWeek = useDashboardStore((s) => s.goToPrevWeek);
	const goToNextWeek = useDashboardStore((s) => s.goToNextWeek);
	const goToCurrentWeek = useDashboardStore((s) => s.goToCurrentWeek);
	const worklogsError = useDashboardStore((s) => s.worklogsError);
	const weekWorklogs = useDashboardStore((s) => s.weekWorklogs);

	const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
	const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);

	const weekdays = daySummaries.filter((d) => !d.isWeekend);
	const { focusedDayIndex, focusedSuggestionIndex, showHelp, setShowHelp } =
		useKeyboardShortcuts(weekdays);
	const { canRemind, reminderEnabled, enableReminder, totalGapHours } =
		useComplianceReminder();
	const { copyPreviousWeek, isLoading: isCopyingPrevWeek } =
		useCopyPreviousWeek();
	const monthHeatmap = useMonthHeatmapData();

	const handleExportMd = async () => {
		const markdown = generateWeeklySummary(weekStart, weekEnd, weekWorklogs);
		try {
			await navigator.clipboard.writeText(markdown);
			toast.success('Weekly summary copied to clipboard');
		} catch {
			toast.error('Failed to copy to clipboard');
		}
	};

	const handleExportCsv = () => {
		const csv = generateWeeklyCsv(weekStart, weekEnd, weekWorklogs);
		const filename = `timesheet-${weekStart}-${weekEnd}.csv`;
		downloadAsFile(csv, filename, 'text/csv;charset=utf-8');
		toast.success('CSV file downloaded');
	};

	const handleCopyPrevWeek = async () => {
		try {
			await copyPreviousWeek();
			toast.success('Previous week worklogs copied as suggestions');
		} catch {
			toast.error('Failed to copy previous week');
		}
	};

	if (!jiraHost) {
		return (
			<div className={styles.container}>
				<div className={styles.empty}>
					<h2>Configure Jira first</h2>
					<p>
						The dashboard needs your Jira connection to fetch worklogs and
						generate suggestions.
					</p>
					<Link to="/settings">Go to Settings</Link>
				</div>
			</div>
		);
	}

	if (worklogsError) {
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
					<SourceStatusBar />
				</div>
				<div className={styles.error}>
					<h2>Unable to load dashboard</h2>
					<p>{worklogsError}</p>
					<Link to="/settings">Check your settings</Link>
				</div>
			</div>
		);
	}

	const hasGaps = weekdays.some((d) => d.gapSeconds > 0);

	return (
		<div className={styles.container}>
			<OfflineIndicator />
			<div className={styles.toolbar}>
				<WeekNavigator
					weekStart={weekStart}
					weekEnd={weekEnd}
					onPrev={goToPrevWeek}
					onNext={goToNextWeek}
					onToday={goToCurrentWeek}
				/>
				<div className={styles.toolbarRight}>
					<Button variant="secondary" onClick={() => setIsFavoritesOpen(true)}>
						Pinned
					</Button>
					<Button variant="secondary" onClick={() => setIsTemplatesOpen(true)}>
						Templates
					</Button>
					<Button
						variant="secondary"
						onClick={handleCopyPrevWeek}
						disabled={isCopyingPrevWeek || daySummaries.length === 0}
					>
						{isCopyingPrevWeek ? 'Copying...' : 'Copy Prev Week'}
					</Button>
					<Button
						variant="secondary"
						onClick={handleExportMd}
						disabled={weekWorklogs.length === 0}
					>
						Export MD
					</Button>
					<Button
						variant="secondary"
						onClick={handleExportCsv}
						disabled={weekWorklogs.length === 0}
					>
						Export CSV
					</Button>
					<button
						type="button"
						className={styles.helpButton}
						onClick={() => setShowHelp(true)}
						title="Keyboard shortcuts (?)"
					>
						?
					</button>
					<SourceStatusBar />
				</div>
			</div>

			{isLoadingWorklogs && daySummaries.length === 0 && (
				<div className={styles.loading}>
					<Spinner size="lg" />
					<p>Loading your week...</p>
				</div>
			)}

			{daySummaries.length > 0 && (
				<>
					{isLoadingWorklogs && (
						<div className={styles.refetching}>
							<Spinner size="sm" />
							<span>Updating...</span>
						</div>
					)}

					<WeekOverview days={daySummaries} />

					{monthHeatmap.isLoading && monthHeatmap.data.size === 0 && (
						<div className={styles.heatmapLoading}>
							<Spinner size="sm" />
							<span>Loading month overview...</span>
						</div>
					)}
					{monthHeatmap.data.size > 0 && (
						<MonthHeatmap
							monthData={monthHeatmap.data}
							month={monthHeatmap.month}
							year={monthHeatmap.year}
						/>
					)}

					{hasGaps && (
						<div className={styles.daysSection}>
							<h3 className={styles.sectionTitle}>Days to fill</h3>
							{weekdays
								.filter((d) => d.gapSeconds > 0)
								.map((day, i) => (
									<DayCard
										key={day.date}
										day={day}
										isFocused={focusedDayIndex === i}
										focusedSuggestionIndex={
											focusedDayIndex === i ? focusedSuggestionIndex : undefined
										}
									/>
								))}
						</div>
					)}

					{!hasGaps && (
						<div className={styles.allDone}>
							<div className={styles.allDoneIcon}>&#10003;</div>
							<div className={styles.allDoneTitle}>All caught up!</div>
							<div className={styles.allDoneText}>
								Every weekday this week has 8+ hours logged.
							</div>
						</div>
					)}
				</>
			)}

			{canRemind && !reminderEnabled && totalGapHours > 0 && (
				<div className={styles.reminderBanner}>
					<span>{totalGapHours.toFixed(1)}h remaining this week.</span>
					<button
						type="button"
						className={styles.reminderButton}
						onClick={enableReminder}
					>
						Enable reminders
					</button>
				</div>
			)}

			<FavoritesManager
				isOpen={isFavoritesOpen}
				onClose={() => setIsFavoritesOpen(false)}
			/>
			<TemplatesManager
				isOpen={isTemplatesOpen}
				onClose={() => setIsTemplatesOpen(false)}
			/>
			<KeyboardShortcutsHelp
				isOpen={showHelp}
				onClose={() => setShowHelp(false)}
			/>
		</div>
	);
};
