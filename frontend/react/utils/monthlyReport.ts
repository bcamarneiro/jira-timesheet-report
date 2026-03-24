import type { EnrichedJiraWorklog, GroupedWorklogs } from '../../../types/jira';
import { toLocalDateString } from './date';

export interface MonthlyReportState {
	issueSummaries: Record<string, string>;
	users: string[];
	grouped: GroupedWorklogs;
	visibleEntries: [string, Record<string, EnrichedJiraWorklog[]>][];
}

export function deriveMonthlyReportState(
	data: EnrichedJiraWorklog[] | null,
	selectedUser: string,
	allowedUsersConfig: string,
): MonthlyReportState {
	const allowedEmails = allowedUsersConfig
		? allowedUsersConfig
				.split(',')
				.map((email) => email.trim().toLowerCase())
				.filter(Boolean)
		: [];

	const issueSummaries: Record<string, string> = {};
	for (const wl of data || []) {
		const summary = wl.issue?.fields.summary;
		if (!summary) continue;
		issueSummaries[wl.issue.id] = summary;
		issueSummaries[wl.issue.key] = summary;
	}

	const isUserAllowed = (worklog: EnrichedJiraWorklog): boolean => {
		if (allowedEmails.length === 0) return true;
		const emailAddress = worklog.author?.emailAddress?.toLowerCase();
		return emailAddress ? allowedEmails.includes(emailAddress) : false;
	};

	const users: string[] = [];
	const uniqueUsers: Record<string, true> = {};
	for (const wl of data || []) {
		if (wl.author?.displayName && isUserAllowed(wl)) {
			uniqueUsers[wl.author.displayName] = true;
		}
	}
	users.push(...Object.keys(uniqueUsers).sort((a, b) => a.localeCompare(b)));

	const grouped: GroupedWorklogs = {};
	for (const wl of data || []) {
		if (wl.author?.displayName && isUserAllowed(wl)) {
			const user = wl.author.displayName;
			const date = toLocalDateString(wl.started as string);
			if (!grouped[user]) grouped[user] = {};
			if (!grouped[user][date]) grouped[user][date] = [];
			grouped[user][date].push(wl);
		}
	}

	const visibleEntries = Object.entries(grouped).filter(
		([user]) => selectedUser === '' || user === selectedUser,
	);

	return { issueSummaries, users, grouped, visibleEntries };
}
