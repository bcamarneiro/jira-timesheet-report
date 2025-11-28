import { Link } from 'react-router-dom';
import { useConfigStore } from '../../stores/useConfigStore';
import { useTimesheetStore } from '../../stores/useTimesheetStore';
import { MonthNavigator } from '../components/MonthNavigator';
import { TimesheetGrid } from '../components/TimesheetGrid';
import { UserSelector } from '../components/UserSelector';
import { Button } from '../components/ui/Button';
import { useDownload } from '../hooks/useDownload';
import { useTimesheetDataFetcher } from '../hooks/useTimesheetDataFetcher';
import { useTimesheetURLSync } from '../hooks/useTimesheetURLSync';
import { monthLabel } from '../utils/date';
import * as styles from './TimesheetPage.module.css';

export const TimesheetPage: React.FC = () => {
	// Fetch data into store
	useTimesheetDataFetcher();

	// Sync URL with store
	const { handleSetSelectedUser } = useTimesheetURLSync();

	// Read from stores
	const currentYear = useTimesheetStore((state) => state.currentYear);
	const currentMonth = useTimesheetStore((state) => state.currentMonth);
	const selectedUser = useTimesheetStore((state) => state.selectedUser);
	const data = useTimesheetStore((state) => state.data);
	const isLoading = useTimesheetStore((state) => state.isLoading);
	const error = useTimesheetStore((state) => state.error);
	const issueSummaries = useTimesheetStore((state) => state.issueSummaries);
	const users = useTimesheetStore((state) => state.users);
	const visibleEntries = useTimesheetStore((state) => state.visibleEntries);
	const goPrevMonth = useTimesheetStore((state) => state.goPrevMonth);
	const goNextMonth = useTimesheetStore((state) => state.goNextMonth);

	const jiraDomain = useConfigStore((state) => state.config.jiraHost);

	const { downloadUser, downloadAll } = useDownload();

	const handleUserChange = (value: string) => {
		handleSetSelectedUser(value);
	};

	const handleDownloadUser = (user: string) => {
		downloadUser(user, data || [], issueSummaries, currentYear, currentMonth);
	};

	const handleDownloadAll = () => {
		downloadAll(
			visibleEntries.map(([user]) => user),
			data || [],
			issueSummaries,
			currentYear,
			currentMonth,
		);
	};

	if (isLoading) {
		return (
			<div className={styles.container}>
				<div className={styles.loading}>
					<div className={styles.spinner}></div>
					<p>Loading timesheet data...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className={styles.container}>
				<div className={styles.error}>
					<h2>Error</h2>
					<p>{error}</p>
					{error.includes('configured') && (
						<Link to="/settings">Go to Settings</Link>
					)}
				</div>
			</div>
		);
	}

	if (!data) return null;

	const isValidUser = selectedUser !== '' && users.includes(selectedUser);
	const selectedEntry = visibleEntries.find(([user]) => user === selectedUser);

	return (
		<div className={styles.container}>
			<h1>Timesheet</h1>
			<UserSelector
				users={users}
				value={selectedUser}
				onChange={handleUserChange}
			/>

			<div className={styles.header}>
				<Button onClick={handleDownloadAll}>Download CSV for all</Button>
			</div>

			<MonthNavigator
				label={monthLabel(currentYear, currentMonth)}
				onPrev={goPrevMonth}
				onNext={goNextMonth}
			/>

			{isValidUser ? (
				selectedEntry ? (
					<TimesheetGrid
						key={selectedEntry[0]}
						user={selectedEntry[0]}
						days={selectedEntry[1]}
						year={currentYear}
						monthZeroIndexed={currentMonth}
						jiraDomain={jiraDomain}
						issueSummaries={issueSummaries}
						onDownloadUser={handleDownloadUser}
					/>
				) : (
					<TimesheetGrid
						key={selectedUser}
						user={selectedUser}
						days={{}}
						year={currentYear}
						monthZeroIndexed={currentMonth}
						jiraDomain={jiraDomain}
						issueSummaries={issueSummaries}
						onDownloadUser={handleDownloadUser}
					/>
				)
			) : (
				visibleEntries.map(([user, days]) => (
					<TimesheetGrid
						key={user}
						user={user}
						days={days}
						year={currentYear}
						monthZeroIndexed={currentMonth}
						jiraDomain={jiraDomain}
						issueSummaries={issueSummaries}
						onDownloadUser={handleDownloadUser}
					/>
				))
			)}
		</div>
	);
};
