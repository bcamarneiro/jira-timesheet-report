import type {
	EnrichedJiraWorklog,
	GroupedWorklogs,
} from '../../stores/useTimesheetStore';
import {
	buildCsvForUser,
	buildSummaryCsv,
	download,
	type UserSummary,
} from '../utils/csv';
import { isDateInMonth } from '../utils/date';

/**
 * Filter worklogs to only include those within the specified month.
 */
function filterWorklogsByMonth(
	userWorklogs: Record<string, EnrichedJiraWorklog[]>,
	year: number,
	month: number,
): EnrichedJiraWorklog[] {
	const filtered: EnrichedJiraWorklog[] = [];
	for (const [dateKey, worklogs] of Object.entries(userWorklogs)) {
		if (isDateInMonth(dateKey, year, month)) {
			filtered.push(...worklogs);
		}
	}
	return filtered;
}

/**
 * Compute summary stats for a user's worklogs in a given month.
 */
function computeUserSummary(
	user: string,
	userWorklogs: Record<string, EnrichedJiraWorklog[]>,
	year: number,
	month: number,
): UserSummary {
	let totalSeconds = 0;
	let worklogCount = 0;

	for (const [dateKey, worklogs] of Object.entries(userWorklogs)) {
		if (!isDateInMonth(dateKey, year, month)) continue;
		for (const wl of worklogs) {
			totalSeconds += wl.timeSpentSeconds ?? 0;
			worklogCount++;
		}
	}

	const totalHours = totalSeconds / 3600;
	return {
		user,
		totalHours,
		worklogCount,
		daysWorked: totalHours / 8,
	};
}

export function useDownload() {
	const downloadUser = (
		user: string,
		grouped: GroupedWorklogs,
		issueSummaries: Record<string, string>,
		year: number,
		month: number,
	) => {
		const userWorklogs = grouped[user] || {};
		const filteredWorklogs = filterWorklogsByMonth(userWorklogs, year, month);
		const csvContent = buildCsvForUser(filteredWorklogs, issueSummaries);
		download(`${user}-${year}-${month + 1}.csv`, csvContent);
	};

	const downloadAll = (
		users: string[],
		grouped: GroupedWorklogs,
		issueSummaries: Record<string, string>,
		year: number,
		month: number,
	) => {
		const summaries: UserSummary[] = [];

		for (const user of users) {
			const userWorklogs = grouped[user] || {};
			const filteredWorklogs = filterWorklogsByMonth(userWorklogs, year, month);
			const csvContent = buildCsvForUser(filteredWorklogs, issueSummaries);
			download(`${user}-${year}-${month + 1}.csv`, csvContent);

			summaries.push(computeUserSummary(user, userWorklogs, year, month));
		}

		// Download the summary CSV with all users
		if (users.length > 1) {
			const summaryCsv = buildSummaryCsv(summaries, year, month);
			download(`summary-${year}-${month + 1}.csv`, summaryCsv);
		}
	};

	return { downloadUser, downloadAll };
}
