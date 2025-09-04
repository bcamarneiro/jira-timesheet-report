import type React from "react";
import { buildCsvForUser, download } from "./utils/csv";
import { monthLabel } from "./utils/date";
import { UserSelector } from "./components/UserSelector";
import { MonthNavigator } from "./components/MonthNavigator";
import { TimesheetGrid } from "./components/TimesheetGrid";
import { useTimesheetQueryParams } from "./hooks/useTimesheetQueryParams";
import { useTimesheetData } from "./hooks/useTimesheetData";

export const App: React.FC = () => {
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
		jiraDomain,
		issueSummaries,
		teamDevelopers,
		users,
		grouped,
		visibleEntries,
	} = useTimesheetData(currentYear, currentMonth, selectedUser);

	const handleUserChange = (value: string) => {
		setSelectedUser(value);
	};

	function handleDownloadUser(user: string) {
		const csv = data
			? buildCsvForUser(data, issueSummaries, user, currentYear, currentMonth)
			: "";
		download(`${user.replace(/[^a-z0-9-_]/gi, "_")}.csv`, csv);
	}

	function handleDownloadAll(visibleUsers: string[]) {
		visibleUsers.forEach((user) => {
			handleDownloadUser(user);
		});
	}

	if (!data) return <p>Loading...</p>;

	const isValidUser = selectedUser !== "" && users.includes(selectedUser);
	const selectedEntry = visibleEntries.find(([user]) => user === selectedUser);

	return (
		<div style={{ fontFamily: "sans-serif" }}>
			<h1>Timesheet</h1>
			<UserSelector
				users={users}
				value={selectedUser}
				onChange={handleUserChange}
			/>

			<div style={{ margin: "0.5em 0" }}>
				<button
					type="button"
					onClick={() =>
						handleDownloadAll(
							Object.keys(grouped)
								.filter((user) => selectedUser === "" || user === selectedUser)
								.filter(
									(user) => !teamDevelopers || teamDevelopers.includes(user),
								),
						)
					}
				>
					Download CSV for all
				</button>
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
				<div style={{ marginTop: "1em", fontWeight: "bold" }}>
					please select a dev
				</div>
			)}
		</div>
	);
};
