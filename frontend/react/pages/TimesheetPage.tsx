import { useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useConfigStore } from '../../stores/useConfigStore';
import { useTimesheetStore } from '../../stores/useTimesheetStore';
import { MonthNavigator } from '../components/MonthNavigator';
import { OverviewTable } from '../components/OverviewTable';
import { TimesheetGrid } from '../components/TimesheetGrid';
import { UserSelector } from '../components/UserSelector';
import { Button } from '../components/ui/Button';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { useDownload } from '../hooks/useDownload';
import { useTimesheetDataFetcher } from '../hooks/useTimesheetDataFetcher';
import { useTimesheetURLSync } from '../hooks/useTimesheetURLSync';
import { monthLabel } from '../utils/date';
import * as styles from './TimesheetPage.module.css';

export const TimesheetPage: React.FC = () => {
	useTimesheetDataFetcher();

	const { handleSetSelectedUser } = useTimesheetURLSync();

	const currentYear = useTimesheetStore((state) => state.currentYear);
	const currentMonth = useTimesheetStore((state) => state.currentMonth);
	const selectedUser = useTimesheetStore((state) => state.selectedUser);
	const data = useTimesheetStore((state) => state.data);
	const isLoading = useTimesheetStore((state) => state.isLoading);
	const error = useTimesheetStore((state) => state.error);
	const issueSummaries = useTimesheetStore((state) => state.issueSummaries);
	const users = useTimesheetStore((state) => state.users);
	const grouped = useTimesheetStore((state) => state.grouped);
	const visibleEntries = useTimesheetStore((state) => state.visibleEntries);
	const goPrevMonth = useTimesheetStore((state) => state.goPrevMonth);
	const goNextMonth = useTimesheetStore((state) => state.goNextMonth);

	const jiraDomain = useConfigStore((state) => state.config.jiraHost);

	const { downloadUser, downloadAll } = useDownload();

	const handleUserChange = (value: string) => {
		handleSetSelectedUser(value);
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

	// Keyboard shortcuts for month navigation
	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			// Don't trigger when typing in inputs
			const tag = (e.target as HTMLElement)?.tagName;
			if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

			if (e.key === 'ArrowLeft') {
				e.preventDefault();
				goPrevMonth();
			} else if (e.key === 'ArrowRight') {
				e.preventDefault();
				goNextMonth();
			}
		},
		[goPrevMonth, goNextMonth],
	);

	useEffect(() => {
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [handleKeyDown]);

	if (error) {
		return (
			<div className={styles.container}>
				<div className={styles.error}>
					<h2>Unable to load timesheets</h2>
					<p>{error}</p>
					{error.includes('configured') ? (
						<Link to="/settings">Go to Settings</Link>
					) : error.includes('401') || error.includes('403') ? (
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

	const isValidUser = selectedUser !== '' && users.includes(selectedUser);
	const selectedEntry = visibleEntries.find(([user]) => user === selectedUser);
	const hasNoData = !isLoading && data && visibleEntries.length === 0;

	return (
		<div className={styles.container}>
			<div className={styles.toolbar}>
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
				<div className={styles.toolbarRight}>
					{jiraDomain && <span className={styles.context}>{jiraDomain}</span>}
					{visibleEntries.length > 0 && (
						<Button variant="secondary" onClick={handleDownloadAll}>
							Export All
						</Button>
					)}
				</div>
			</div>

			{isLoading && (
				<div className={styles.loading}>
					<div className={styles.spinner} />
					<p>Loading worklogs...</p>
				</div>
			)}

			{hasNoData && (
				<div className={styles.emptyState}>
					<div className={styles.emptyIcon}>&#128203;</div>
					<div className={styles.emptyTitle}>No worklogs found</div>
					<div className={styles.emptyDescription}>
						No worklogs were recorded for{' '}
						{monthLabel(currentYear, currentMonth)}. Try a different month or
						adjust your filters.
					</div>
				</div>
			)}

			{!isLoading && data && !hasNoData && (
				<>
					{isValidUser ? (
						<ErrorBoundary fallbackMessage="Failed to render this user's timesheet.">
							{selectedEntry ? (
								<TimesheetGrid
									key={selectedEntry[0]}
									user={selectedEntry[0]}
									days={selectedEntry[1]}
									onDownloadUser={handleDownloadUser}
								/>
							) : (
								<TimesheetGrid
									key={selectedUser}
									user={selectedUser}
									days={{}}
									onDownloadUser={handleDownloadUser}
								/>
							)}
						</ErrorBoundary>
					) : (
						<>
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
										onDownloadUser={handleDownloadUser}
									/>
								</ErrorBoundary>
							))}
						</>
					)}
				</>
			)}
		</div>
	);
};
