import type { Version3Models } from 'jira.js';
import { useEffect, useMemo, useState } from 'react';
import { useConfigStore } from '../../stores/useConfigStore';
import { toLocalDateString } from '../utils/date';
import { useJiraClient } from './useJiraClient';

// Create an enriched type that includes the parent issue
export type EnrichedJiraWorklog = Version3Models.Worklog & {
	issue: Version3Models.Issue;
};

export type GroupedWorklogs = Record<
	string,
	Record<string, EnrichedJiraWorklog[]>
>;

export type UseTimesheetDataResult = {
	data: EnrichedJiraWorklog[] | null;
	isLoading: boolean;
	error: string | null;
	jiraDomain: string;
	issueSummaries: Record<string, string>;
	teamDevelopers: string[] | null;
	users: string[];
	grouped: GroupedWorklogs;
	visibleEntries: [string, Record<string, EnrichedJiraWorklog[]>][];
};

export function useTimesheetData(
	currentYear: number,
	currentMonth: number,
	selectedUser: string,
): UseTimesheetDataResult {
	const [data, setData] = useState<EnrichedJiraWorklog[] | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { config } = useConfigStore();
	const jiraClient = useJiraClient();

	const issueSummaries = useMemo(() => {
		if (!data) return {};
		const summaries: Record<string, string> = {};
		for (const wl of data) {
			if (wl.issue) {
				summaries[wl.issue.id] = wl.issue.fields.summary;
			}
		}
		return summaries;
	}, [data]);

	const teamDevelopers = useMemo(() => {
		// This will be handled by the config store later
		return null;
	}, []);

	useEffect(() => {
		const fetchTimesheetData = async () => {
			if (!jiraClient) {
				setError('Jira client is not configured. Please check your settings.');
				return;
			}

			setIsLoading(true);
			setError(null);

			try {
				const startDate = new Date(currentYear, currentMonth, 1);
				const endDate = new Date(currentYear, currentMonth + 1, 0);

				const jql = `worklogDate >= "${startDate
					.toISOString()
					.substring(0, 10)}" AND worklogDate <= "${endDate
					.toISOString()
					.substring(0, 10)}"`;

				const searchResult =
					await jiraClient.issueSearch.searchForIssuesUsingJql({
						jql,
						fields: ['summary', 'issuetype', 'parent', 'project', 'status'],
						expand: ['worklog'],
						maxResults: 1000,
					});

				const allWorklogs: EnrichedJiraWorklog[] = [];

				if (searchResult.total && searchResult.total > 0) {
					for (const issue of searchResult.issues ?? []) {
						if (issue.fields.worklog?.worklogs) {
							const worklogsWithIssue = issue.fields.worklog.worklogs.map(
								(wl: Version3Models.Worklog): EnrichedJiraWorklog => ({
									...wl,
									issue: issue,
								}),
							);
							allWorklogs.push(...worklogsWithIssue);
						}
					}
				}

				setData(allWorklogs);
			} catch (e) {
				if (e instanceof Error) {
					setError(`Failed to fetch data from Jira: ${e.message}`);
				} else {
					setError('An unknown error occurred.');
				}
			} finally {
				setIsLoading(false);
			}
		};

		fetchTimesheetData();
	}, [currentYear, currentMonth, jiraClient]);

	const users = useMemo(() => {
		if (!data) return [] as string[];
		const unique: Record<string, true> = {};
		for (const wl of data) {
			if (wl.author?.displayName) {
				unique[wl.author.displayName] = true;
			}
		}
		const list = Object.keys(unique);
		return list.sort((a, b) => a.localeCompare(b));
	}, [data]);

	const grouped: GroupedWorklogs = useMemo(() => {
		const map: GroupedWorklogs = {};
		for (const wl of data || []) {
			if (wl.author?.displayName) {
				const user = wl.author.displayName;
				// Use local date to avoid timezone conversion issues
				const date = toLocalDateString(wl.started as string);
				if (!map[user]) map[user] = {};
				if (!map[user][date]) map[user][date] = [];
				map[user][date].push(wl);
			}
		}
		return map;
	}, [data]);

	const visibleEntries = useMemo(() => {
		return Object.entries(grouped).filter(
			([user]) => selectedUser === '' || user === selectedUser,
		);
	}, [grouped, selectedUser]);

	return {
		data,
		isLoading,
		error,
		jiraDomain: config.jiraHost,
		issueSummaries,
		teamDevelopers,
		users,
		grouped,
		visibleEntries,
	};
}
