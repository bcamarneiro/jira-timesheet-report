import type React from "react";

import { Button } from "../components/ui/Button";
import { MonthNavigator } from "../components/MonthNavigator";
import { TimesheetGrid } from "../components/TimesheetGrid";
import { UserSelector } from "../components/UserSelector";
import { useDownload } from "../hooks/useDownload";
import { useTimesheetData } from "../hooks/useTimesheetData";
import { useTimesheetQueryParams } from "../hooks/useTimesheetQueryParams";
import { monthLabel } from "../utils/date";

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

	const handleDownloadAll = (visibleUsers: string[]) => {
		downloadAll(
			visibleUsers,
			data || [],
			issueSummaries,
			currentYear,
			currentMonth,
		);
	};

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
				<Button
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
				</Button>
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
