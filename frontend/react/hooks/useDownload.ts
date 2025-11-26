import { buildCsvForUser, download } from '../utils/csv';
import { groupWorklogsByUserAndDate } from '../utils/groupWorklogs';
import type { EnrichedJiraWorklog } from './useTimesheetData';

export function useDownload() {
	const downloadUser = (
		user: string,
		worklogs: EnrichedJiraWorklog[],
		issueSummaries: Record<string, string>,
		year: number,
		month: number,
	) => {
		const grouped = groupWorklogsByUserAndDate(worklogs);
		const userWorklogs = grouped[user] || {};
		const csvContent = buildCsvForUser(
			Object.values(userWorklogs).flat(),
			issueSummaries,
		);
		download(`${user}-${year}-${month + 1}.csv`, csvContent);
	};

	const downloadAll = (
		users: string[],
		worklogs: EnrichedJiraWorklog[],
		issueSummaries: Record<string, string>,
		year: number,
		month: number,
	) => {
		const grouped = groupWorklogsByUserAndDate(worklogs);
		for (const user of users) {
			const userWorklogs = grouped[user] || {};
			const csvContent = buildCsvForUser(
				Object.values(userWorklogs).flat(),
				issueSummaries,
			);
			download(`${user}-${year}-${month + 1}.csv`, csvContent);
		}
	};

	return { downloadUser, downloadAll };
}
