import type React from 'react';
import { Link } from 'react-router-dom';
import { useConfigStore } from '../../stores/useConfigStore';
import { useDashboardStore } from '../../stores/useDashboardStore';
import { DayCard } from '../components/dashboard/DayCard';
import { SourceStatusBar } from '../components/dashboard/SourceStatusBar';
import { WeekNavigator } from '../components/dashboard/WeekNavigator';
import { WeekOverview } from '../components/dashboard/WeekOverview';
import { useDashboardDataFetcher } from '../hooks/useDashboardDataFetcher';
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

	const weekdays = daySummaries.filter((d) => !d.isWeekend);
	const hasGaps = weekdays.some((d) => d.gapSeconds > 0);

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

			{isLoadingWorklogs && daySummaries.length === 0 && (
				<div className={styles.loading}>
					<div className={styles.spinner} />
					<p>Loading your week...</p>
				</div>
			)}

			{daySummaries.length > 0 && (
				<>
					<WeekOverview days={daySummaries} />

					{hasGaps && (
						<div className={styles.daysSection}>
							<h3 className={styles.sectionTitle}>Days to fill</h3>
							{weekdays
								.filter((d) => d.gapSeconds > 0)
								.map((day) => (
									<DayCard key={day.date} day={day} />
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
		</div>
	);
};
