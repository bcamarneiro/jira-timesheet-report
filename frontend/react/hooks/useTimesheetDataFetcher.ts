import { useEffect } from 'react';
import type { JiraWorklog } from '../../services/jiraClient';
import type { EnrichedJiraWorklog } from '../../stores/useTimesheetStore';
import { useTimesheetStore } from '../../stores/useTimesheetStore';
import { useJiraClient } from './useJiraClient';

/**
 * Hook that fetches timesheet data and populates the Zustand store.
 * This replaces the old useTimesheetData hook which returned local state.
 */
export function useTimesheetDataFetcher() {
	const jiraClient = useJiraClient();
	const currentYear = useTimesheetStore((state) => state.currentYear);
	const currentMonth = useTimesheetStore((state) => state.currentMonth);
	const setData = useTimesheetStore((state) => state.setData);
	const setLoading = useTimesheetStore((state) => state.setLoading);
	const setError = useTimesheetStore((state) => state.setError);

	useEffect(() => {
		const fetchTimesheetData = async () => {
			if (!jiraClient) {
				setError('Jira client is not configured. Please check your settings.');
				return;
			}

			setLoading(true);
			setError(null);

			try {
				const startDate = new Date(currentYear, currentMonth, 1);
				const endDate = new Date(currentYear, currentMonth + 1, 0);

				const jql = `worklogDate >= "${startDate
					.toISOString()
					.substring(0, 10)}" AND worklogDate <= "${endDate
					.toISOString()
					.substring(0, 10)}"`;

				const searchResult = await jiraClient.searchIssues(
					jql,
					['summary', 'issuetype', 'parent', 'project', 'status'],
					['worklog'],
					1000,
				);

				const allWorklogs: EnrichedJiraWorklog[] = [];

				if (searchResult.total && searchResult.total > 0) {
					for (const issue of searchResult.issues ?? []) {
						if (issue.fields.worklog?.worklogs) {
							const worklogsWithIssue = issue.fields.worklog.worklogs.map(
								(wl: JiraWorklog): EnrichedJiraWorklog => ({
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
				setLoading(false);
			}
		};

		fetchTimesheetData();
	}, [currentYear, currentMonth, jiraClient, setData, setLoading, setError]);
}
