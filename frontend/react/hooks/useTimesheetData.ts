import { useEffect, useMemo, useState } from 'react';
import type { JiraIssue } from '../../../types/JiraIssue';
import type { JiraWorklog } from '../../../types/JiraWorklog';
import { useConfigStore } from '../../stores/useConfigStore';
import { useJiraClient } from './useJiraClient';

export type GroupedWorklogs = Record<string, Record<string, JiraWorklog[]>>;

export type UseTimesheetDataResult = {
	data: JiraWorklog[] | null;
	isLoading: boolean;
	error: string | null;
	jiraDomain: string;
	issueSummaries: Record<string, string>;
	teamDevelopers: string[] | null;
	users: string[];
	grouped: GroupedWorklogs;
	visibleEntries: [string, Record<string, JiraWorklog[]>][];
};

export function useTimesheetData(
	currentYear: number,
	currentMonth: number,
	selectedUser: string,
): UseTimesheetDataResult {
	const [data, setData] = useState<JiraWorklog[] | null>(null);
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
						maxResults: 1000,
					});

				const allWorklogs: JiraWorklog[] = [];

				if (searchResult.total > 0) {
					for (const issue of searchResult.issues) {
						const worklogs = await jiraClient.issueWorklogs.getWorklogsForIssue(
							{
								issueIdOrKey: issue.id,
							},
						);
						const worklogsWithIssue = worklogs.worklogs.map((wl) => ({
							...wl,
							issue: issue as JiraIssue,
						}));
						allWorklogs.push(...worklogsWithIssue);
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
			unique[wl.author.displayName] = true;
		}
		let list = Object.keys(unique);
		if (teamDevelopers && teamDevelopers.length > 0) {
			list = list.filter((name) => teamDevelopers.includes(name));
		}
		return list.sort((a, b) => a.localeCompare(b));
	}, [data, teamDevelopers]);

	const grouped: GroupedWorklogs = useMemo(() => {
		const map: GroupedWorklogs = {};
		for (const wl of data || []) {
			const user = wl.author.displayName;
			const date = new Date(wl.started).toISOString().substring(0, 10);
			if (!map[user]) map[user] = {};
			if (!map[user][date]) map[user][date] = [];
			map[user][date].push(wl);
		}
		return map;
	}, [data]);

	const visibleEntries = useMemo(() => {
		return Object.entries(grouped)
			.filter(([user]) => selectedUser === '' || user === selectedUser)
			.filter(
				([user]) =>
					!teamDevelopers || (teamDevelopers as string[]).includes(user),
			);
	}, [grouped, selectedUser, teamDevelopers]);

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
