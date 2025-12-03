import type {
	EnrichedJiraWorklog,
	GroupedWorklogs,
} from '../../stores/useTimesheetStore';
import { buildCsvForUser, download } from '../utils/csv';
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
		for (const user of users) {
			const userWorklogs = grouped[user] || {};
			const filteredWorklogs = filterWorklogsByMonth(userWorklogs, year, month);
			const csvContent = buildCsvForUser(filteredWorklogs, issueSummaries);
			download(`${user}-${year}-${month + 1}.csv`, csvContent);
		}
	};

	return { downloadUser, downloadAll };
}
