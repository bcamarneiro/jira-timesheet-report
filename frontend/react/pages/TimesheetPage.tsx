import { Link } from 'react-router-dom';
import { MonthNavigator } from '../components/MonthNavigator';
import { TimesheetGrid } from '../components/TimesheetGrid';
import { UserSelector } from '../components/UserSelector';
import { Button } from '../components/ui/Button';
import { useDownload } from '../hooks/useDownload';
import { useTimesheetData } from '../hooks/useTimesheetData';
import { useTimesheetQueryParams } from '../hooks/useTimesheetQueryParams';
import { monthLabel } from '../utils/date';
import styles from './TimesheetPage.module.css';

export const TimesheetPage: React.FC = () => {
	const {
		selectedUser,
		setSelectedUser,
		currentYear,
		currentMonth,
		goPrevMonth,
		goNextMonth,
	} = useTimesheetQueryParams();

	const {
		data,
		isLoading,
		error,
		jiraDomain,
		issueSummaries,
		teamDevelopers,
		users,
		grouped,
		visibleEntries,
	} = useTimesheetData(currentYear, currentMonth, selectedUser);

	const { downloadUser, downloadAll } = useDownload();

	const handleUserChange = (value: string) => {
		setSelectedUser(value);
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

	if (isLoading) return <p>Loading...</p>;

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
